import type { Team } from "../../data/";
import type { MatchInput } from "../simulation/match";

type TeamId = number;

type Game = {
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
};

type GameLocUnknown = {
  team1: Team;
  team2: Team;
  date: Date;
};

type TeamGameRecord = Record<TeamId,
  {
    div: Record<TeamId, Game[]>;
    conf4: Record<TeamId, Game[]>,
    conf3: Record<TeamId, Game[]>,
    nonConf: Record<TeamId, Game[]>,
  }>;

const DIV_SERIES = {
  series: 4,
  games_per_series: 4,
};
const CONF_SERIES_4 = {
  series: 6,
  games_per_series: 4,
};
const CONF_SERIES_3 = {
  series: 4,
  games_per_series: 3,
};
const NON_CONF_SERIES = {
  series: 15,
  games_per_series: 2,
};

const DIV_NAMES = {
  Eastern: ['Atlantic', 'Central', 'Southeast'],
  Western: ['Northwest', 'Pacific', 'Southwest'],
} as const;

const TEAMS_PER_DIV = 5;

const TOTAL_GAMES = 82;

export function generateSchedule(
  teams: Team[],
  seasonStage: 'regular_season' | 'playoffs',
  year: number
): MatchInput[] {
  if (seasonStage === 'regular_season') {
    const schedule = createSchedule(teams, year);
    verifyScheduleConstraints(teams, schedule);
    printScheduleAnalysis(teams, schedule);

    // return schedule.map(game => ({
    //   ...game,
    //   seasonStage,
    // }));
    return [];
  }

  throw new Error(`Unsupported season stage: ${seasonStage}`);
}

function createGame(homeTeam: Team, awayTeam: Team): Game {
  return {
    homeTeam,
    awayTeam,
    date: new Date(), // temp, will be replaced later
  };
}

function createGameLocUnknown(team1: Team, team2: Team): GameLocUnknown {
  return {
    team1,
    team2,
    date: new Date(), // temp, will be replaced later
  };
}

function generatePatternWithOffset(year: number): Array<{ team: number, opponents: { four: number[], three: number[]; }; }> {
  const n = TEAMS_PER_DIV;
  const offset = year % n; // Creates a rotation based on division size
  const pattern: Array<{ team: number, opponents: { four: number[], three: number[]; }; }> = [];

  for (let team = 0; team < n; team++) {
    const fourGameOpponents = [
      (team + offset) % n,
      (team + offset + 1) % n,
      (team + offset + 2) % n,
    ];

    const threeGameOpponents = [
      (team + offset + 3) % n,
      (team + offset + 4) % n,
    ];

    pattern.push({
      team,
      opponents: { four: fourGameOpponents, three: threeGameOpponents }
    });
  }

  return pattern;
}


const createSchedule = (teams: Team[], year: number): TeamGameRecord => {
  const allGames: Game[] = [];
  const teamGameRecord: TeamGameRecord = {};

  // initialize counters
  for (const team of teams) {
    teamGameRecord[team.teamInfo.id] = {
      div: {},
      conf4: {},
      conf3: {},
      nonConf: {},
    };
  }

  console.log("Processing division games...");
  for (const team of teams) {
    const divisionOpponents = teams.filter(t =>
      t.teamInfo.id !== team.teamInfo.id &&
      t.teamInfo.division === team.teamInfo.division
    );

    for (const opp of divisionOpponents) {
      const teamId = team.teamInfo.id;
      const oppId = opp.teamInfo.id;
      const counter = teamGameRecord[teamId];
      // check if we've already added div opp
      if (counter.div[oppId]) continue;
      const games: Game[] = [
        createGame(team, opp),
        createGame(team, opp),
        createGame(opp, team),
        createGame(opp, team),
      ];

      allGames.push(...games);
      teamGameRecord[teamId].div[oppId] = games;
      teamGameRecord[oppId].div[teamId] = games;
    }
  }

  console.log("Processing conference games...");
  const conferenceTeams = new Map<string, Team[]>();
  for (const team of teams) {
    const conf = team.teamInfo.conference;
    if (!conferenceTeams.has(conf)) {
      conferenceTeams.set(conf, []);
    }
    conferenceTeams.get(conf)!.push(team);
  }

  // For each conference, create a balanced schedule
  for (const [_, teams] of conferenceTeams.entries()) {
    const { games, locUnknowns } = createConferenceSchedule(teams, teamGameRecord, year);
    allGames.push(...games);
    balanceHomeAwayGames(teams, teamGameRecord, locUnknowns);
  }

  // Add non-conference games
  const nonConferenceGames = createNonConferenceSchedule(teams, teamGameRecord);
  allGames.push(...nonConferenceGames);

  return teamGameRecord;
};

