// Simulate a basketball match

import { Lineup } from "../entities/lineup";
import { possessionConstants } from "./constants";
import { PlayerEvent, PossessionResult, simulatePossession } from "./possession";

type MatchInput = {
  homeTeam: Lineup,
  awayTeam: Lineup,
};

type MatchResult = {
  id: number,
  homeTeamStats: PlayerEvent[],
  awayTeamStats: PlayerEvent[],
};

const rollupPlayerEvents = (events: PlayerEvent[]): PlayerEvent[] => {
  const eventsByPlayer = new Map<number, PlayerEvent>();

  events.forEach(event => {
    if (!eventsByPlayer.has(event.pid)) {

      eventsByPlayer.set(event.pid, {
        pid: event.pid,
        name: event.name,
        twoFgm: 0,
        twoFga: 0,
        threeFgm: 0,
        threeFga: 0,
        ftm: 0,
        fta: 0,
        points: 0,
        oReb: 0,
        dReb: 0,
        assist: 0,
        steal: 0,
        block: 0,
        turnover: 0,
        foul: 0,
        seconds: 0,
      });
    }

    const existing = eventsByPlayer.get(event.pid)!;

    eventsByPlayer.set(event.pid, {
      pid: event.pid,
      name: event.name,
      seconds: existing.seconds + event.seconds,
      twoFgm: existing.twoFgm + event.twoFgm,
      twoFga: existing.twoFga + event.twoFga,
      threeFgm: existing.threeFgm + event.threeFgm,
      threeFga: existing.threeFga + event.threeFga,
      ftm: existing.ftm + event.ftm,
      fta: existing.fta + event.fta,
      points: existing.points + event.points,
      oReb: existing.oReb + event.oReb,
      dReb: existing.dReb + event.dReb,
      assist: existing.assist + event.assist,
      steal: existing.steal + event.steal,
      block: existing.block + event.block,
      turnover: existing.turnover + event.turnover,
      foul: existing.foul + event.foul
    });
  });

  return Array.from(eventsByPlayer.values());
};

export const simulateMatch = ({ homeTeam, awayTeam }: MatchInput): MatchResult => {
  let gameClock = possessionConstants.periodLength;
  let period = 1;

  let offensiveTeam = homeTeam;
  let defensiveTeam = awayTeam;

  const possessionResults: PossessionResult[] = [];
  let gameOver = false;
  let i = 0;
  while (!gameOver) {
    const possession = simulatePossession({ offensiveTeam, defensiveTeam, period, gameClock });
    console.log(`Possession ${i}`, possession);
    i++;
    gameClock -= possession.timeLength;
    possessionResults.push(possession);
    if (gameClock <= 0) {
      if (period === 4) {
        gameOver = true;
      } else {
        period++;
        gameClock = possessionConstants.periodLength;
      }
    }

    // Swap offensive and defensive teams if possession changes
    if (possession.possessionChange) {
      const temp = offensiveTeam;
      offensiveTeam = defensiveTeam;
      defensiveTeam = temp;
    }
  }

  console.log(`Match over after ${i} possessions`);
  console.log("possessionResults", possessionResults.length);

  // Separate events by team
  const homeTeamStats = rollupPlayerEvents(
    possessionResults.flatMap(p => p.playerEvents.filter(e =>
      homeTeam.players.some(p => p.playerInfo.id === e.pid)
    ))
  );
  const awayTeamStats = rollupPlayerEvents(
    possessionResults.flatMap(p => p.playerEvents.filter(e =>
      awayTeam.players.some(p => p.playerInfo.id === e.pid)
    ))
  );

  return {
    id: 1,
    homeTeamStats,
    awayTeamStats,
  };
};
