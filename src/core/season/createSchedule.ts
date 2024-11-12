import type { Team } from "../../data/";
import type { MatchInput } from "../simulation/match";

type TeamId = number;
type Game = {
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
};

export class NBAScheduler {
  private readonly teams: Team[];
  private readonly gamesPerTeam: number;

  constructor(teams: Team[], gamesPerTeam: number = 82) {
    this.teams = teams;
    this.gamesPerTeam = gamesPerTeam;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private canTeamPlayOnDate(team: Team, date: Date, teamGamesPerDay: Map<string, number>): boolean {
    const dateKey = date.toISOString().split('T')[0];
    const teamKey = `${dateKey}-${team.teamInfo.id}`;
    const gamesOnDay = teamGamesPerDay.get(teamKey) || 0;
    return gamesOnDay < 1; // Max 1 game per team per day
  }

  private recordGameOnDate(team: Team, date: Date, teamGamesPerDay: Map<string, number>): void {
    const dateKey = date.toISOString().split('T')[0];
    const teamKey = `${dateKey}-${team.teamInfo.id}`;
    teamGamesPerDay.set(teamKey, (teamGamesPerDay.get(teamKey) || 0) + 1);
  }

  private createInitialSchedule(year: number): Game[] {
    const games: Game[] = [];
    const gameCounts = new Map<string, number>();
    const gamesPerTeam = new Map<TeamId, number>();
    const teamGamesPerDay = new Map<string, number>();
    const processedPairs = new Set<string>();

    // Initialize counters
    this.teams.forEach(team => {
      gamesPerTeam.set(team.teamInfo.id, 0);
    });

    // Helper to safely add a game and track counts
    const addGame = (homeTeam: Team, awayTeam: Team) => {
      const pairKey = [homeTeam.teamInfo.id, awayTeam.teamInfo.id].sort().join('-');

      games.push({
        homeTeam,
        awayTeam,
        date: new Date() // Temporary date
      });
      gameCounts.set(pairKey, (gameCounts.get(pairKey) || 0) + 1);
      gamesPerTeam.set(homeTeam.teamInfo.id, (gamesPerTeam.get(homeTeam.teamInfo.id) || 0) + 1);
      gamesPerTeam.set(awayTeam.teamInfo.id, (gamesPerTeam.get(awayTeam.teamInfo.id) || 0) + 1);
    };

    // Process division games (4 games × 4 opponents = 16 games)
    console.log("Processing division games...");
    this.teams.forEach(team => {
      const divisionOpponents = this.teams.filter(t =>
        t.teamInfo.id !== team.teamInfo.id &&
        t.teamInfo.division === team.teamInfo.division
      );

      divisionOpponents.forEach(opponent => {
        const pairKey = [team.teamInfo.id, opponent.teamInfo.id].sort().join('-');
        if (!processedPairs.has(pairKey)) {
          // Add 4 games (2 home, 2 away for each team)
          addGame(team, opponent);
          addGame(team, opponent);
          addGame(opponent, team);
          addGame(opponent, team);
          processedPairs.add(pairKey);
        }
      });
    });

    // Process conference games (36 games)
    console.log("Processing conference games...");

    // First, group teams by conference
    const conferenceTeams = new Map<string, Team[]>();
    this.teams.forEach(team => {
      const conf = team.teamInfo.conference;
      if (!conferenceTeams.has(conf)) {
        conferenceTeams.set(conf, []);
      }
      conferenceTeams.get(conf)!.push(team);
    });

    // For each conference, create a balanced schedule
    conferenceTeams.forEach((teams, conference) => {
      // Get non-division opponents for each team
      const nonDivOpponents = new Map<TeamId, Team[]>();
      teams.forEach(team => {
        nonDivOpponents.set(team.teamInfo.id, teams.filter(t =>
          t.teamInfo.id !== team.teamInfo.id &&
          t.teamInfo.division !== team.teamInfo.division
        ));
      });

      // For each team, assign their 4-game and 3-game opponents
      teams.forEach(team => {
        const opponents = nonDivOpponents.get(team.teamInfo.id)!;
        const shuffledOpponents = this.shuffleArray([...opponents]);

        // First 6 opponents get 4 games
        for (let i = 0; i < 6; i++) {
          const opponent = shuffledOpponents[i];
          const pairKey = [team.teamInfo.id, opponent.teamInfo.id].sort().join('-');

          if (!processedPairs.has(pairKey)) {
            // Add 4 games (2 home, 2 away)
            addGame(team, opponent);
            addGame(team, opponent);
            addGame(opponent, team);
            addGame(opponent, team);
            processedPairs.add(pairKey);
          }
        }

        // Remaining opponents get 3 games
        for (let i = 6; i < opponents.length; i++) {
          const opponent = shuffledOpponents[i];
          const pairKey = [team.teamInfo.id, opponent.teamInfo.id].sort().join('-');

          if (!processedPairs.has(pairKey)) {
            // Add 3 games (balanced home/away)
            addGame(team, opponent);
            addGame(opponent, team);

            // Third game alternates based on team ID
            if (team.teamInfo.id < opponent.teamInfo.id) {
              addGame(team, opponent);
            } else {
              addGame(opponent, team);
            }
            processedPairs.add(pairKey);
          }
        }
      });
    });

    // Verify conference game counts
    this.teams.forEach(team => {
      const confGames = games.filter(g =>
        (g.homeTeam.teamInfo.id === team.teamInfo.id || g.awayTeam.teamInfo.id === team.teamInfo.id) &&
        g.homeTeam.teamInfo.conference === g.awayTeam.teamInfo.conference &&
        g.homeTeam.teamInfo.division !== g.awayTeam.teamInfo.division
      ).length;

      if (confGames !== 36) {
        console.error(`${team.teamInfo.name} has ${confGames} conference games instead of 36`);
      }
    });

    // Process non-conference games (30 games)
    console.log("Processing non-conference games...");
    this.teams.forEach(team => {
      const nonConfOpponents = this.teams.filter(t =>
        t.teamInfo.id !== team.teamInfo.id &&
        t.teamInfo.conference !== team.teamInfo.conference
      );

      nonConfOpponents.forEach(opponent => {
        const pairKey = [team.teamInfo.id, opponent.teamInfo.id].sort().join('-');
        if (!processedPairs.has(pairKey)) {
          addGame(team, opponent);
          addGame(opponent, team);
          processedPairs.add(pairKey);
        }
      });
    });

    // Debug output
    console.log("\nGame counts per team:");
    this.teams.forEach(team => {
      const totalGames = gamesPerTeam.get(team.teamInfo.id) || 0;
      const divGames = this.teams.filter(t =>
        t.teamInfo.id !== team.teamInfo.id &&
        t.teamInfo.division === team.teamInfo.division
      ).length * 4;
      const confGames = games.filter(g =>
        (g.homeTeam.teamInfo.id === team.teamInfo.id || g.awayTeam.teamInfo.id === team.teamInfo.id) &&
        g.homeTeam.teamInfo.conference === g.awayTeam.teamInfo.conference &&
        g.homeTeam.teamInfo.division !== g.awayTeam.teamInfo.division
      ).length;
      const nonConfGames = games.filter(g =>
        (g.homeTeam.teamInfo.id === team.teamInfo.id || g.awayTeam.teamInfo.id === team.teamInfo.id) &&
        g.homeTeam.teamInfo.conference !== g.awayTeam.teamInfo.conference
      ).length;

      console.log(`${team.teamInfo.name}: ${totalGames} total (${divGames} div, ${confGames} conf, ${nonConfGames} non-conf)`);
    });

    // Verify each team has exactly 82 games
    this.teams.forEach(team => {
      const totalGames = gamesPerTeam.get(team.teamInfo.id) || 0;
      if (totalGames !== this.gamesPerTeam) {
        throw new Error(`Team ${team.teamInfo.name} has ${totalGames} games instead of ${this.gamesPerTeam}`);
      }
    });

    // Now assign dates to all games
    const availableDates = this.shuffleArray(this.getSeasonDates(year));
    const unscheduledGames = [...games];
    const scheduledGames: Game[] = [];

    while (unscheduledGames.length > 0) {
      // Find the team with the most remaining games
      const teamGamesRemaining = new Map<TeamId, number>();
      unscheduledGames.forEach(game => {
        const homeId = game.homeTeam.teamInfo.id;
        const awayId = game.awayTeam.teamInfo.id;
        teamGamesRemaining.set(homeId, (teamGamesRemaining.get(homeId) || 0) + 1);
        teamGamesRemaining.set(awayId, (teamGamesRemaining.get(awayId) || 0) + 1);
      });

      // Sort games by teams with most remaining games
      unscheduledGames.sort((a, b) => {
        const aMax = Math.max(
          teamGamesRemaining.get(a.homeTeam.teamInfo.id) || 0,
          teamGamesRemaining.get(a.awayTeam.teamInfo.id) || 0
        );
        const bMax = Math.max(
          teamGamesRemaining.get(b.homeTeam.teamInfo.id) || 0,
          teamGamesRemaining.get(b.awayTeam.teamInfo.id) || 0
        );
        return bMax - aMax;
      });

      const game = unscheduledGames[0];

      // Find next available date where both teams can play
      const gameDate = availableDates.find(date =>
        this.canTeamPlayOnDate(game.homeTeam, date, teamGamesPerDay) &&
        this.canTeamPlayOnDate(game.awayTeam, date, teamGamesPerDay)
      );

      if (!gameDate) {
        console.error('Failed to schedule game:', {
          homeTeam: game.homeTeam.teamInfo.name,
          awayTeam: game.awayTeam.teamInfo.name,
          remainingGames: unscheduledGames.length,
          remainingDates: availableDates.length
        });
        throw new Error('No available dates for remaining games');
      }

      // Record the game
      game.date = gameDate;
      this.recordGameOnDate(game.homeTeam, gameDate, teamGamesPerDay);
      this.recordGameOnDate(game.awayTeam, gameDate, teamGamesPerDay);
      availableDates.splice(availableDates.indexOf(gameDate), 1);

      scheduledGames.push(game);
      unscheduledGames.shift();
    }

    return scheduledGames;
  }

  private printScheduleAnalysis(schedule: Game[]) {
    const homeGames = new Map<TeamId, number>();
    const awayGames = new Map<TeamId, number>();
    const conferenceGames = new Map<TeamId, { east: number, west: number; }>();
    const teamPairings = new Map<string, number>();

    // Initialize counters
    this.teams.forEach(team => {
      homeGames.set(team.teamInfo.id, 0);
      awayGames.set(team.teamInfo.id, 0);
      conferenceGames.set(team.teamInfo.id, { east: 0, west: 0 });
    });

    // Count games
    schedule.forEach(game => {
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
    });

    // Print results
    console.log('\n=== Schedule Analysis ===\n');

    console.log('Home/Away Game Distribution:');
    this.teams.forEach(team => {
      console.log(`${team.teamInfo.name}: ${homeGames.get(team.teamInfo.id)} home, ${awayGames.get(team.teamInfo.id)} away`);
    });

    console.log('\nTeam Pairing Distribution:');
    this.teams.forEach(team1 => {
      console.log(`\n${team1.teamInfo.name} plays:`);
      this.teams.forEach(team2 => {
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
    this.teams.forEach(team => {
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

  private getSeasonDates(year: number): Date[] {
    const startDate = new Date(year, 9, 22); // October 22nd
    const endDate = new Date(year + 1, 3, 14); // April 14th next year
    const dates: Date[] = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip Christmas Day
      if (currentDate.getMonth() === 11 && currentDate.getDate() === 25) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Add each date multiple times to allow multiple games per day
      for (let i = 0; i < 8; i++) { // Allow up to 8 games per day
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return this.shuffleArray(dates);
  }

  public generateSchedule(year: number): MatchInput[] {
    const schedule = this.createInitialSchedule(year);
    this.printScheduleAnalysis(schedule);

    return schedule.map(game => ({
      ...game,
      seasonStage: 'regular_season' as const
    }));
  }
}
