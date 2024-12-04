import type { TeamStanding } from '../core/entities/views/teamStandings.js';

export function formatStandings(standings: TeamStanding[]): string {
  if (!standings || standings.length === 0) {
    return 'No standings data available';
  }

  const header = [
    'Rank  Team                  W-L      PCT   GB    Home    Away    Conf    PPG'
  ].join('\n');

  const rows = standings.map(team => {
    const teamName = `${team.city} ${team.name}`.padEnd(20);
    const record = `${team.totalRecord.wins}-${team.totalRecord.losses}`.padEnd(8);
    const pct = team.winPct.toFixed(3).padEnd(6);
    const gb = (team.gamesBack === 0 ? '-' : team.gamesBack.toFixed(1)).padEnd(6);
    const home = `${team.homeRecord.wins}-${team.homeRecord.losses}`.padEnd(8);
    const away = `${team.awayRecord.wins}-${team.awayRecord.losses}`.padEnd(8);
    const conf = `${team.conferenceRecord.wins}-${team.conferenceRecord.losses}`.padEnd(8);
    const ppg = team.ppg.toFixed(1);

    return `${team.conferenceRank.toString().padStart(2)}   ${teamName}${record}${pct}${gb}${home}${away}${conf}${ppg}`;
  });

  return [
    '\nTeam Standings',
    '=============',
    header,
    '--------------------------------------------------------------------',
    ...rows,
    '\n'
  ].join('\n');
}

export function printStandings(standings: TeamStanding[]): void {
  const formattedStandings = formatStandings(standings);
  console.log(formattedStandings);
} 
