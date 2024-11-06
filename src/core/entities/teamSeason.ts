import { TEAM_SEASON_TABLE, TeamGameStats, TeamSeason } from '../../data';
import { InsertableRecord } from '../../data/sqlTypes';
import { insert, update, openDb } from '../../db';
import { GameStats } from '../process/calculateGameStats';

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

    // Derived Averages
    fg_pct: 0,
    two_fg_pct: 0,
    three_fg_pct: 0,
    ft_pct: 0,
    efg_pct: 0,
    ts_pct: 0,
    pace: 0,
    off_rating: 0,
    def_rating: 0,
    net_rating: 0
  };

  await insert(teamSeason, TEAM_SEASON_TABLE);
};

export const updateTeamSeason = async (teamSeasonId: number, teamStats: TeamGameStats, win: boolean) => {
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

  // Only update the stat fields with weighted averages if not the first game
  if (gamesPlayed > 0) {
    const oldWeight = gamesPlayed / (gamesPlayed + 1);
    const newWeight = 1 / (gamesPlayed + 1);

    Object.entries(teamStats).forEach(([key, value]) => {
      updates[key as keyof TeamGameStats] = teamSeason[key as keyof TeamGameStats] * oldWeight + value * newWeight;
    });
  }

  await update(teamSeasonId, updates, TEAM_SEASON_TABLE);
};