function createConferenceSchedule(teams: Team[], teamGameRecord: TeamGameRecord, year: number): { games: Game[], locUnknowns: GameLocUnknown[]; } {
  const allGames: Game[] = [];
  const locUnknowns: GameLocUnknown[] = [];

  // When creating 3-game series, use a simple fixed pattern
  const createThreeGameSeries = (team1: Team, team2: Team): { games: Game[], locUnknown: GameLocUnknown; } => {
    const games = [
      createGame(team1, team2),
      createGame(team2, team1),
    ];
    const locUnknown = createGameLocUnknown(team1, team2);
    return {
      games,
      locUnknown,
    };
  };

  // Group teams by division (for a single conference)
  const divisions = new Map<string, Team[]>();
  const conference = teams[0].teamInfo.conference as keyof typeof DIV_NAMES;
  const divNames = DIV_NAMES[conference];

  for (const div of divNames) {
    divisions.set(div, []);
  }

  // Sort teams into divisions
  for (const team of teams) {
    const divTeams = divisions.get(team.teamInfo.division);
    if (!divTeams) {
      throw new Error(`Invalid division: ${team.teamInfo.division} for team ${team.teamInfo.id}`);
    }
    divTeams.push(team);
  }

  const divisionsList = Array.from(divisions.entries());

  // For each division pairing
  for (let i = 0; i < divisionsList.length; i++) {
    const [div1Name, div1Teams] = divisionsList[i];

    if (div1Teams.length !== TEAMS_PER_DIV) {
      throw new Error(`Division ${div1Name} has ${div1Teams.length} teams instead of ${TEAMS_PER_DIV}`);
    }

    for (let j = i + 1; j < divisionsList.length; j++) {
      const [div2Name, div2Teams] = divisionsList[j];

      if (div2Teams.length !== TEAMS_PER_DIV) {
        throw new Error(`Division ${div2Name} has ${div2Teams.length} teams instead of ${TEAMS_PER_DIV}`);
      }

      console.log(`\nProcessing ${div1Name} vs ${div2Name}`);

      // Fixed pattern for 4-game and 3-game series
      const pattern = generatePatternWithOffset(year);

      // Apply the pattern for each team in div1
      for (const { team: teamIdx, opponents } of pattern) {
        const team1 = div1Teams[teamIdx];
        if (!team1) {
          throw new Error(`No team found at index ${teamIdx} in division ${div1Name}`);
        }

        // Schedule 4-game series
        for (const oppIdx of opponents.four) {
          const team2 = div2Teams[oppIdx];
          if (!team2) {
            throw new Error(`No team found at index ${oppIdx} in division ${div2Name}`);
          }

          const games = [
            createGame(team1, team2),
            createGame(team1, team2),
            createGame(team2, team1),
            createGame(team2, team1),
          ];

          allGames.push(...games);
          teamGameRecord[team1.teamInfo.id].conf4[team2.teamInfo.id] = games;
          teamGameRecord[team2.teamInfo.id].conf4[team1.teamInfo.id] = games;
        }

        // Schedule 3-game series
        for (const oppIdx of opponents.three) {
          const team2 = div2Teams[oppIdx];
          if (!team2) {
            throw new Error(`No team found at index ${oppIdx} in division ${div2Name}`);
          }

          const { games, locUnknown } = createThreeGameSeries(team1, team2);

          allGames.push(...games);
          teamGameRecord[team1.teamInfo.id].conf3[team2.teamInfo.id] = games;
          teamGameRecord[team2.teamInfo.id].conf3[team1.teamInfo.id] = games;
          locUnknowns.push(locUnknown);
        }
      }
    }
  }

  return { games: allGames, locUnknowns };
}

