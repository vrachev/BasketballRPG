import { Insertable, Updateable } from 'kysely';
import { TEAM_SEASON_TABLE, StatlineTeam, TeamSeasonTable, db, GameStats } from '../../data/index.js';

export const createTeamSeason = async (
  teamIds: number[],
  seasonId: number
): Promise<void> => {
  const teamSeasons = teamIds.map((teamId) => ({
    team_id: teamId,
    season_id: seasonId,
    games_played: 0,
    wins: 0,
    losses: 0,
    conference_rank: 0,
    playoff_seed: 0,

    // Raw Averages
    secs_played: 0,
    fga: 0,
    fgm: 0,
    two_fga: 0,
    two_fgm: 0,
    three_fga: 0,
    three_fgm: 0,
    fta: 0,
    ftm: 0,
    off_reb: 0,
    def_reb: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    fouls: 0,
    pts: 0,
  } as Insertable<TeamSeasonTable>));

  // TODO: Batch this
  await Promise.all(teamSeasons.map(teamSeason =>
    db.insertInto(TEAM_SEASON_TABLE).values(teamSeason).execute()
  ));
};

export const updateTeamSeason = async (
  gameStats: GameStats,
  location: 'home' | 'away'
): Promise<void> => {
  const isHome = location === 'home';
  const teamStats = isHome ? gameStats.homeTeamStatline : gameStats.awayTeamStatline;
  const isWin = gameStats.winner === location;
  const teamSeasonId = isHome ? gameStats.homeTeam.teamSeason.id : gameStats.awayTeam.teamSeason.id;
  const team = isHome ? gameStats.homeTeam : gameStats.awayTeam;
  const opposingTeam = isHome ? gameStats.awayTeam : gameStats.homeTeam;

  const teamSeason = await db
    .selectFrom(TEAM_SEASON_TABLE)
    .selectAll()
    .where('id', '=', teamSeasonId)
    .executeTakeFirstOrThrow();

  const gamesPlayed = teamSeason.games_played;

  // Calculate new stats
  const updates: Updateable<TeamSeasonTable> = {
    ...teamStats,
    games_played: gamesPlayed + 1,
    wins: isWin ? teamSeason.wins + 1 : teamSeason.wins,
    losses: !isWin ? teamSeason.losses + 1 : teamSeason.losses,

    // Update conference record if same conference
    conference_wins: isWin && opposingTeam.teamInfo.conference === team.teamInfo.conference
      ? teamSeason.conference_wins + 1
      : teamSeason.conference_wins,
    conference_losses: !isWin && opposingTeam.teamInfo.conference === team.teamInfo.conference
      ? teamSeason.conference_losses + 1
      : teamSeason.conference_losses,

    // Update division record if same division  
    division_wins: isWin && opposingTeam.teamInfo.division === team.teamInfo.division
      ? teamSeason.division_wins + 1
      : teamSeason.division_wins,
    division_losses: !isWin && opposingTeam.teamInfo.division === team.teamInfo.division
      ? teamSeason.division_losses + 1
      : teamSeason.division_losses,

    // Update home/away records
    home_wins: isWin && isHome ? teamSeason.home_wins + 1 : teamSeason.home_wins,
    home_losses: !isWin && isHome ? teamSeason.home_losses + 1 : teamSeason.home_losses,
    away_wins: isWin && !isHome ? teamSeason.away_wins + 1 : teamSeason.away_wins,
    away_losses: !isWin && !isHome ? teamSeason.away_losses + 1 : teamSeason.away_losses
  };

  // Add new stats to existing totals
  Object.entries(teamStats).forEach(([key, value]) => {
    updates[key as keyof StatlineTeam] = teamSeason[key as keyof StatlineTeam] + value;
  });

  await db
    .updateTable(TEAM_SEASON_TABLE)
    .set(updates)
    .where('id', '=', teamSeasonId)
    .execute();
};
