// Simulate a basketball match

import { Team } from "../../data";
import { possessionConstants } from "./constants";
import { PossessionResult, simulatePossession } from "./possession";
import { Lineup } from "../../data";

export type MatchInput = {
  homeTeam: Team,
  awayTeam: Team,
  date: Date,
  seasonStage: 'regular_season' | 'playoffs',
};

const getTeamsForPeriod = (
  period: number,
  homeTeam: Team,
  awayTeam: Team
): [Team, Team] => {
  if (period === 1) {
    // TODO implement more realistic tip off. 50/50 for now.
    const tipOffWinner = Math.random() < 0.5 ? homeTeam : awayTeam;
    const tipOffLoser = tipOffWinner === homeTeam ? awayTeam : homeTeam;
    return [tipOffWinner, tipOffLoser];
  }

  // Get previous period's teams and swap based on quarter
  const offensiveTeam = period % 2 === 1 ? homeTeam : awayTeam;
  const defensiveTeam = offensiveTeam === homeTeam ? awayTeam : homeTeam;
  return [offensiveTeam, defensiveTeam];
};

const determineLineup = (team: Team): Lineup => {
  const lineup = team.players.slice(0, 5);
  return lineup as Lineup;
};

export const simulateMatch = ({ homeTeam, awayTeam, seasonStage }: MatchInput): PossessionResult[] => {
  let gameClock = possessionConstants.periodLength;
  let period = 1;

  let [offensiveTeam, defensiveTeam] = getTeamsForPeriod(period, homeTeam, awayTeam);

  const possessionResults: PossessionResult[] = [];
  let gameOver = false;
  let i = 0;
  while (!gameOver) {
    const offensiveLineup = determineLineup(offensiveTeam);
    const defensiveLineup = determineLineup(defensiveTeam);
    const possession = simulatePossession({ offensiveLineup, defensiveLineup, period, gameClock });
    i++;
    gameClock -= possession.timeLength;
    possessionResults.push(possession);
    if (gameClock <= 0) {
      if (period === 4) {
        gameOver = true;
      } else {
        period++;
        gameClock = possessionConstants.periodLength;
        [offensiveTeam, defensiveTeam] = getTeamsForPeriod(period, homeTeam, awayTeam);
      }
    }

    // Swap offensive and defensive teams if possession changes
    if (possession.possessionChange) {
      const temp = offensiveTeam;
      offensiveTeam = defensiveTeam;
      defensiveTeam = temp;
    }
  }

  return possessionResults;
};