function createNonConferenceSchedule(teams: Team[], teamGameRecord: TeamGameRecord): Game[] {
  const allGames: Game[] = [];
  for (const team of teams) {
    const nonConfOpponents = teams.filter(t =>
      t.teamInfo.id !== team.teamInfo.id &&
      t.teamInfo.conference !== team.teamInfo.conference
    );

    for (const opp of nonConfOpponents) {
      // Check if we've already added games between these teams
      const teamId = team.teamInfo.id;
      const oppId = opp.teamInfo.id;
      const counter = teamGameRecord[teamId];
      if (counter.nonConf[oppId]) continue;

      const games = [
        createGame(team, opp),
        createGame(opp, team),
      ];

      allGames.push(...games);
      teamGameRecord[teamId].nonConf[oppId] = games;
      teamGameRecord[oppId].nonConf[teamId] = games;
    }
  }
  return allGames;
}

function balanceHomeAwayGames(teams: Team[], teamGameRecord: TeamGameRecord, locUnknowns: GameLocUnknown[]): void {
  const countGames = (teamId: TeamId) => {
    const records = teamGameRecord[teamId];
    let homeGames = 0;
    let awayGames = 0;

    // Only need to count conf3 games since other series are already balanced
    const conf3Games = Object.values(records.conf3).flat();
    for (const game of conf3Games) {
      if (game.homeTeam.teamInfo.id === teamId) homeGames++;
      if (game.awayTeam.teamInfo.id === teamId) awayGames++;
    }

    return { homeGames, awayGames };
  };

  const calculateImbalance = () => {
    let totalImbalance = 0;
    for (const team of teams) {
      const { homeGames, awayGames } = countGames(team.teamInfo.id);
      totalImbalance += Math.abs(homeGames - awayGames);
    }
    return totalImbalance;
  };

  // Initial conversion of unknowns to games
  for (const unknown of locUnknowns) {
    const game = createGame(unknown.team1, unknown.team2);
    const team1Id = unknown.team1.teamInfo.id;
    const team2Id = unknown.team2.teamInfo.id;

    teamGameRecord[team1Id].conf3[team2Id].push(game);
    teamGameRecord[team2Id].conf3[team1Id] = [...teamGameRecord[team1Id].conf3[team2Id]];
  }

  let currentImbalance = calculateImbalance();
  let iterations = 0;
  const MAX_ITERATIONS = 1000;

  // Keep trying to improve balance until we can't or hit iteration limit
  while (currentImbalance > 0 && iterations < MAX_ITERATIONS) {
    let improved = false;

    // Try swapping home/away for each unknown game
    for (let i = 0; i < locUnknowns.length; i++) {
      const unknown = locUnknowns[i];
      const team1Id = unknown.team1.teamInfo.id;
      const team2Id = unknown.team2.teamInfo.id;

      // Create a swapped version of the game
      const swappedGame = createGame(unknown.team2, unknown.team1);

      // Store original game
      const originalGame = teamGameRecord[team1Id].conf3[team2Id].pop()!;

      // Try the swap
      teamGameRecord[team1Id].conf3[team2Id].push(swappedGame);
      teamGameRecord[team2Id].conf3[team1Id] = [...teamGameRecord[team1Id].conf3[team2Id]];

      const newImbalance = calculateImbalance();

      if (newImbalance < currentImbalance) {
        // Keep the swap
        locUnknowns[i] = { team1: unknown.team2, team2: unknown.team1, date: unknown.date };
        currentImbalance = newImbalance;
        improved = true;
        break;
      } else {
        // Restore original game
        teamGameRecord[team1Id].conf3[team2Id].pop();
        teamGameRecord[team1Id].conf3[team2Id].push(originalGame);
        teamGameRecord[team2Id].conf3[team1Id] = [...teamGameRecord[team1Id].conf3[team2Id]];
      }
    }

    if (!improved) break;
    iterations++;
  }

  if (iterations === MAX_ITERATIONS) {
    console.warn(`Warning: Home/away balance may not be optimal (stopped after ${MAX_ITERATIONS} iterations)`);
  }
}

