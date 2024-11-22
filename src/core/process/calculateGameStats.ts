import { MatchInput } from '../simulation/match';
import { GameStats, PlayerEvent, PossessionResult, StatlineTeam } from '../../data';

export const calculateGameStats = (
  possessionResults: PossessionResult[],
  { homeTeam, awayTeam }: MatchInput
): GameStats => {
  // Initialize player stats arrays
  let homePlayerStats: PlayerEvent[] = [];
  let awayPlayerStats: PlayerEvent[] = [];

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
  const homeTeamStatline = rollupTeamStats(homePlayerStats);
  const awayTeamStatline = rollupTeamStats(awayPlayerStats);

  const winner = homeTeamStatline.pts > awayTeamStatline.pts ? 'home' : 'away';

  return { homeTeam, awayTeam, homeTeamStatline, awayTeamStatline, homePlayerStats, awayPlayerStats, winner };
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
        fouls: 0,
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
      fouls: existing.fouls + event.fouls
    });
  });

  const playerEvents = Array.from(eventsByPlayer.values());
  return playerEvents;
};

const rollupTeamStats = (events: PlayerEvent[]): StatlineTeam => {
  // sum up stats
  const stats: StatlineTeam = events.reduce((acc, event) => ({
    secs_played: acc.secs_played + event.secs_played,
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
    fouls: acc.fouls + event.fouls,
  }), {
    secs_played: 0,
    fgm: 0, fga: 0,
    two_fgm: 0, two_fga: 0,
    three_fgm: 0, three_fga: 0,
    ftm: 0, fta: 0,
    pts: 0,
    off_reb: 0, def_reb: 0, reb: 0,
    ast: 0, stl: 0, blk: 0,
    tov: 0, fouls: 0,
  });

  return stats;
};
