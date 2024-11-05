import { TEAM_SEASON_TABLE, TeamSeason } from '../../data';
import { InsertableRecord } from '../../data/sqlTypes';
import { insert } from '../../db';

export const createTeamSeason = async (teamId: number, seasonId: number) => {
  const teamSeason: InsertableRecord<TeamSeason> = {
    team_id: teamId,
    season_id: seasonId,
    wins: 0,
    losses: 0,
    conference_rank: 0,
    playoff_seed: 0,
    offensive_rating: 0,
    defensive_rating: 0,
    net_rating: 0,
    pace: 0,
  };

  await insert(teamSeason, TEAM_SEASON_TABLE);
};