function verifyScheduleConstraints(teams: Team[], teamGameRecord: TeamGameRecord): void {
  console.log('\n=== Schedule Constraint Verification ===\n');

  // Calculate expected games from constants
  const expectedDivGames = DIV_SERIES.series * DIV_SERIES.games_per_series;
  const expectedConf4Games = CONF_SERIES_4.series * CONF_SERIES_4.games_per_series;
  const expectedConf3Games = CONF_SERIES_3.series * CONF_SERIES_3.games_per_series;
  const expectedNonConfGames = NON_CONF_SERIES.series * NON_CONF_SERIES.games_per_series;
  const expectedConfGames = expectedDivGames + expectedConf4Games + expectedConf3Games;

  for (const team of teams) {
    const teamId = team.teamInfo.id;
    const records = teamGameRecord[teamId];

    const divGames = Object.entries(records.div)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.division !== team.teamInfo.division) {
          throw new Error(`Team ${teamId} has division games scheduled with non-division team ${oppId}`);
        }
        return total + games.length;
      }, 0);

    const fourGameConfGames = Object.entries(records.conf4)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.conference !== team.teamInfo.conference) {
          throw new Error(`Team ${teamId} has conference games scheduled with non-conference team ${oppId}`);
        }
        return total + games.length;
      }, 0);

    const threeGameConfGames = Object.entries(records.conf3)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.conference !== team.teamInfo.conference) {
          throw new Error(`Team ${teamId} has conference games scheduled with non-conference team ${oppId}`);
        }
        return total + games.length;
      }, 0);

    const nonConfGames = Object.entries(records.nonConf)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.conference === team.teamInfo.conference) {
          throw new Error(`Team ${teamId} has non-conference games scheduled with conference team ${oppId}`);
        }
        return total + games.length;
      }, 0);

    if (threeGameConfGames !== expectedConf3Games ||
      fourGameConfGames !== expectedConf4Games ||
      divGames !== expectedDivGames ||
      nonConfGames !== expectedNonConfGames) {
      throw new Error(
        `Team ${team.teamInfo.name} has ${threeGameConfGames} 3-game conference series (expected ${expectedConf3Games}), ` +
        `${fourGameConfGames} 4-game conference series (expected ${expectedConf4Games}), ` +
        `${divGames} division games (expected ${expectedDivGames}), and ` +
        `${nonConfGames} non-conference games (expected ${expectedNonConfGames})`
      );
    }

    // Count number of non-conf opponents
    const nonConfOpponentCount = Object.keys(records.nonConf).length;
    const expectedNonConfOpponents = teams.filter(t => t.teamInfo.conference !== team.teamInfo.conference).length;
    if (nonConfOpponentCount !== expectedNonConfOpponents) {
      throw new Error(
        `Team ${team.teamInfo.name} plays ${nonConfOpponentCount} non-conference opponents (expected ${expectedNonConfOpponents})`
      );
    }

    // Verify totals using constants
    const totalConfGames = divGames + fourGameConfGames + threeGameConfGames;

    if (totalConfGames !== expectedConfGames) {
      throw new Error(`Team ${team.teamInfo.name} has ${totalConfGames} conference games (expected ${expectedConfGames})`);
    }

    // Verify total games matches TOTAL_GAMES constant
    const totalGames = totalConfGames + nonConfGames;
    if (totalGames !== TOTAL_GAMES) {
      throw new Error(`Team ${team.teamInfo.name} has ${totalGames} total games (expected ${TOTAL_GAMES})`);
    }
  }

  console.log('✅ Schedule constraints verified');
}

