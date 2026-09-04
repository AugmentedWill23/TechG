import { Random } from '$lib/ts/namespaces/Random';
import { get } from 'svelte/store';
import { gameProjects, companies } from '$lib/ts/stores/Stores';
import { cash } from '$lib/ts/stores/Cash';
import { createNewsWithProp } from './News';

export function runRandomEvents(currentDate: Date) {
  // small monthly chance
  if (Random.Random01() < 0.07) {
    const eventType = Random.RangeInt(0, 3);
    if (eventType === 0) {
      // market boom: give small bonus to all released games
      get(gameProjects).forEach(g => {
        if (g.phase === 2) {
          const bonus = Math.floor(Random.RangeInt(500, 4000) * (g.gamesize || 1));
          cash.add('Market Boom Bonus', bonus);
          createNewsWithProp(g.name, currentDate, 'MARKET_BOOM');
        }
      });
    } else if (eventType === 1) {
      // scandal reduces fame of a random company
      const comps = get(companies);
      if (comps.length === 0) return;
      const idx = Random.RangeInt(0, comps.length - 1);
      const victim = comps[idx];
      const loss = Random.RangeInt(1, 10);
      victim.fame = Math.max(0, (victim.fame || 0) - loss);
      createNewsWithProp(victim.name, currentDate, 'COMPANY_SCANDAL');
    } else {
      // trend: small hype bump for a random game
      const games = get(gameProjects);
      if (games.length === 0) return;
      const g = games[Random.RangeInt(0, games.length - 1)];
      g.hype += Random.RangeInt(10, 100);
      createNewsWithProp(g.name, currentDate, 'TREND_GENRE');
    }
  }
}
