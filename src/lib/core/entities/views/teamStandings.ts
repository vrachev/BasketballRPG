import { getDb } from '../../../data/index.js';
import type { TeamInfo } from '../../../data/index.js';
import { logger } from '../../../logger.js';

export type WinLossRecord = {
  wins: number;
  losses: number;
};

export type TeamStanding = TeamInfo & {
  // Record
  totalRecord: WinLossRecord;
  winPct: number;
  gamesBack: number;
  conferenceRecord: WinLossRecord;
  divisionRecord: WinLossRecord;
  homeRecord: WinLossRecord;
  awayRecord: WinLossRecord;
  // last10: string;
  // streak: string;

  // Rankings
  conferenceRank: number;

  // Stats
  ppg: number;
  // oppPPG: number;
  // plusMinus: number;
};

export const getTeamStandings = async (
  seasonId: number,
  conference?: 'Eastern' | 'Western'
): Promise<TeamStanding[]> => {
  logger.debug({ seasonId, conference }, "Getting team standings");
  const db = await getDb();

  let query = db
    .selectFrom('team_info as t')
    .innerJoin('team_season as ts', 'ts.team_id', 't.id')
    .selectAll('t')
    .select([
      'ts.wins',
      'ts.losses',
      'ts.pts',
      'ts.games_played',
      'ts.conference_wins',
      'ts.conference_losses',
      'ts.division_wins',
      'ts.division_losses',
      'ts.home_wins',
      'ts.home_losses',
      'ts.away_wins',
      'ts.away_losses'
    ])
    .where('ts.season_id', '=', seasonId);

  if (conference) {
    query = query.where('t.conference', '=', conference);
  }

  const rawResults = await query.execute();
  logger.trace({ standings: rawResults }, "Raw standings data retrieved");

  const results = rawResults.map(res => ({
    ...res,
    totalRecord: {
      wins: res.wins,
      losses: res.losses,
    },
    gamesBack: -1,
    winPct: res.wins / res.games_played,
    ppg: res.pts / res.games_played,
    conferenceRecord: {
      wins: res.conference_wins,
      losses: res.conference_losses,
    },
    divisionRecord: {
      wins: res.division_wins,
      losses: res.division_losses,
    },
    homeRecord: {
      wins: res.home_wins,
      losses: res.home_losses
    },
    awayRecord: {
      wins: res.away_wins,
      losses: res.away_losses
    }
  }));

  results.sort((a, b) => {
    return b.winPct - a.winPct;
  });

  const calculateGamesBack = (
    teamWins: number,
    teamLosses: number,
    firstPlaceWins: number,
    firstPlaceLosses: number,
  ): number => {
    return (firstPlaceWins - teamWins) / 2 + (teamLosses - firstPlaceLosses) / 2;
  };

  const mappedResults = results.map((team, i) => ({
    id: team.id,
    name: team.name,
    city: team.city,
    abbreviation: team.abbreviation,
    conference: team.conference,
    division: team.division,

    totalRecord: team.totalRecord,
    winPct: team.winPct,
    gamesBack: calculateGamesBack(team.wins, team.losses, results[0].wins, results[0].losses),
    conferenceRecord: team.conferenceRecord,
    divisionRecord: team.divisionRecord,
    homeRecord: team.homeRecord,
    awayRecord: team.awayRecord,

    conferenceRank: i + 1,

    ppg: team.ppg,
  }));

  return mappedResults;
};

// Helper function to get conference standings
export const getConferenceStandings = async (
  seasonId: number,
  conference: 'Eastern' | 'Western'
): Promise<TeamStanding[]> => {
  return getTeamStandings(seasonId, conference);
};
