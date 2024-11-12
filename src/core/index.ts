import { createPlayer, getPlayerHistory, CreatePlayerInput } from "./entities/player";
import { createTeams, getTeamId, getTeamIds, getTeams, getTeam } from "./entities/team";
import { createTeamSeason } from "./entities/teamSeason";
import {
  averageGameStatsPerTeam,
  averageStatRates,
  playerConstants,
  possessionConstants
} from "./simulation/constants";
import { processMatch } from "./process/match";

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

  // Constants
  possessionConstants,
  averageStatRates,
  averageGameStatsPerTeam,
  playerConstants,
};

export type { CreatePlayerInput };
