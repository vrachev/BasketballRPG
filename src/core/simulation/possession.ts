/*
* Simulate a basketball possession
*/

import { Player } from '../../data';

// Possession Types

type Pass = {
  type: "pass";
  passer: Player;
  receiver: Player;
};

type Assist = {
  type: "assist";
  assister: Player;
  scorer: Player;
};

type Turnover = {
  type: "turnover";
  player: Player;
  cause: "bad pass" | "steal" | "offensive foul" | "shot clock violation" | "other";
};

type Foul = {
  type: "foul";
  offender: Player;
  fouled: Player;
  foulType: "personal" | "technical" | "flagrant";
};

type OutOfBounds = {
  type: "out_of_bounds";
  lastTouchedBy: Player;
};

type TwoPointShotAttempt = {
  type: "two_point_shot_attempt";
  shooter: Player;
  distance: number;
  defended: boolean;
};

type TwoPointShotSuccess = TwoPointShotAttempt & {
  type: "two_point_shot_success";
};

type ThreePointShotAttempt = {
  type: "three_point_shot_attempt";
  shooter: Player;
  distance: number;
  defended: boolean;
};

type ThreePointShotSuccess = ThreePointShotAttempt & {
  type: "three_point_shot_success";
};

type FreeThrowShotAttempt = {
  type: "free_throw_shot_attempt";
  shooter: Player;
};

type FreeThrowShotSuccess = FreeThrowShotAttempt & {
  type: "free_throw_shot_success";
};

type OffensiveRebound = {
  type: "offensive_rebound";
  rebounder: Player;
};

type DefensiveRebound = {
  type: "defensive_rebound";
  rebounder: Player;
};

type Timeout = {
  type: "timeout";
  team: string;
  timeoutType: "full" | "short";
};

type EndOfPeriod = {
  type: "end_of_period";
  period: number;
};

type EndOfGame = {
  type: "end_of_game";
  finalScore: {
    homeTeam: number;
    awayTeam: number;
  };
};

type PossessionOutcomeDetails =
  | Pass
  | Assist
  | Turnover
  | Foul
  | OutOfBounds
  | TwoPointShotAttempt
  | TwoPointShotSuccess
  | ThreePointShotAttempt
  | ThreePointShotSuccess
  | FreeThrowShotAttempt
  | FreeThrowShotSuccess
  | OffensiveRebound
  | DefensiveRebound
  | Timeout
  | EndOfPeriod
  | EndOfGame;
