import { world } from '@minecraft/server';
import { Logger } from '../vendor/logger.js';

const log = Logger.getLogger('Init');
const queue = [];
let loaded = false;

world.afterEvents.worldLoad.subscribe(() => {
	loaded = true;
	log.debug(`Loading ${queue.length} function${queue.length === 1 ? '' : 's'}.`);
	while (queue.length > 0) {
		queue.shift()();
	}
});

export default function AfterWorldLoad(fn) {
	if (loaded) {
		fn();
	} else {
		queue.push(fn);
	}
}