function printScheduleAnalysis(teams: Team[], teamGameRecord: TeamGameRecord) {
  const homeGames = new Map<TeamId, number>();
  const awayGames = new Map<TeamId, number>();
  const conferenceGames = new Map<TeamId, { east: number, west: number; }>();
  const teamPairings = new Map<string, number>();

  // Initialize counters
  for (const team of teams) {
    homeGames.set(team.teamInfo.id, 0);
    awayGames.set(team.teamInfo.id, 0);
    conferenceGames.set(team.teamInfo.id, { east: 0, west: 0 });
  }

  // Count games from all categories
  for (const team of teams) {
    const teamId = team.teamInfo.id;
    const records = teamGameRecord[teamId];

    const allGames = [
      ...Object.values(records.div).flat(),
      ...Object.values(records.conf4).flat(),
      ...Object.values(records.conf3).flat(),
      ...Object.values(records.nonConf).flat(),
    ];

    for (const game of allGames) {
      const homeId = game.homeTeam.teamInfo.id;
      const awayId = game.awayTeam.teamInfo.id;

      // Only count each game once (when processing the home team)
      if (homeId === teamId) {
        // Home/Away counts
        homeGames.set(homeId, (homeGames.get(homeId) || 0) + 1);
        awayGames.set(awayId, (awayGames.get(awayId) || 0) + 1);

        // Conference counts
        const homeConf = game.homeTeam.teamInfo.conference;
        const awayConf = game.awayTeam.teamInfo.conference;

        const homeTeamGames = conferenceGames.get(homeId)!;
        const awayTeamGames = conferenceGames.get(awayId)!;

        if (awayConf === 'Eastern') homeTeamGames.east++;
        if (awayConf === 'Western') homeTeamGames.west++;
        if (homeConf === 'Eastern') awayTeamGames.east++;
        if (homeConf === 'Western') awayTeamGames.west++;

        // Track team pairings
        const pairingKey = [homeId, awayId].sort().join('-');
        teamPairings.set(pairingKey, (teamPairings.get(pairingKey) || 0) + 1);
      }
    }
  }

  // Print results
  console.log('\n=== Schedule Analysis ===\n');

  console.log('Home/Away Game Distribution:');
  for (const team of teams) {
    console.log(`${team.teamInfo.name}: ${homeGames.get(team.teamInfo.id)} home, ${awayGames.get(team.teamInfo.id)} away`);
  }

  console.log('\nCeltics Home/Away Distribution:');
  const celtics = teams.find(t => t.teamInfo.name === 'Celtics');
  if (celtics) {
    for (const opponent of teams) {
      if (celtics.teamInfo.id !== opponent.teamInfo.id) {
        const pairingKey = [celtics.teamInfo.id, opponent.teamInfo.id].sort().join('-');
        const totalGames = teamPairings.get(pairingKey) || 0;
        if (totalGames > 0) {
          const records = teamGameRecord[celtics.teamInfo.id];
          const allGames = [
            ...Object.values(records.div).flat(),
            ...Object.values(records.conf4).flat(),
            ...Object.values(records.conf3).flat(),
            ...Object.values(records.nonConf).flat(),
          ];

          const homeCount = allGames.filter(g =>
            g.homeTeam.teamInfo.id === celtics.teamInfo.id &&
            g.awayTeam.teamInfo.id === opponent.teamInfo.id
          ).length;
          const awayCount = allGames.filter(g =>
            g.awayTeam.teamInfo.id === celtics.teamInfo.id &&
            g.homeTeam.teamInfo.id === opponent.teamInfo.id
          ).length;
          console.log(`  vs ${opponent.teamInfo.name}: ${homeCount} home, ${awayCount} away`);
        }
      }
    }
  }

  return;

  // console.log('\nTeam Pairing Distribution:');
  // teams.forEach(team1 => {
  //   console.log(`\n${team1.teamInfo.name} plays:`);
  //   teams.forEach(team2 => {
  //     if (team1.teamInfo.id !== team2.teamInfo.id) {
  //       const pairingKey = [team1.teamInfo.id, team2.teamInfo.id].sort().join('-');
  //       const games = teamPairings.get(pairingKey) || 0;
  //       if (games > 0) {
  //         const sameDiv = team1.teamInfo.division === team2.teamInfo.division;
  //         const sameConf = team1.teamInfo.conference === team2.teamInfo.conference;
  //         const relationship = sameDiv ? "division" : sameConf ? "conference" : "non-conference";
  //         console.log(`  ${team2.teamInfo.name}: ${games} games (${relationship})`);
  //       }
  //     }
  //   });
  // });

  // console.log('\nConference Game Distribution:');
  // teams.forEach(team => {
  //   const games = conferenceGames.get(team.teamInfo.id)!;
  //   console.log(`${team.teamInfo.name}: ${games.east} vs East, ${games.west} vs West`);
  // });

  // console.log('\nSchedule Date Range:');
  // const dates = schedule.map(g => g.date.getTime());
  // const firstGame = new Date(Math.min(...dates));
  // const lastGame = new Date(Math.max(...dates));
  // console.log(`Season runs from ${firstGame.toDateString()} to ${lastGame.toDateString()}`);

  // console.log('\nGames per month:');
  // const monthCounts = new Map<string, number>();
  // schedule.forEach(game => {
  //   const monthKey = game.date.toLocaleString('default', { month: 'long', year: 'numeric' });
  //   monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  // });

  // Array.from(monthCounts.entries())
  //   .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
  //   .forEach(([month, count]) => {
  //     console.log(`${month}: ${count} games`);
  //   });
}
