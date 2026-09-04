import { createNewsWithProp } from './News';
import { gameProjects } from '$lib/ts/stores/Stores';
import { Random } from '../namespaces/Random';
import { get } from 'svelte/store';
import { SoftwareReleaseLifeCycle } from '../enums/SoftwareReleaseLifeCycle';

export function runRandomEvents(currentDate: Date) {
	// basic random events engine: produce an event every invocation; caller can schedule it bi-weekly
	const released = get(gameProjects).filter((g) => g.phase === SoftwareReleaseLifeCycle.Release);
	if (released.length === 0) return;

	const roll = Random.Random01();

	if (roll < 0.33) {
		// market boom
		createNewsWithProp('Market Boom', currentDate, 'MARKET_BOOM');
		released.slice(0, 3).forEach((g) => {
			if (typeof g.hype === 'number') g.hype += Random.RangeInt(10, 50);
		});
	} else if (roll < 0.66) {
		// scandal
		createNewsWithProp('Industry Scandal', currentDate, 'SCANDAL');
		released.slice(0, 3).forEach((g) => {
			if (typeof g.hype === 'number') g.hype = Math.max(0, g.hype - Random.RangeInt(10, 40));
		});
	} else {
		// trend
		createNewsWithProp('New Trend Emerges', currentDate, 'TREND');
		// no direct global effect for now
	}
}
