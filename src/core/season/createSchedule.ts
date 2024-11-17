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

    return schedule.map(game => ({
      ...game,
      seasonStage,
    }));
  }

  throw new Error(`Unsupported season stage: ${seasonStage}`);
}

function createGames(
  team1: Team,
  team2: Team,
  numGames: number,
): { games: Game[]; locUnknowns: GameLocUnknown[]; } {
  const createGame = (homeTeam: Team, awayTeam: Team): Game => ({
    homeTeam,
    awayTeam,
    date: new Date(), // temp, will be replaced later
  });

  const createGameLocUnknown = (team1: Team, team2: Team): GameLocUnknown => ({
    team1,
    team2,
    date: new Date(), // temp, will be replaced later
  });

  if (numGames === 4) {
    return {
      games: [
        createGame(team1, team2),
        createGame(team1, team2),
        createGame(team2, team1),
        createGame(team2, team1),
      ],
      locUnknowns: [],
    };
  }

  if (numGames === 3) {
    return {
      games: [
        createGame(team1, team2),
        createGame(team2, team1),
      ],
      locUnknowns: [createGameLocUnknown(team1, team2)],
    };
  }

  if (numGames === 2) {
    return {
      games: [createGame(team1, team2), createGame(team2, team1)],
      locUnknowns: [],
    };
  }

  if (numGames === 1) {
    return {
      games: [createGame(team1, team2)],
      locUnknowns: [],
    };
  }

  throw new Error(`Unsupported number of games: ${numGames}`);
};

const createSchedule = (teams: Team[], year: number): Game[] => {
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
      // check if we've already added div opp
      const teamId = team.teamInfo.id;
      const oppId = opp.teamInfo.id;
      const counter = teamGameRecord[teamId];
      if (counter.div[oppId]) continue;
      const games: Game[] = createGames(team, opp, DIV_SERIES.games_per_series).games;

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
    const { games, locUnknowns } = createConferenceSchedule(teams, teamGameRecord);
    allGames.push(...games);
    const balancedGames = balanceHomeAwayGames(teams, locUnknowns);
    allGames.push(...balancedGames);
  }

  // Add non-conference games
  const nonConferenceGames = createNonConferenceSchedule(teams, teamGameRecord);
  allGames.push(...nonConferenceGames);

  return allGames;
};


function createConferenceSchedule(teams: Team[], teamGameRecord: TeamGameRecord): { games: Game[], locUnknowns: GameLocUnknown[]; } {
  const allGames: Game[] = [];
  const locUnknowns: GameLocUnknown[] = [];

  // When creating 3-game series, use a simple fixed pattern
  const createThreeGameSeries = (team1: Team, team2: Team): { games: Game[], locUnknown: GameLocUnknown; } => {
    const result = createGames(team1, team2, CONF_SERIES_3.games_per_series);
    return {
      games: result.games,
      locUnknown: result.locUnknowns[0],
    };
  };

  // Group teams by division (for a single conference)
  const divisions = new Map<string, Team[]>();
  const conference = teams[0].teamInfo.conference; // All teams should be from same conference
  const divNames = conference === 'Eastern'
    ? ['Atlantic', 'Central', 'Southeast']
    : ['Northwest', 'Pacific', 'Southwest'];

  divNames.forEach(div => divisions.set(div, []));

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

    if (div1Teams.length !== 5) {
      throw new Error(`Division ${div1Name} has ${div1Teams.length} teams instead of 5`);
    }

    for (let j = i + 1; j < divisionsList.length; j++) {
      const [div2Name, div2Teams] = divisionsList[j];

      if (div2Teams.length !== 5) {
        throw new Error(`Division ${div2Name} has ${div2Teams.length} teams instead of 5`);
      }

      console.log(`\nProcessing ${div1Name} vs ${div2Name}`);

      // Fixed pattern for 4-game and 3-game series
      const pattern = [
        { team: 0, opponents: { four: [0, 1, 2], three: [3, 4] } },
        { team: 1, opponents: { four: [1, 2, 3], three: [4, 0] } },
        { team: 2, opponents: { four: [2, 3, 4], three: [0, 1] } },
        { team: 3, opponents: { four: [3, 4, 0], three: [1, 2] } },
        { team: 4, opponents: { four: [4, 0, 1], three: [2, 3] } },
      ];

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

          console.log(`4-game series: ${team1.teamInfo.id} vs ${team2.teamInfo.id}`);

          const games = createGames(team1, team2, CONF_SERIES_4.games_per_series).games;

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

          console.log(`3-game series: ${team1.teamInfo.id} vs ${team2.teamInfo.id}`);

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

      const games = createGames(team, opp, NON_CONF_SERIES.games_per_series).games;

      allGames.push(...games);
      teamGameRecord[teamId].nonConf[oppId] = games;
      teamGameRecord[oppId].nonConf[teamId] = games;
    }
  }
  return allGames;
}

