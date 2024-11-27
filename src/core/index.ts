import { createPlayer } from './entities/player.js';
import { getPlayerHistory, type CreatePlayerInput } from './entities/player.js';
import { createTeams, getTeamId, getTeamIds, getTeams, getTeam } from './entities/team.js';
import { getTeamStandings } from './entities/views/teamStandings.js';
import { createTeamSeason } from './entities/teamSeason.js';
import {
  averageGameStatsPerTeam,
  averageStatRates,
  playerConstants,
  possessionConstants
} from './simulation/constants.js';
import { processMatch } from './process/match.js';

export {
  getPlayerHistory,
  createPlayer,
  createTeams,
  getTeamId,
  getTeamIds,
  getTeams,
  getTeam,
  createTeamSeason,
  processMatch,
  getTeamStandings,
  // Constants
  possessionConstants,
  averageStatRates,
  averageGameStatsPerTeam,
  playerConstants,
};

export type { CreatePlayerInput };
