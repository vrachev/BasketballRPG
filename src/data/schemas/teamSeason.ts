import { SchemaTs, ForeignKeyType } from '../sqlTypes';

const teamSeasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  team_id: 'INTEGER',
  year: 'INTEGER',
  wins: 'INTEGER',
  losses: 'INTEGER',
  conference_rank: 'INTEGER',
  playoff_seed: 'INTEGER',
  offensive_rating: 'REAL',
  defensive_rating: 'REAL',
  net_rating: 'REAL',
  pace: 'REAL',
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
} as const;

type TeamSeason = SchemaTs<typeof teamSeasonSchemaSql>;

export { teamSeasonSchemaSql, TeamSeason };
