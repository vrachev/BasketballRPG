import { createPlayer, getPlayerHistory, CreatePlayerInput } from "./entities/player";
import { createTeams, getTeamId, getTeamBySeason } from "./entities/team";
import { createTeamSeason } from "./entities/teamSeason";
import * as fetchData from "./entities/fetchData";
import {
  averageGameStatsPerTeam,
  averageStatRates,
  playerConstants,
  possessionConstants
} from "./simulation/constants";
import { processMatch } from "./process/match";

export {
  fetchData,
  getPlayerHistory,
  createPlayer,
  createTeams,
  getTeamId,
  getTeamBySeason,
  createTeamSeason,
  processMatch,

  // Constants
  possessionConstants,
  averageStatRates,
  averageGameStatsPerTeam,
  playerConstants,
};

export type { CreatePlayerInput };
