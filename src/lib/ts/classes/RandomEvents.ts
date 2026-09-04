import { createNewsWithProp } from './News';
import { gameProjects } from '$lib/ts/stores/Stores';
import { Random } from '../namespaces/Random';

export function runRandomEvents(currentDate: Date) {
	// basic random events engine: occasionally create news and apply small effects
	const roll = Random.Random01();

	if (roll < 0.03) {
		// market boom
		createNewsWithProp('Market Boom', currentDate, 'MARKET_BOOM');
		// small positive effect on hype for random released games
		get(gameProjects).filter(g => g.phase === 2).slice(0,3).forEach(g => { if (g.hype !== undefined) g.hype += Random.RangeInt(10,50); });
	} else if (roll < 0.06) {
		// scandal
		createNewsWithProp('Industry Scandal', currentDate, 'SCANDAL');
		get(gameProjects).filter(g => g.phase === 2).slice(0,3).forEach(g => { if (g.hype !== undefined) g.hype = Math.max(0, g.hype - Random.RangeInt(10,40)); });
	} else if (roll < 0.12) {
		// trend
		createNewsWithProp('New Trend Emerges', currentDate, 'TREND');
		// small shift in genre popularity could be implemented here
	}
}
