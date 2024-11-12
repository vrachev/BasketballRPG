import type { Team } from "../../data/";
import type { MatchInput } from "../simulation/match";

type TeamId = number;
type Game = {
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
};

export class NBAScheduler {
  private teams: Team[];
  private readonly GAMES_PER_TEAM = 82;

  constructor(teams: Team[]) {
    this.teams = teams;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private createInitialSchedule(): Game[] {
    const schedule: Game[] = [];
    const gameCounts = new Map<string, number>();  // Track games between each pair

    // Helper to safely add games and track counts
    const addGame = (homeTeam: Team, awayTeam: Team) => {
      const pairKey = [homeTeam.teamInfo.id, awayTeam.teamInfo.id].sort().join('-');
      const currentCount = gameCounts.get(pairKey) || 0;

      // Determine how many games these teams should play
      let targetGames = 2; // Default for non-conference
      if (homeTeam.teamInfo.conference === awayTeam.teamInfo.conference) {
        if (homeTeam.teamInfo.division === awayTeam.teamInfo.division) {
          targetGames = 4; // Division opponents
        } else {
          targetGames = 3; // Conference opponents (we'll adjust some to 4 later)
        }
      }

      // Only add the game if we haven't reached the target
      if (currentCount < targetGames) {
        schedule.push({
          homeTeam,
          awayTeam,
          date: new Date(2024, 9, 22)
        });
        gameCounts.set(pairKey, currentCount + 1);
      }
    };

    // 1. First handle division games (4 games against each division opponent)
    this.teams.forEach(team => {
      const divisionOpponents = this.teams.filter(t =>
        t.teamInfo.division === team.teamInfo.division &&
        t.teamInfo.id !== team.teamInfo.id
      );

      divisionOpponents.forEach(opponent => {
        // Create 4 games, alternating home/away
        for (let i = 0; i < 4; i++) {
          const isHome = i % 2 === 0;
          addGame(
            isHome ? team : opponent,
            isHome ? opponent : team
          );
        }
      });
    });

    // 2. Handle conference games
    this.teams.forEach(team => {
      const conferenceOpponents = this.teams.filter(t =>
        t.teamInfo.conference === team.teamInfo.conference &&
        t.teamInfo.division !== team.teamInfo.division
      );

      // Randomly select 6 teams for 4 games
      const fourGameOpponents = this.shuffleArray(conferenceOpponents).slice(0, 6);

      // Create 4 games against selected opponents
      fourGameOpponents.forEach(opponent => {
        for (let i = 0; i < 4; i++) {
          const isHome = i % 2 === 0;
          addGame(
            isHome ? team : opponent,
            isHome ? opponent : team
          );
        }
      });

      // Create 3 games against remaining conference opponents
      conferenceOpponents
        .filter(t => !fourGameOpponents.includes(t))
        .forEach(opponent => {
          for (let i = 0; i < 3; i++) {
            const isHome = i % 3 !== 2;
            addGame(
              isHome ? team : opponent,
              isHome ? opponent : team
            );
          }
        });
    });

    // 3. Handle inter-conference games (2 games against each team)
    this.teams.forEach(team => {
      const opposingConferenceTeams = this.teams.filter(t =>
        t.teamInfo.conference !== team.teamInfo.conference
      );

      opposingConferenceTeams.forEach(opponent => {
        for (let i = 0; i < 2; i++) {
          const isHome = i === 0;
          addGame(
            isHome ? team : opponent,
            isHome ? opponent : team
          );
        }
      });
    });

    return schedule;
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
  }

  public generateSchedule(): MatchInput[] {
    const schedule = this.createInitialSchedule();
    this.printScheduleAnalysis(schedule);

    return schedule.map(game => ({
      ...game,
      seasonStage: 'regular_season' as const
    }));
  }
}