function balanceHomeAwayGames(teams: Team[], locUnknowns: GameLocUnknown[]): Game[] {
  const countGames = (currentGames: Game[]) => {
    const homeGames = new Map<TeamId, number>();
    const awayGames = new Map<TeamId, number>();

    for (const team of teams) {
      homeGames.set(team.teamInfo.id, 0);
      awayGames.set(team.teamInfo.id, 0);
    }

    for (const game of currentGames) {
      homeGames.set(game.homeTeam.teamInfo.id, (homeGames.get(game.homeTeam.teamInfo.id) || 0) + 1);
      awayGames.set(game.awayTeam.teamInfo.id, (awayGames.get(game.awayTeam.teamInfo.id) || 0) + 1);
    }

    return { homeGames, awayGames };
  };

  const calculateImbalance = (currentGames: Game[]) => {
    const { homeGames, awayGames } = countGames(currentGames);
    let totalImbalance = 0;

    for (const team of teams) {
      const diff = Math.abs((homeGames.get(team.teamInfo.id) || 0) - (awayGames.get(team.teamInfo.id) || 0));
      totalImbalance += diff;
    }

    return totalImbalance;
  };

  // Initial conversion of unknowns to games
  let balancedGames = locUnknowns.map(unknown => {
    return createGames(unknown.team1, unknown.team2, 1).games[0];
  });

  let currentImbalance = calculateImbalance(balancedGames);
  let iterations = 0;
  const MAX_ITERATIONS = 1000;

  // Keep trying to improve balance until we can't or hit iteration limit
  while (currentImbalance > 0 && iterations < MAX_ITERATIONS) {
    console.log(`Iteration ${iterations}: ${currentImbalance}`);
    let improved = false;

    // Try swapping home/away for each unknown game
    for (let i = 0; i < balancedGames.length; i++) {
      const originalGame = balancedGames[i];
      const swappedGame = createGames(originalGame.awayTeam, originalGame.homeTeam, 1).games[0];

      // Temporarily apply swap
      const testGames = [...balancedGames.slice(0, i), swappedGame, ...balancedGames.slice(i + 1)];
      const newImbalance = calculateImbalance(testGames);

      // If this swap improves balance, keep it
      if (newImbalance < currentImbalance) {
        balancedGames[i] = swappedGame;
        currentImbalance = newImbalance;
        improved = true;
        break;
      }
    }

    // If no improvements were found in this iteration, we're done
    if (!improved) break;

    iterations++;
  }

  if (currentImbalance > 0) {
    throw new Error(`Failed to balance home/away games after ${MAX_ITERATIONS} iterations`);
  }

  return balancedGames;
}

