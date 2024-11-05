import { MatchInput, TeamGameEvent } from '../simulation/match';
import { PlayerEvent, PossessionResult } from '../simulation/possession';
import { Team } from "@src/data";

export type GameStats = {
  homeTeam: Team;
  awayTeam: Team;
  homeTeamStatline: TeamGameEvent;
  awayTeamStatline: TeamGameEvent;
  homePlayerStats: PlayerEvent[];
  awayPlayerStats: PlayerEvent[];
};

export const calculateGameStats = (possessionResults: PossessionResult[], { homeTeam, awayTeam }: MatchInput): GameStats => {
  // Initialize player stats arrays
  let homePlayerStats: PlayerEvent[] = [];
  let awayPlayerStats: PlayerEvent[] = [];

  console.log('num players', new Set(possessionResults.flatMap(p => p.playerEvents.map(e => e.pid))).size);

  // Separate events by team
  homePlayerStats = rollupPlayerEvents(
    possessionResults.flatMap(p => p.playerEvents.filter(e =>
      homeTeam.players.some(p => p.playerInfo.id === e.pid)
    ))
  );
  awayPlayerStats = rollupPlayerEvents(
    possessionResults.flatMap(p => p.playerEvents.filter(e =>
      awayTeam.players.some(p => p.playerInfo.id === e.pid)
    ))
  );

  // Calculate team statlines using rollupTeamStats
  const homeTeamStatline = rollupTeamStats(homePlayerStats, homeTeam.teamInfo.id);
  const awayTeamStatline = rollupTeamStats(awayPlayerStats, awayTeam.teamInfo.id);

  return { homeTeam, awayTeam, homeTeamStatline, awayTeamStatline, homePlayerStats, awayPlayerStats };
};

const rollupPlayerEvents = (events: PlayerEvent[]): PlayerEvent[] => {
  const eventsByPlayer = new Map<number, PlayerEvent>();

  events.forEach(event => {
    if (!eventsByPlayer.has(event.pid)) {
      eventsByPlayer.set(event.pid, {
        pid: event.pid,
        secs_played: 0,
        fgm: 0,
        fga: 0,
        two_fgm: 0,
        two_fga: 0,
        three_fgm: 0,
        three_fga: 0,
        ftm: 0,
        fta: 0,
        pts: 0,
        off_reb: 0,
        def_reb: 0,
        reb: 0,
        ast: 0,
        stl: 0,
        blk: 0,
        tov: 0,
        pf: 0
      });
    }

    const existing = eventsByPlayer.get(event.pid)!;

    eventsByPlayer.set(event.pid, {
      pid: event.pid,
      secs_played: existing.secs_played + event.secs_played,
      fgm: existing.fgm + event.fgm,
      fga: existing.fga + event.fga,
      two_fgm: existing.two_fgm + event.two_fgm,
      two_fga: existing.two_fga + event.two_fga,
      three_fgm: existing.three_fgm + event.three_fgm,
      three_fga: existing.three_fga + event.three_fga,
      ftm: existing.ftm + event.ftm,
      fta: existing.fta + event.fta,
      pts: existing.pts + event.pts,
      off_reb: existing.off_reb + event.off_reb,
      def_reb: existing.def_reb + event.def_reb,
      reb: existing.reb + event.reb,
      ast: existing.ast + event.ast,
      stl: existing.stl + event.stl,
      blk: existing.blk + event.blk,
      tov: existing.tov + event.tov,
      pf: existing.pf + event.pf
    });
  });

  return Array.from(eventsByPlayer.values());
};

const rollupTeamStats = (events: PlayerEvent[], teamId: number): TeamGameEvent => {
  // Initialize with zero values
  const stats = events.reduce((acc, event) => ({
    fgm: acc.fgm + event.fgm,
    fga: acc.fga + event.fga,
    two_fgm: acc.two_fgm + event.two_fgm,
    two_fga: acc.two_fga + event.two_fga,
    three_fgm: acc.three_fgm + event.three_fgm,
    three_fga: acc.three_fga + event.three_fga,
    ftm: acc.ftm + event.ftm,
    fta: acc.fta + event.fta,
    pts: acc.pts + event.pts,
    off_reb: acc.off_reb + event.off_reb,
    def_reb: acc.def_reb + event.def_reb,
    reb: acc.reb + event.reb,
    ast: acc.ast + event.ast,
    stl: acc.stl + event.stl,
    blk: acc.blk + event.blk,
    tov: acc.tov + event.tov,
    pf: acc.pf + event.pf
  }), {
    fgm: 0, fga: 0,
    two_fgm: 0, two_fga: 0,
    three_fgm: 0, three_fga: 0,
    ftm: 0, fta: 0,
    pts: 0,
    off_reb: 0, def_reb: 0, reb: 0,
    ast: 0, stl: 0, blk: 0,
    tov: 0, pf: 0
  });

  // Calculate basic percentages
  const fg_pct = stats.fga > 0 ? stats.fgm / stats.fga : 0;
  const two_fg_pct = stats.two_fga > 0 ? stats.two_fgm / stats.two_fga : 0;
  const three_fg_pct = stats.three_fga > 0 ? stats.three_fgm / stats.three_fga : 0;
  const ft_pct = stats.fta > 0 ? stats.ftm / stats.fta : 0;

  // Calculate advanced stats
  const efg_pct = stats.fga > 0 ? (stats.fgm + 0.5 * stats.three_fgm) / stats.fga : 0;
  const ts_pct = (stats.fga > 0 || stats.fta > 0)
    ? stats.pts / (2 * (stats.fga + 0.44 * stats.fta))
    : 0;

  const pace = 100;
  const off_rating = 100;
  const def_rating = 100;
  const net_rating = off_rating - def_rating;

  return {
    teamId,
    ...stats,
    fg_pct,
    two_fg_pct,
    three_fg_pct,
    ft_pct,
    efg_pct,
    ts_pct,
    pace,
    off_rating,
    def_rating,
    net_rating,
    fouls: stats.pf  // for teams, pf -> fouls
  };
};
