import { insert, openDb } from "../db";
import * as data from "../data";
import { generatePlayer } from "./player/player";
import { generateTeam } from "./team/team";
import { generateTeamSeason } from "./team/teamSeason";

async function insertPlayer(player: data.playerSchema) {
  await insert(player, data.PLAYER_TABLE);
}

async function insertTeam(team: data.teamSchema) {
  await insert(team, data.TEAM_TABLE);
}

async function insertTeamSeason(teamSeason: data.teamSeasonSchema) {
  await insert(teamSeason, data.TEAM_SEASON_TABLE);
}

async function insertMatch(match: data.matchSchema) {
  await insert(match, data.MATCH_TABLE);
}

async function getAllFromTable(tableName: string) {
  const db = await openDb();
  return db.all(`SELECT * FROM ${tableName}`);
}

async function getPlayers() {
  return getAllFromTable(data.PLAYER_TABLE);
}

async function getTeams() {
  return getAllFromTable(data.TEAM_TABLE);
}

async function getTeamSeasons() {
  return getAllFromTable(data.TEAM_SEASON_TABLE);
}

async function getMatches() {
  return getAllFromTable(data.MATCH_TABLE);
}

export { insertPlayer, insertTeam, insertMatch, insertTeamSeason, getPlayers, getTeams, getTeamSeasons, getMatches, generatePlayer, generateTeam, generateTeamSeason };