function verifyScheduleConstraints(teams: Team[], games: Game[]): void {
  console.log('\n=== Schedule Constraint Verification ===\n');

  // Build game record for analysis
  const teamGameRecord: TeamGameRecord = {};
  for (const team of teams) {
    teamGameRecord[team.teamInfo.id] = {
      div: {},
      conf4: {},
      conf3: {},
      nonConf: {},
    };
  }

  // Categorize each game
  for (const game of games) {
    const homeId = game.homeTeam.teamInfo.id;
    const awayId = game.awayTeam.teamInfo.id;
    const homeTeam = game.homeTeam;
    const awayTeam = game.awayTeam;

    // Same division
    if (homeTeam.teamInfo.division === awayTeam.teamInfo.division) {
      if (!teamGameRecord[homeId].div[awayId]) {
        teamGameRecord[homeId].div[awayId] = [];
        teamGameRecord[awayId].div[homeId] = [];
      }
      teamGameRecord[homeId].div[awayId].push(game);
      teamGameRecord[awayId].div[homeId].push(game);
    }
    // Same conference, different division
    else if (homeTeam.teamInfo.conference === awayTeam.teamInfo.conference) {
      // Check if it's part of a 4-game or 3-game series
      const existingFourGame = teamGameRecord[homeId].conf4[awayId];
      const existingThreeGame = teamGameRecord[homeId].conf3[awayId];

      if (existingFourGame) {
        teamGameRecord[homeId].conf4[awayId].push(game);
        teamGameRecord[awayId].conf4[homeId].push(game);
      }
      else if (existingThreeGame) {
        teamGameRecord[homeId].conf3[awayId].push(game);
        teamGameRecord[awayId].conf3[homeId].push(game);
      }
      else {
        // Start new series based on expected number of games
        const gamesWithTeams = games.filter(g =>
          (g.homeTeam.teamInfo.id === homeId && g.awayTeam.teamInfo.id === awayId) ||
          (g.homeTeam.teamInfo.id === awayId && g.awayTeam.teamInfo.id === homeId)
        );

        if (gamesWithTeams.length === 4) {
          teamGameRecord[homeId].conf4[awayId] = [game];
          teamGameRecord[awayId].conf4[homeId] = [game];
        } else {
          teamGameRecord[homeId].conf3[awayId] = [game];
          teamGameRecord[awayId].conf3[homeId] = [game];
        }
      }
    }
    // Different conferences
    else {
      if (!teamGameRecord[homeId].nonConf[awayId]) {
        teamGameRecord[homeId].nonConf[awayId] = [];
        teamGameRecord[awayId].nonConf[homeId] = [];
      }
      teamGameRecord[homeId].nonConf[awayId].push(game);
      teamGameRecord[awayId].nonConf[homeId].push(game);
    }
  }

  for (const team of teams) {
    const teamId = team.teamInfo.id;
    const records = teamGameRecord[teamId];

    // Count division games (should be 16: 4 games × 4 opponents)
    const divGames = Object.entries(records.div)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.division !== team.teamInfo.division) {
          throw new Error(`Team ${teamId} has division games scheduled with non-division team ${oppId}`);
        }
        return total + games.length;
      }, 0);

    // Count 4-game conference series (should be 24: 4 games × 6 opponents)
    const fourGameConfGames = Object.entries(records.conf4)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.conference !== team.teamInfo.conference) {
          throw new Error(`Team ${teamId} has conference games scheduled with non-conference team ${oppId}`);
        }
        return total + games.length;
      }, 0);

    // Count 3-game conference series (should be 12: 3 games × 4 opponents)
    const threeGameConfGames = Object.entries(records.conf3)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.conference !== team.teamInfo.conference) {
          throw new Error(`Team ${teamId} has conference games scheduled with non-conference team ${oppId}`);
        }
        return total + games.length;
      }, 0);

    // Count non-conference games (should be 2 games per non-conf opponent)
    const nonConfGames = Object.entries(records.nonConf)
      .reduce((total, [oppId, games]) => {
        const opponent = teams.find(t => t.teamInfo.id === Number(oppId));
        if (!opponent || opponent.teamInfo.conference === team.teamInfo.conference) {
          throw new Error(`Team ${teamId} has non-conference games scheduled with conference team ${oppId}`);
        }
        if (games.length !== 2) {
          throw new Error(`Team ${teamId} plays ${games.length} games with non-conference team ${oppId} (expected 2)`);
        }
        return total + games.length;
      }, 0);

    // Verify conference game totals
    if (threeGameConfGames !== 12 || fourGameConfGames !== 24 || divGames !== 16) {
      throw new Error(
        `Team ${team.teamInfo.name} has ${threeGameConfGames} 3-game conference series (expected 12), ` +
        `${fourGameConfGames} 4-game conference series (expected 24), and ${divGames} division games (expected 16)`
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

    // Verify totals
    const totalConfGames = divGames + fourGameConfGames + threeGameConfGames;
    const expectedConfGames = 52; // 16 + 24 + 12
    const expectedNonConfGames = 30;

    if (totalConfGames !== expectedConfGames) {
      throw new Error(`Team ${team.teamInfo.name} has ${totalConfGames} conference games (expected ${expectedConfGames})`);
    }

    if (nonConfGames !== expectedNonConfGames) {
      throw new Error(`Team ${team.teamInfo.name} has ${nonConfGames} non-conference games (expected ${expectedNonConfGames})`);
    }
  }

  console.log('✅ Schedule constraints verified');
}

