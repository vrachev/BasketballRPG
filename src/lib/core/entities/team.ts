import type { Insertable } from 'kysely';
import {
  db,
  PLAYER_SEASON_TABLE,
  TEAM_TABLE,
  type Team,
  TEAM_SEASON_TABLE,
  type Season,
  type Lineup,
  type TeamInfoTable,
  type Player
} from '../../data/index.js';
import { getPlayerFromHistory, getPlayerHistory } from './player.js';
import { getSeason } from './season.js';

const cities = {
  Eastern: {
    Atlantic: [
      { city: 'Boston', name: 'Celtics', abbreviation: 'BOS' },
      { city: 'Philadelphia', name: '76ers', abbreviation: 'PHI' },
      { city: 'New York', name: 'Knicks', abbreviation: 'NYK' },
      { city: 'Brooklyn', name: 'Nets', abbreviation: 'BKN' },
      { city: 'Toronto', name: 'Raptors', abbreviation: 'TOR' }
    ],
    Central: [
      { city: 'Chicago', name: 'Bulls', abbreviation: 'CHI' },
      { city: 'Cleveland', name: 'Cavaliers', abbreviation: 'CLE' },
      { city: 'Detroit', name: 'Pistons', abbreviation: 'DET' },
      { city: 'Milwaukee', name: 'Bucks', abbreviation: 'MIL' },
      { city: 'Indiana', name: 'Pacers', abbreviation: 'IND' }
    ],
    Southeast: [
      { city: 'Miami', name: 'Heat', abbreviation: 'MIA' },
      { city: 'Atlanta', name: 'Hawks', abbreviation: 'ATL' },
      { city: 'Washington', name: 'Wizards', abbreviation: 'WAS' },
      { city: 'Orlando', name: 'Magic', abbreviation: 'ORL' },
      { city: 'Charlotte', name: 'Hornets', abbreviation: 'CHA' }
    ]
  },
  Western: {
    Northwest: [
      { city: 'Minnesota', name: 'Timberwolves', abbreviation: 'MIN' },
      { city: 'Oklahoma City', name: 'Thunder', abbreviation: 'OKC' },
      { city: 'Portland', name: 'Trail Blazers', abbreviation: 'POR' },
      { city: 'Denver', name: 'Nuggets', abbreviation: 'DEN' },
      { city: 'Utah', name: 'Jazz', abbreviation: 'UTA' }
    ],
    Pacific: [
      { city: 'Los Angeles', name: 'Lakers', abbreviation: 'LAL' },
      { city: 'Los Angeles', name: 'Clippers', abbreviation: 'LAC' },
      { city: 'Golden State', name: 'Warriors', abbreviation: 'GSW' },
      { city: 'Phoenix', name: 'Suns', abbreviation: 'PHX' },
      { city: 'Sacramento', name: 'Kings', abbreviation: 'SAC' }
    ],
    Southwest: [
      { city: 'Houston', name: 'Rockets', abbreviation: 'HOU' },
      { city: 'Dallas', name: 'Mavericks', abbreviation: 'DAL' },
      { city: 'San Antonio', name: 'Spurs', abbreviation: 'SAS' },
      { city: 'Memphis', name: 'Grizzlies', abbreviation: 'MEM' },
      { city: 'New Orleans', name: 'Pelicans', abbreviation: 'NOP' }
    ]
  }
};

export const createTeams = async (): Promise<void> => {
  for (const [conference, divisions] of Object.entries(cities)) {
    for (const [division, teams] of Object.entries(divisions)) {
      for (const team of teams) {
        const teamRecord: Insertable<TeamInfoTable> = {
          name: team.name,
          city: team.city,
          abbreviation: team.abbreviation,
          conference: conference,
          division: division
        };
        await db
          .insertInto(TEAM_TABLE)
          .values(teamRecord)
          .returning('id')
          .executeTakeFirstOrThrow();
      }
    }
  }
};

export const getTeamId = async (city: string): Promise<number> => {
  const team = await db
    .selectFrom(TEAM_TABLE)
    .select('id')
    .where('city', '=', city)
    .executeTakeFirstOrThrow();
  if (!team) {
    throw new Error(`Team with city ${city} not found`);
  }
  return team.id;
};

export const getTeamIds = async (): Promise<number[]> => {
  const teams = await db
    .selectFrom(TEAM_TABLE)
    .select('id')
    .execute();
  if (teams.length === 0) {
    throw new Error(`No teams found`);
  }
  return teams.map(team => team.id);
};

export const getTeams = async (
  seasonStartingYear: number,
  teamId?: number
): Promise<Team[]> => {
  const season = await getSeason(seasonStartingYear);
  if (!season) {
    throw new Error(`Season with year ${seasonStartingYear} not found`);
  }

  // Build query based on whether we want all teams or a specific team
  let query = db
    .selectFrom(TEAM_TABLE)
    .selectAll();

  if (teamId) {
    query = query.where('id', '=', teamId);
  }

  const teams = await query.execute();

  if (teams.length === 0) {
    throw new Error(`No teams found${teamId ? ` with id ${teamId}` : ''}`);
  }

  // Get team seasons and players for each team
  const teamsWithData = await Promise.all(
    teams.map(async (team) => {
      const teamSeason = await db
        .selectFrom(TEAM_SEASON_TABLE)
        .selectAll()
        .where('team_id', '=', team.id)
        .where('season_id', '=', season.id)
        .executeTakeFirstOrThrow();

      if (!teamSeason) {
        throw new Error(`Team season not found for team ${team.id} in year ${seasonStartingYear}`);
      }

      const players = await getTeamPlayersBySeason(team.id, season);
      const startingLineup = players.filter(p => p.playerInfo.is_starting === 1);
      if (startingLineup.length !== 5) {
        throw new Error(
          `Starting lineup for team ${team.id} in year ${seasonStartingYear} does not have 5 players, ` +
          `there are ${startingLineup.length} players`
        );
      }

      return {
        teamInfo: team,
        teamSeason,
        players,
        startingLineup: startingLineup as Lineup,
      };
    })
  );

  return teamsWithData;
};

export const getTeam = async (
  teamId: number,
  seasonStartingYear: number
): Promise<Team> => {
  const teams = await getTeams(seasonStartingYear, teamId);
  return teams[0];
};

const getTeamPlayersBySeason = async (
  teamId: number,
  season: Season
): Promise<Player[]> => {
  // Need unique player ids, because we create 2 rows for each player, one for regular season and one for playoffs
  const playerIds = await db
    .selectFrom(PLAYER_SEASON_TABLE)
    .select('player_id')
    .where('team_id', '=', teamId)
    .distinct()
    .execute();

  if (playerIds.length === 0) {
    console.warn(`No players found for team ${teamId} in ${season.start_year}`);
    return [];
  }

  const players = await Promise.all(
    playerIds.map((row) =>
      getPlayerHistory(row.player_id).then((history) =>
        getPlayerFromHistory(history, season.start_year)
      )
    )
  );

  return players;
};
