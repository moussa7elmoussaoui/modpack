import { Logger as BoostLogger, LogLevel } from '../vendor/logger.js';
import { OnWorldLoad } from '../vendor/stylish.js';

export default class WailaLogger {
	constructor() {}

	static get(category) {
		const tags = new Set();
		if (category) {
			tags.add(category);
		}
		return BoostLogger.getLogger('WAILA', ...Array.from(tags));
	}

	static init() {
		BoostLogger.setTagsOutputVisibility(true);
		BoostLogger.setLevel(LogLevel.Debug);
	}
}

OnWorldLoad(WailaLogger.init);