function printScheduleAnalysis(teams: Team[], schedule: Game[]) {
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

  // Count games
  for (const game of schedule) {
    const homeId = game.homeTeam.teamInfo.id;
    const awayId = game.awayTeam.teamInfo.id;

    // Home/Away counts
    homeGames.set(homeId, homeGames.get(homeId)! + 1);
    awayGames.set(awayId, awayGames.get(awayId)! + 1);

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
          const homeCount = schedule.filter(g =>
            g.homeTeam.teamInfo.id === celtics.teamInfo.id &&
            g.awayTeam.teamInfo.id === opponent.teamInfo.id
          ).length;
          const awayCount = schedule.filter(g =>
            g.awayTeam.teamInfo.id === celtics.teamInfo.id &&
            g.homeTeam.teamInfo.id === opponent.teamInfo.id
          ).length;
          console.log(`  vs ${opponent.teamInfo.name}: ${homeCount} home, ${awayCount} away`);
        }
      }
    }
  }

  return;

  console.log('\nTeam Pairing Distribution:');
  teams.forEach(team1 => {
    console.log(`\n${team1.teamInfo.name} plays:`);
    teams.forEach(team2 => {
      if (team1.teamInfo.id !== team2.teamInfo.id) {
        const pairingKey = [team1.teamInfo.id, team2.teamInfo.id].sort().join('-');
        const games = teamPairings.get(pairingKey) || 0;
        if (games > 0) {
          const sameDiv = team1.teamInfo.division === team2.teamInfo.division;
          const sameConf = team1.teamInfo.conference === team2.teamInfo.conference;
          const relationship = sameDiv ? "division" : sameConf ? "conference" : "non-conference";
          console.log(`  ${team2.teamInfo.name}: ${games} games (${relationship})`);
        }
      }
    });
  });

  console.log('\nConference Game Distribution:');
  teams.forEach(team => {
    const games = conferenceGames.get(team.teamInfo.id)!;
    console.log(`${team.teamInfo.name}: ${games.east} vs East, ${games.west} vs West`);
  });

  console.log('\nSchedule Date Range:');
  const dates = schedule.map(g => g.date.getTime());
  const firstGame = new Date(Math.min(...dates));
  const lastGame = new Date(Math.max(...dates));
  console.log(`Season runs from ${firstGame.toDateString()} to ${lastGame.toDateString()}`);

  console.log('\nGames per month:');
  const monthCounts = new Map<string, number>();
  schedule.forEach(game => {
    const monthKey = game.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  Array.from(monthCounts.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .forEach(([month, count]) => {
      console.log(`${month}: ${count} games`);
    });
}
