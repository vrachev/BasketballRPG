import { PlayerEvent } from "@src/core/simulation/possession";

type BoxScoreRow = {
  name: string;
  number?: string;
  minutes: number;
  stats: PlayerEvent;
};

const formatBoxScoreRow = (row: BoxScoreRow): string => {
  const stats = row.stats;
  const fgm = stats.twoFgm + stats.threeFgm;
  const fga = stats.twoFga + stats.threeFga;
  const reb = stats.oReb + stats.dReb;

  return [
    row.name.padEnd(20),
    row.number ? `#${row.number}`.padEnd(5) : "".padEnd(5),
    `${Math.round(row.stats.seconds / 60)}`.padEnd(4),
    `${fgm}-${fga}`.padEnd(8),
    `${stats.threeFgm}-${stats.threeFga}`.padEnd(8),
    `${stats.ftm}-${stats.fta}`.padEnd(8),
    `${stats.oReb}`.padEnd(6),
    `${stats.dReb}`.padEnd(6),
    `${reb}`.padEnd(5),
    `${stats.assist}`.padEnd(5),
    `${stats.steal}`.padEnd(5),
    `${stats.block}`.padEnd(5),
    `${stats.turnover}`.padEnd(4),
    `${stats.foul}`.padEnd(4),
    `${stats.points}`.padEnd(4)
  ].join(" ");
};

export const formatTeamBoxScore = (players: BoxScoreRow[]): string => {
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
    "PF".padEnd(4),
    "PTS".padEnd(4)
  ].join(" ");

  // Format each player row
  const playerRows = players.map(player => formatBoxScoreRow(player));

  // Calculate team totals
  const teamTotals = players.reduce((acc, player) => ({
    pid: 0,
    name: "",
    seconds: 0,
    twoFgm: acc.twoFgm + player.stats.twoFgm,
    twoFga: acc.twoFga + player.stats.twoFga,
    threeFgm: acc.threeFgm + player.stats.threeFgm,
    threeFga: acc.threeFga + player.stats.threeFga,
    ftm: acc.ftm + player.stats.ftm,
    fta: acc.fta + player.stats.fta,
    points: acc.points + player.stats.points,
    oReb: acc.oReb + player.stats.oReb,
    dReb: acc.dReb + player.stats.dReb,
    assist: acc.assist + player.stats.assist,
    steal: acc.steal + player.stats.steal,
    block: acc.block + player.stats.block,
    turnover: acc.turnover + player.stats.turnover,
    foul: acc.foul + player.stats.foul
  }), {
    pid: 0, name: "", seconds: 0, twoFgm: 0, twoFga: 0, threeFgm: 0, threeFga: 0,
    ftm: 0, fta: 0, points: 0, oReb: 0, dReb: 0, assist: 0,
    steal: 0, block: 0, turnover: 0, foul: 0
  });

  // Format team totals row
  const totalsRow = formatBoxScoreRow({
    name: "Team Totals",
    minutes: players.reduce((acc, p) => acc + p.stats.seconds / 60, 0),
    stats: teamTotals
  });

  // Combine all parts with separators
  return [
    header,
    "-".repeat(header.length),
    ...playerRows,
    "-".repeat(header.length),
    totalsRow
  ].join("\n");
};
