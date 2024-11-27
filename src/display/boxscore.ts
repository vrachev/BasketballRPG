import type { GameStats, PlayerEvent } from '../data/index.js';

type BoxScoreRow = {
  name: string;
  number?: string;
  minutes: number;
  stats: PlayerEvent;
};

const formatBoxScoreRow = (row: BoxScoreRow): string => {
  const stats = row.stats;
  const fgm = stats.two_fgm + stats.three_fgm;
  const fga = stats.two_fga + stats.three_fga;
  const reb = stats.off_reb + stats.def_reb;

  return [
    row.name.padEnd(20),
    row.number ? `#${row.number}`.padEnd(5) : "".padEnd(5),
    `${Math.round(row.stats.secs_played / 60)}`.padEnd(4),
    `${fgm}-${fga}`.padEnd(8),
    `${stats.three_fgm}-${stats.three_fga}`.padEnd(8),
    `${stats.ftm}-${stats.fta}`.padEnd(8),
    `${stats.off_reb}`.padEnd(6),
    `${stats.def_reb}`.padEnd(6),
    `${reb}`.padEnd(5),
    `${stats.ast}`.padEnd(5),
    `${stats.stl}`.padEnd(5),
    `${stats.blk}`.padEnd(5),
    `${stats.tov}`.padEnd(4),
    `${stats.fouls}`.padEnd(4),
    `${stats.pts}`.padEnd(4)
  ].join(" ");
};

export const formatTeamBoxScore = (gameStats: GameStats): string => {
  // Header
  const header = [
    "PLAYER".padEnd(20),
    "#".padEnd(5),
    "MIN".padEnd(4),
    "FG".padEnd(8),
    "3PT".padEnd(8),
    "FT".padEnd(8),
    "OREB".padEnd(6),
    "DREB".padEnd(6),
    "REB".padEnd(5),
    "AST".padEnd(5),
    "STL".padEnd(5),
    "BLK".padEnd(5),
    "TO".padEnd(4),
    "FOULS".padEnd(4),
    "PTS".padEnd(4)
  ].join(" ");

  // Format player rows for both teams
  const homePlayerRows = gameStats.homePlayerStats.map(playerStats => formatBoxScoreRow({
    name: gameStats.homeTeam.players.find(
      (p) => p.playerInfo.id === playerStats.pid
    )?.playerInfo.full_name ?? 'Unknown Player',
    minutes: playerStats.secs_played / 60,
    stats: playerStats
  }));

  const awayPlayerRows = gameStats.awayPlayerStats.map(playerStats => formatBoxScoreRow({
    name: gameStats.awayTeam.players.find(
      (p) => p.playerInfo.id === playerStats.pid
    )?.playerInfo.full_name ?? 'Unknown Player',
    minutes: playerStats.secs_played / 60,
    stats: playerStats
  }));

  // Format team totals using the pre-calculated team statlines
  const homeTotalsRow = formatBoxScoreRow({
    name: gameStats.homeTeam.teamInfo.name,
    minutes: gameStats.homePlayerStats.reduce((acc, p) => acc + p.secs_played / 60, 0),
    stats: {
      ...gameStats.homeTeamStatline,
      pid: 0,
      fouls: gameStats.homeTeamStatline.fouls,
      secs_played: gameStats.homePlayerStats.reduce((acc, p) => acc + p.secs_played, 0)
    }
  });

  const awayTotalsRow = formatBoxScoreRow({
    name: gameStats.awayTeam.teamInfo.name,
    minutes: gameStats.awayPlayerStats.reduce((acc, p) => acc + p.secs_played / 60, 0),
    stats: {
      ...gameStats.awayTeamStatline,
      pid: 0,
      fouls: gameStats.awayTeamStatline.fouls,
      secs_played: gameStats.awayPlayerStats.reduce((acc, p) => acc + p.secs_played, 0)
    }
  });

  // Combine all parts with separators
  return [
    header,
    "-".repeat(header.length),
    ...homePlayerRows,
    "-".repeat(header.length),
    homeTotalsRow,
    "",
    "-".repeat(header.length),
    ...awayPlayerRows,
    "-".repeat(header.length),
    awayTotalsRow
  ].join("\n");
};
