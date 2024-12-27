import { createPlayers } from './entities/player.js';
import { getPlayerHistory, type CreatePlayerInput } from './entities/player.js';
import { createTeams, getTeamId, getTeamIds, getTeams, getTeam } from './entities/team.js';
import { getTeamStandings, type TeamStanding } from './entities/views/teamStandings.js';
import { createTeamSeason } from './entities/teamSeason.js';
import { createSeason } from './entities/season.js';
import {
  averageGameStatsPerTeam,
  averageStatRates,
  playerConstants,
  possessionConstants
} from './simulation/constants.js';
import { processMatch } from './process/match.js';

export {
  getPlayerHistory,
  createPlayers,
  createTeams,
  getTeamId,
  getTeamIds,
  getTeams,
  getTeam,
  createTeamSeason,
  processMatch,
  getTeamStandings,
  createSeason,
  // Constants
  possessionConstants,
  averageStatRates,
  averageGameStatsPerTeam,
  playerConstants,
};

export type { CreatePlayerInput, TeamStanding };
