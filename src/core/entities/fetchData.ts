import * as data from "../../data";
import { insert, openDb } from "../../db";
import { InsertableRecord } from "../../data/sqlTypes";

async function insertPlayer(player: InsertableRecord<data.Player>) {
  await insert(player, data.PLAYER_TABLE);
}

async function insertTeam(team: InsertableRecord<data.Team>) {
  await insert(team, data.TEAM_TABLE);
}

async function insertTeamSeason(teamSeason: InsertableRecord<data.TeamSeason>) {
  await insert(teamSeason, data.TEAM_SEASON_TABLE);
}

async function insertMatch(match: InsertableRecord<data.Match>) {
  await insert(match, data.MATCH_TABLE);
}

async function getAllFromTable(tableName: string): Promise<any[]> {
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

export { insertPlayer, insertTeam, insertTeamSeason, insertMatch, getPlayers, getTeams, getTeamSeasons, getMatches };
