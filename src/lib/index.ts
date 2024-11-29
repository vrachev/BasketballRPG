import { createTeams } from './core/entities/team.js';
import * as core from './core/index.js';
import { createSeason } from './core/entities/season.js';
import { generateSchedule } from './core/season/createSchedule.js';
import { db, TEAM_TABLE } from './data/index.js';

async function seedDb() {
  // Check if teams already exist
  const existingTeams = await db
    .selectFrom(TEAM_TABLE)
    .select(db.fn.countAll().as('count'))
    .executeTakeFirst();

  if (Number(existingTeams?.count) > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  await createSeason(2024, 2025);
  await createTeams();

  const teamIds = await core.getTeamIds();

  // await core.createTeamSeason(teamIds[0], 1);
  // await core.createTeamSeason(teamIds[1], 1);
  await core.createTeamSeason(teamIds, 1);

  // Create 5 players for each team
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

  // Create players for each team
  for (const teamId of teamIds) {
    // Create 4 role players and 1 star player
    const positions = ['PG', 'SG', 'SF', 'PF', 'C'] as const;

    for (let i = 0; i < positions.length; i++) {
      const template = i === 2 ? starPlayerTemplate : rolePlayerTemplate;
      await core.createPlayer({
        ...template,
        teamId: teamId,
        position: positions[i],
      });
    }
  }

  return teamIds;
}

async function main() {
  const teamIds = await seedDb();
  const team1 = await core.getTeam(1, 2024);
  const team2 = await core.getTeam(2, 2024);

  const teams = await core.getTeams(2024);

  const schedule = generateSchedule(teams, 'regular_season', 2024);

  for (const matchInput of schedule) {
    const res = await core.processMatch(matchInput);
    console.log(
      `Game ${schedule.indexOf(matchInput) + 1}: ` +
      `${matchInput.homeTeam.teamInfo.name} vs ${matchInput.awayTeam.teamInfo.name} - ` +
      `Winner: ${res.winner === 'home' ?
        matchInput.homeTeam.teamInfo.name :
        matchInput.awayTeam.teamInfo.name}`
    );
  }

  // const matches = [];
  // for (let i = 0; i < 100; i++) {
  //   const match = await core.processMatch(
  //     { homeTeam: team1, awayTeam: team2, date: new Date(), seasonStage: 'regular_season' },
  //   );
  //   matches.push(match);
  // }

  // const match = await core.processMatch(
  //   { homeTeam: team1, awayTeam: team2, date: new Date(), seasonStage: 'regular_season' },
  // );

  // console.log(formatTeamBoxScore(match));

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