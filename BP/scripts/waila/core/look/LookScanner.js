import { LocationOutOfWorldBoundariesError } from '@minecraft/server';

import ignoredBlockRender from '../../datasets/ignoredBlockRender.js';
import { BlockHandler } from '../BlockHandler.js';
import { EntityHandler } from '../EntityHandler.js';
import WailaLogger from '../../utils/Logger.js';

export class LookScanner {
	constructor() {
		this.log = WailaLogger.get('LookScanner');
	}

	scan(player, maxDistance) {
		try {
			const entityLookAt = player.getEntitiesFromViewDirection({ maxDistance });
			if (entityLookAt.length > 0 && entityLookAt[0]?.entity) {
				return EntityHandler.createLookupData(entityLookAt[0].entity);
			}

			const blockLookAt = player.getBlockFromViewDirection({
				includeLiquidBlocks: !player.isInWater,
				includePassableBlocks: !player.isInWater,
				maxDistance,
			});

			if (
				blockLookAt?.block &&
				!ignoredBlockRender.some((entry) => entry.includes(blockLookAt.block.typeId))
			) {
				return BlockHandler.createLookupData(blockLookAt.block);
			}

			return {
				type: undefined,
				hitIdentifier: '__r4ui:none',
			};
		} catch (error) {
			if (!(error instanceof LocationOutOfWorldBoundariesError)) {
				this.log.error(`Error while scanning look target: ${error}`);
			}
			return {
				type: undefined,
				hitIdentifier: '__r4ui:none',
			};
		}
	}
}
