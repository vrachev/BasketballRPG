import { getDb } from '$lib/data/db';
import { SCHEDULE_TABLE } from '$lib/data/constants';
import type { MatchInput } from '../simulation/match';

export async function markGameAsProcessed(matchInput: MatchInput, seasonId: number) {
  const db = await getDb();
  await db
    .updateTable(SCHEDULE_TABLE)
    .set({ is_processed: 1 })
    .where('season_id', '=', seasonId)
    .where('home_team_id', '=', matchInput.homeTeam.teamInfo.id)
    .where('away_team_id', '=', matchInput.awayTeam.teamInfo.id)
    .where('date', '=', matchInput.date.toISOString().slice(0, 10))
    .execute();
}
