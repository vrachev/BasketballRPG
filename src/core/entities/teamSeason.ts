import { TEAM_SEASON_TABLE, StatlineTeam, TeamSeason } from '../../data';
import { InsertableRecord } from '../../data/sqlTypes';
import { insert, update, openDb } from '../../db';

export const createTeamSeason = async (teamId: number, seasonId: number) => {
  const teamSeason: InsertableRecord<TeamSeason> = {
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
  };

  await insert(teamSeason, TEAM_SEASON_TABLE);
};

export const updateTeamSeason = async (teamSeasonId: number, teamStats: StatlineTeam, win: boolean) => {
  const db = await openDb();
  const teamSeason = await db.get<TeamSeason>(`
    SELECT * FROM ${TEAM_SEASON_TABLE} 
    WHERE id = ?
  `, teamSeasonId);
  if (!teamSeason) {
    throw new Error(`Team season not found with ID: ${teamSeasonId}`);
  }
  const gamesPlayed = teamSeason.games_played;

  // Calculate new stats
  const updates: Partial<TeamSeason> = {
    ...teamStats,
    games_played: gamesPlayed + 1,
    wins: win ? teamSeason.wins + 1 : teamSeason.wins,
    losses: !win ? teamSeason.losses + 1 : teamSeason.losses
  };

  // Add new stats to existing totals
  Object.entries(teamStats).forEach(([key, value]) => {
    updates[key as keyof StatlineTeam] = teamSeason[key as keyof StatlineTeam] + value;
  });

  await update(teamSeasonId, updates, TEAM_SEASON_TABLE);
};
