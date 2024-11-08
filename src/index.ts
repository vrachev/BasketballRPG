import { createTables, openDb } from './db';
import { createTeams, getTeamId } from './core/entities/team';
import * as core from './core';
import { formatTeamBoxScore } from './display/boxscore';
import { createSeason } from './core/entities/season';

async function seedDb() {
  await createTables();
  const db = await openDb();

  await createSeason(2024, 2025);
  await createTeams();

  const teamIds = await Promise.all([
    getTeamId('Boston'),
    getTeamId('Philadelphia')
  ]);

  await core.createTeamSeason(teamIds[0], 1);
  await core.createTeamSeason(teamIds[1], 1);

  // Insert 10 players and store their IDs
  const team1Ids: number[] = [];
  const team2Ids: number[] = [];

  // Template players
  const rolePlayerTemplate: core.CreatePlayerInput = {
    playerInfoInput: { isStarting: true },
    teamId: 0,
    seasonStartingYear: 2024,
    position: 'PG',
    defaultSkillLevel: 35,
    defaultTendencyLevel: 20,
  };

  const starPlayerTemplate: core.CreatePlayerInput = {
    playerInfoInput: { isStarting: true },
    teamId: 0,
    seasonStartingYear: 2024,
    position: 'PG',
    defaultSkillLevel: 10,
    defaultTendencyLevel: 70
  };

  // team 1
  const player1 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[0],
    position: 'PG'
  });
  const player2 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[0],
    position: 'SG'
  });
  const player3 = await core.createPlayer({
    ...starPlayerTemplate,
    teamId: teamIds[0],
    position: 'SF'
  });
  const player4 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[0],
    position: 'PF'
  });
  const player5 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[0],
    position: 'C'
  });
  team1Ids.push(player1, player2, player3, player4, player5);

  // team 2
  const player6 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[1],
    position: 'PG'
  });
  const player7 = await core.createPlayer({
    ...starPlayerTemplate,
    teamId: teamIds[1],
    position: 'SG'
  });
  const player8 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[1],
    position: 'SF'
  });
  const player9 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[1],
    position: 'PF'
  });
  const player10 = await core.createPlayer({
    ...rolePlayerTemplate,
    teamId: teamIds[1],
    position: 'C'
  });
  team2Ids.push(player6, player7, player8, player9, player10);

  return teamIds;
}

async function main() {
  const teamIds = await seedDb();
  const team1 = await core.getTeamBySeason(1, 2024);
  const team2 = await core.getTeamBySeason(2, 2024);

  const matches = [];
  for (let i = 0; i < 100; i++) {
    const match = await core.processMatch(
      { homeTeam: team1, awayTeam: team2, seasonStage: 'regular_season' },
      new Date()
    );
    matches.push(match);
  }

  const match = await core.processMatch(
    { homeTeam: team1, awayTeam: team2, seasonStage: 'regular_season' },
    new Date()
  );

  console.log(formatTeamBoxScore(match));

  // // const match = simulateMatch({ homeTeam: team1, awayTeam: team2 });
  // console.log('\nBOSTON CELTICS');
  // console.log(formatTeamBoxScore(match.homeTeamStatline.map(stats => ({
  //   name: stats.name,
  //   minutes: Math.round(stats.secs_played / 60),
  //   stats
  // }))));

  // console.log('\nPHILADELPHIA 76ERS');
  // console.log(formatTeamBoxScore(match.awayTeamStatline.map(stats => ({
  //   name: stats.name,
  //   minutes: Math.round(stats.secs_played / 60),
  //   stats
  // }))));
}

main().catch((err) => {
  console.error(err);
});
