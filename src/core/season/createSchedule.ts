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
    const teamGameRecord = createSchedule(teams, year);

    // Get all games before verification and analysis
    const allGames = getAllGamesFromRecord(teamGameRecord);

    assignGameDates(allGames, teams, year);
    verifyScheduleConstraints(teams, allGames, year);
    printScheduleAnalysis(teams, allGames);

    // Convert games to MatchInput format
    return allGames.map(game => ({
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      date: game.date,
      seasonStage,
    }));
  }

  throw new Error(`Unsupported season stage: ${seasonStage}`);
}

function createGameDate(year: number, month: number, day: number): Date {
  // Always use noon UTC to avoid timezone issues
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

function getDaysBetween(date1: Date, date2: Date): number {
  // Get days between dates, ignoring time of day
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

function createGame(homeTeam: Team, awayTeam: Team): Game {
  return {
    homeTeam,
    awayTeam,
    date: createGameDate(2000, 0, 1), // temp date, will be replaced later
  };
}

function createGameLocUnknown(team1: Team, team2: Team): GameLocUnknown {
  return {
    team1,
    team2,
    date: createGameDate(2000, 0, 1), // temp date, will be replaced later
  };
}

// Hacky but works. Creates pattern to rotate which teams play 3 games vs 4 games in a season,
// so it's not always the same teams.
function generatePatternWithOffset(
  year: number
): Array<{
  team: number;
  opponents: {
    four: number[];
    three: number[];
  };
}> {
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

function verifyScheduleConstraints(teams: Team[], allGames: Game[], year: number): void {
  console.log('\n=== Schedule Constraint Verification ===\n');

  // Calculate expected games from constants
  const expectedDivGames = DIV_SERIES.series * DIV_SERIES.games_per_series;
  const expectedConf4Games = CONF_SERIES_4.series * CONF_SERIES_4.games_per_series;
  const expectedConf3Games = CONF_SERIES_3.series * CONF_SERIES_3.games_per_series;
  const expectedNonConfGames = NON_CONF_SERIES.series * NON_CONF_SERIES.games_per_series;
  const expectedConfGames = expectedDivGames + expectedConf4Games + expectedConf3Games;

  for (const team of teams) {
    const teamId = team.teamInfo.id;

    // Get all games involving this team
    const teamGames = allGames.filter(g =>
      g.homeTeam.teamInfo.id === teamId ||
      g.awayTeam.teamInfo.id === teamId
    );

    // Count division games
    const divGames = teamGames.filter(g => {
      const opponent = g.homeTeam.teamInfo.id === teamId ? g.awayTeam : g.homeTeam;
      return opponent.teamInfo.division === team.teamInfo.division;
    }).length;

    // Count conference games (excluding division games)
    const confGames = teamGames.filter(g => {
      const opponent = g.homeTeam.teamInfo.id === teamId ? g.awayTeam : g.homeTeam;
      return opponent.teamInfo.conference === team.teamInfo.conference &&
        opponent.teamInfo.division !== team.teamInfo.division;
    });

    // Count non-conference games
    const nonConfGames = teamGames.filter(g => {
      const opponent = g.homeTeam.teamInfo.id === teamId ? g.awayTeam : g.homeTeam;
      return opponent.teamInfo.conference !== team.teamInfo.conference;
    }).length;

    // Count unique non-conference opponents
    const nonConfOpponents = new Set(
      teamGames
        .filter(g => {
          const opponent = g.homeTeam.teamInfo.id === teamId ? g.awayTeam : g.homeTeam;
          return opponent.teamInfo.conference !== team.teamInfo.conference;
        })
        .map(g => g.homeTeam.teamInfo.id === teamId ? g.awayTeam.teamInfo.id : g.homeTeam.teamInfo.id)
    );

    const expectedNonConfOpponents = teams.filter(t =>
      t.teamInfo.conference !== team.teamInfo.conference
    ).length;

    // Verify non-conference opponent count
    if (nonConfOpponents.size !== expectedNonConfOpponents) {
      throw new Error(
        `Team ${team.teamInfo.name} plays ${nonConfOpponents.size} non-conference opponents (expected ${expectedNonConfOpponents})`
      );
    }

    // Count conference games by series length
    const confOpponentGames = new Map<number, number>();
    confGames.forEach(g => {
      const oppId = g.homeTeam.teamInfo.id === teamId ? g.awayTeam.teamInfo.id : g.homeTeam.teamInfo.id;
      confOpponentGames.set(oppId, (confOpponentGames.get(oppId) || 0) + 1);
    });

    const threeGameConfGames = Array.from(confOpponentGames.values()).filter(count => count === 3).length * 3;
    const fourGameConfGames = Array.from(confOpponentGames.values()).filter(count => count === 4).length * 4;

    // Verify game counts
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

    // Verify total conference games
    const totalConfGames = divGames + fourGameConfGames + threeGameConfGames;
    if (totalConfGames !== expectedConfGames) {
      throw new Error(`Team ${team.teamInfo.name} has ${totalConfGames} conference games (expected ${expectedConfGames})`);
    }

    // Verify total games
    const totalGames = totalConfGames + nonConfGames;
    if (totalGames !== TOTAL_GAMES) {
      throw new Error(`Team ${team.teamInfo.name} has ${totalGames} total games (expected ${TOTAL_GAMES})`);
    }
  }

  console.log('✅ Schedule constraints verified');

  // Verify date constraints
  console.log('\nVerifying date constraints...');
  const { start: SEASON_START, end: SEASON_END } = getSeasonDates(year);

  // Check season start/end dates
  const gameDates = allGames.map(g => g.date);
  const earliestGame = new Date(Math.min(...gameDates.map(d => d.getTime())));
  const latestGame = new Date(Math.max(...gameDates.map(d => d.getTime())));

  if (earliestGame < SEASON_START || latestGame > SEASON_END) {
    throw new Error(
      `Games scheduled outside season range: ${earliestGame.toDateString()} to ${latestGame.toDateString()}\n` +
      `Season start: ${SEASON_START.toDateString()}\n` +
      `Season end: ${SEASON_END.toDateString()}`
    );
  }

  // Verify no team plays multiple games on the same day
  for (const team of teams) {
    const teamGames = allGames.filter(g =>
      g.homeTeam.teamInfo.id === team.teamInfo.id ||
      g.awayTeam.teamInfo.id === team.teamInfo.id
    ).sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 1; i < teamGames.length; i++) {
      if (isSameDay(teamGames[i - 1].date, teamGames[i].date)) {
        throw new Error(`Team ${team.teamInfo.name} has multiple games on ${teamGames[i].date.toDateString()}`);
      }
    }

    // Check for back-to-back-to-back games
    for (let i = 2; i < teamGames.length; i++) {
      const game1Date = teamGames[i - 2].date;
      const game2Date = teamGames[i - 1].date;
      const game3Date = teamGames[i].date;

      // A back-to-back-to-back means games on three consecutive days
      // e.g., if first game is on day 1, second must be on day 2, and third on day 3
      const daysBetween1and3 = getDaysBetween(game1Date, game3Date);

      if (daysBetween1and3 === 2) {
        // Double check that there's actually a game on the middle day
        const hasMiddleGame = isSameDay(game2Date, addDays(game1Date, 1));
        if (hasMiddleGame) {
          throw new Error(
            `Team ${team.teamInfo.name} has back-to-back-to-back games: ` +
            `${game1Date.toDateString()}, ${game2Date.toDateString()}, ${game3Date.toDateString()}`
          );
        }
      }
    }
  }

  console.log('✅ Schedule constraints verified');
}

function printScheduleAnalysis(teams: Team[], allGames: Game[]) {
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

  // Count all games
  for (const game of allGames) {
    const homeId = game.homeTeam.teamInfo.id;
    const awayId = game.awayTeam.teamInfo.id;

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

  console.log('\nCeltics Full Schedule:');
  const celticsGames = allGames
    .filter(g => g.homeTeam.teamInfo.name === 'Celtics' || g.awayTeam.teamInfo.name === 'Celtics')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (celticsGames.length > 0) {
    let currentMonth = '';
    celticsGames.forEach(game => {
      const monthYear = game.date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (monthYear !== currentMonth) {
        console.log(`\n${monthYear}`);
        currentMonth = monthYear;
      }
      const dateStr = game.date.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' });
      const opponent = game.homeTeam.teamInfo.name === 'Celtics'
        ? `vs ${game.awayTeam.teamInfo.name}`
        : `@ ${game.homeTeam.teamInfo.name}`;
      console.log(`  ${dateStr.padEnd(16)} ${opponent}`);
    });
  }

  console.log('\nSchedule Date Range:');
  const dates = allGames.map(g => g.date.getTime());
  const firstGame = new Date(Math.min(...dates));
  const lastGame = new Date(Math.max(...dates));
  console.log(`Season runs from ${firstGame.toDateString()} to ${lastGame.toDateString()}`);

  console.log('\nGames per month:');
  const monthCounts = new Map<string, number>();
  allGames.forEach((game: Game) => {
    const monthKey = game.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  Array.from(monthCounts.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .forEach(([month, count]) => {
      console.log(`${month}: ${count} games`);
    });

  return;
}

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setUTCDate(date.getUTCDate() + days);
  return newDate;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function getAllGamesFromRecord(teamGameRecord: TeamGameRecord): Game[] {
  const seenGames = new Set<Game>();
  const allGames: Game[] = [];

  Object.values(teamGameRecord).forEach(records => {
    [records.div, records.conf4, records.conf3, records.nonConf].forEach(category => {
      Object.values(category).forEach(games => {
        games.forEach(game => {
          if (!seenGames.has(game)) {
            seenGames.add(game);
            allGames.push(game);
          }
        });
      });
    });
  });

  return allGames;
}

function canPlayOnDate(teamId: number, date: Date, teamGames: Map<number, Date[]>): boolean {
  const teamDates = teamGames.get(teamId)!;

  // Check if team has any games on this date
  if (teamDates.some(gameDate => isSameDay(gameDate, date))) {
    return false;
  }

  // Check for back-to-back-to-back games
  const yesterday = addDays(date, -1);
  const twoDaysAgo = addDays(date, -2);
  const tomorrow = addDays(date, 1);
  const twoDaysAhead = addDays(date, 2);

  // Count games in any 3-day window
  const hasGameOnDate = (d: Date) => teamDates.some(gameDate => isSameDay(gameDate, d));

  if (hasGameOnDate(twoDaysAgo) && hasGameOnDate(yesterday)) return false;
  if (hasGameOnDate(yesterday) && hasGameOnDate(tomorrow)) return false;
  if (hasGameOnDate(tomorrow) && hasGameOnDate(twoDaysAhead)) return false;

  return true;
}

function assignGameDates(games: Game[], teams: Team[], year: number): void {
  console.log('\n=== Assigning Game Dates ===\n');
  const { start: SEASON_START, end: SEASON_END } = getSeasonDates(year);
  const totalDays = Math.floor((SEASON_END.getTime() - SEASON_START.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const targetGamesPerDay = Math.ceil(games.length / totalDays);
  console.log(`Season start: ${SEASON_START.toDateString()}`);
  console.log(`Season end: ${SEASON_END.toDateString()}`);
  console.log(`Total games to schedule: ${games.length}`);
  console.log(`Target games per day: ${targetGamesPerDay}`);

  // Create a map to track games by team
  const teamGames = new Map<number, Date[]>();
  for (const team of teams) {
    teamGames.set(team.teamInfo.id, []);
  }

  const unscheduledGames = [...games];
  let gamesScheduled = 0;
  const teamsScheduledForDay = new Set<number>();
  const monthlyGames = new Map<string, number>();

  let currentDate = new Date(SEASON_START);
  let consecutiveFailedDays = 0;
  const MAX_FAILED_DAYS = 5;

  while (currentDate <= SEASON_END && unscheduledGames.length > 0) {
    teamsScheduledForDay.clear();

    let possibleGames = unscheduledGames.filter(game => {
      const homeTeamId = game.homeTeam.teamInfo.id;
      const awayTeamId = game.awayTeam.teamInfo.id;

      if (teamsScheduledForDay.has(homeTeamId) || teamsScheduledForDay.has(awayTeamId)) {
        return false;
      }

      // Relax constraints if we're struggling to schedule games
      if (consecutiveFailedDays >= MAX_FAILED_DAYS) {
        return true;
      }

      return canPlayOnDate(homeTeamId, currentDate, teamGames) &&
        canPlayOnDate(awayTeamId, currentDate, teamGames);
    });

    const remainingDays = Math.floor((SEASON_END.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const remainingGames = unscheduledGames.length;
    const minGamesToSchedule = Math.max(1, Math.floor(remainingGames / remainingDays));
    const maxGamesToSchedule = Math.min(possibleGames.length, targetGamesPerDay);

    // Adjust target games based on how close we are to the end
    const daysLeft = Math.max(1, remainingDays);
    const avgGamesNeeded = Math.ceil(remainingGames / daysLeft);
    const gamesToScheduleToday = Math.min(maxGamesToSchedule, Math.max(minGamesToSchedule, avgGamesNeeded));

    let gamesScheduledToday = 0;
    while (possibleGames.length > 0 && gamesScheduledToday < gamesToScheduleToday) {
      const randomIndex = Math.floor(Math.random() * possibleGames.length);
      const gameToSchedule = possibleGames[randomIndex];

      gameToSchedule.date = new Date(currentDate);
      teamGames.get(gameToSchedule.homeTeam.teamInfo.id)!.push(new Date(currentDate));
      teamGames.get(gameToSchedule.awayTeam.teamInfo.id)!.push(new Date(currentDate));

      teamsScheduledForDay.add(gameToSchedule.homeTeam.teamInfo.id);
      teamsScheduledForDay.add(gameToSchedule.awayTeam.teamInfo.id);

      gamesScheduled++;
      gamesScheduledToday++;

      const monthKey = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      monthlyGames.set(monthKey, (monthlyGames.get(monthKey) || 0) + 1);

      const unscheduledIndex = unscheduledGames.indexOf(gameToSchedule);
      unscheduledGames.splice(unscheduledIndex, 1);

      if (gamesScheduled % 100 === 0) {
        console.log(`Scheduled ${gamesScheduled} games (${Math.round(gamesScheduled / games.length * 100)}%)`);
      }

      possibleGames = possibleGames.filter(game =>
        !teamsScheduledForDay.has(game.homeTeam.teamInfo.id) &&
        !teamsScheduledForDay.has(game.awayTeam.teamInfo.id)
      );
    }

    // Track consecutive days where we couldn't schedule any games
    if (gamesScheduledToday === 0) {
      consecutiveFailedDays++;
    } else {
      consecutiveFailedDays = 0;
    }

    // If we're really struggling, try to backtrack a bit
    if (consecutiveFailedDays >= MAX_FAILED_DAYS && remainingGames > 0) {
      // Move back a few days to try a different scheduling pattern
      currentDate = addDays(currentDate, -3);
      consecutiveFailedDays = 0;
      continue;
    }

    currentDate = addDays(currentDate, 1);
  }

  if (unscheduledGames.length > 0) {
    // One final attempt: try to schedule remaining games anywhere possible
    for (const game of unscheduledGames) {
      let scheduled = false;
      currentDate = new Date(SEASON_START);

      while (currentDate <= SEASON_END && !scheduled) {
        if (canPlayOnDate(game.homeTeam.teamInfo.id, currentDate, teamGames) &&
          canPlayOnDate(game.awayTeam.teamInfo.id, currentDate, teamGames)) {
          game.date = new Date(currentDate);
          teamGames.get(game.homeTeam.teamInfo.id)!.push(new Date(currentDate));
          teamGames.get(game.awayTeam.teamInfo.id)!.push(new Date(currentDate));
          scheduled = true;
          gamesScheduled++;
        }
        currentDate = addDays(currentDate, 1);
      }

      if (!scheduled) {
        throw new Error(`Unable to schedule game between ${game.homeTeam.teamInfo.name} and ${game.awayTeam.teamInfo.name}`);
      }
    }
  }

  console.log(`\nScheduling complete:`);
  console.log(`- ${gamesScheduled} games scheduled`);
  console.log(`- Season spans ${totalDays} days`);
  console.log('\nGames per month:');
  Array.from(monthlyGames.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .forEach(([month, count]) => {
      console.log(`${month}: ${count} games`);
    });
}

function getSeasonDates(year: number) {
  return {
    start: createGameDate(year, 9, 22),    // October 22nd of input year
    end: createGameDate(year + 1, 3, 15)   // April 15th of next year
  };
}
