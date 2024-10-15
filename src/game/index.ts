import { insert, openDb } from "../db";
import { playerSchema, PLAYER_TABLE, teamSchema, TEAM_TABLE } from "../data";
import { generatePlayer } from "./player/player";
import { generateTeam } from "./team/team";

async function insertPlayer(player: playerSchema) {
  await insert(player, PLAYER_TABLE);
}

async function insertTeam(team: teamSchema) {
  await insert(team, TEAM_TABLE);
}

async function getPlayers() {
  const db = await openDb();
  return db.all(`SELECT * FROM ${PLAYER_TABLE}`);
}

async function getTeams() {
  const db = await openDb();
  return db.all(`SELECT * FROM ${TEAM_TABLE}`);
}

export { insertPlayer, insertTeam, getPlayers, getTeams, generatePlayer, generateTeam };