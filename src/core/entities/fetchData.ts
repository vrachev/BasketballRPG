import * as data from "../../data";
import { insert, openDb } from "../../db";
import { InsertableRecord } from "../../data/sqlTypes";

export async function insertPlayer(player: InsertableRecord<data.PlayerRaw>) {
  await insert(player, data.PLAYER_TABLE);
}

export async function insertTeam(team: InsertableRecord<data.TeamRaw>) {
  await insert(team, data.TEAM_TABLE);
}

export async function insertTeamSeason(teamSeason: InsertableRecord<data.TeamSeason>) {
  await insert(teamSeason, data.TEAM_SEASON_TABLE);
}

async function getAllFromTable(tableName: string): Promise<any[]> {
  const db = await openDb();
  return db.all(`SELECT * FROM ${tableName}`);
}

export async function getPlayers() {
  return getAllFromTable(data.PLAYER_TABLE);
}

export async function getTeams() {
  return getAllFromTable(data.TEAM_TABLE);
}

export async function getTeamSeasons() {
  return getAllFromTable(data.TEAM_SEASON_TABLE);
}
