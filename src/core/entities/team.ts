import { PLAYER_SEASON_TABLE, Team, TEAM_TABLE } from '../../data';
import { InsertableRecord } from '../../data/sqlTypes';
import { insert, openDb } from '../../db';
import { getPlayerHistory } from './player';
import { PlayerHistory } from '@src/data/schemas/player';

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
        const teamRecord: InsertableRecord<Team> = {
          name: team.name,
          city: team.city,
          abbreviation: team.abbreviation,
          conference: conference,
          division: division
        };
        await insert(teamRecord, TEAM_TABLE);
      }
    }
  }
};

export const getTeamId = async (city: string): Promise<number> => {
  const db = await openDb();
  const team = await db.get<{ id: number; }>(`SELECT id FROM ${TEAM_TABLE} WHERE city = ?`, [city]);
  if (!team) {
    throw new Error(`Team with city ${city} not found`);
  }
  return team.id;
};

export const getTeamPlayers = async (teamId: number, year: number): Promise<PlayerHistory[]> => {
  const db = await openDb();
  const playerIds = await db.all<{ player_id: number; }[]>(`
    SELECT player_id 
    FROM ${PLAYER_SEASON_TABLE} 
    WHERE team_id = ? AND year = ?
  `, [teamId, year]);

  if (playerIds.length === 0) {
    console.warn(`No players found for team ${teamId} in ${year}`);
    return [];
  }

  // get full player history for each player
  const playerHistories = await Promise.all(
    playerIds.map((row) => getPlayerHistory(row.player_id, year))
  );

  return playerHistories;
};
