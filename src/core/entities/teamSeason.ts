import { Insertable, Updateable } from 'kysely';
import { TEAM_SEASON_TABLE, StatlineTeam, TeamSeasonTable, db } from '../../data';

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
  teamSeasonId: number,
  teamStats: StatlineTeam,
  win: boolean
): Promise<void> => {
  const teamSeason = await db
    .selectFrom(TEAM_SEASON_TABLE)
    .selectAll()
    .where('id', '=', teamSeasonId)
    .executeTakeFirstOrThrow();
  if (!teamSeason) {
    throw new Error(`Team season not found with ID: ${teamSeasonId}`);
  }
  const gamesPlayed = teamSeason.games_played;

  // Calculate new stats
  const updates: Updateable<TeamSeasonTable> = {
    ...teamStats,
    games_played: gamesPlayed + 1,
    wins: win ? teamSeason.wins + 1 : teamSeason.wins,
    losses: !win ? teamSeason.losses + 1 : teamSeason.losses
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
