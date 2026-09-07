import { TicksPerSecond, system } from '@minecraft/server';

import { InventoryMirror } from '../InventoryMirror.js';
import { LookAtObjectTypeEnum } from '../../types/LookAtObjectTypeEnum.js';
import { shouldDisplayFeature } from '../Settings.js';
import { UiBuilder } from './UiBuilder.js';
import WailaLogger from '../../utils/Logger.js';

export class UiController {
	constructor() {
		this.log = WailaLogger.get('UIController');
	}

	present(player, resolution, settings) {
		try {
			const shouldDisplayInventory =
				resolution.metadata.type === LookAtObjectTypeEnum.TILE &&
				shouldDisplayFeature(
					settings.containerInventoryVisibility,
					player.isSneaking,
				);
			const shouldMirrorInventory =
				shouldDisplayInventory &&
				resolution.iconRequests.some(
					(request) =>
						request.slot >= 9 && request.slot <= 35 && request.slot !== 17,
				);

			InventoryMirror.apply(player, resolution.iconRequests, shouldMirrorInventory);
		} catch (error) {
			this.log.warn(`Failed applying inventory mirror: ${error}`);
		}

		const { title, subtitle } = UiBuilder.build(
			player,
			resolution.metadata,
			settings,
			resolution.extendedInfoActive,
		);

		this.scheduleTitleUpdate(player, title, {
			subtitle,
			fadeInDuration: 0,
			fadeOutDuration: 0,
			stayDuration: TicksPerSecond * 60,
		});

		system.runTimeout(() => {
			try {
				InventoryMirror.restore(player);
			} catch (error) {
				this.log.warn(`Failed restoring inventory mirror: ${error}`);
			}
		}, 2);
	}

	clear(player) {
		const options = {
			fadeInDuration: 0,
			fadeOutDuration: 0,
			stayDuration: 0,
		};

		this.scheduleTitleUpdate(player, ' ', options);

		system.run(() => {
			if (!player.isValid) return;
			player.runCommand('title @s reset');
		});

		InventoryMirror.restore(player);
	}

	scheduleTitleUpdate(player, title, options) {
		const normalizedTitle = Array.isArray(title)
			? { rawtext: title }
			: title;

		const normalizedSubtitle = (() => {
			if (!options?.subtitle) return undefined;
			return Array.isArray(options.subtitle)
				? { rawtext: options.subtitle }
				: options.subtitle;
		})();

		const finalOptions = {
			fadeInDuration: options?.fadeInDuration ?? 0,
			fadeOutDuration: options?.fadeOutDuration ?? 0,
			stayDuration: options?.stayDuration ?? 0,
			...(normalizedSubtitle !== undefined && { subtitle: normalizedSubtitle }),
		};

		this.log.debug(normalizedTitle, normalizedSubtitle);

		system.run(() => {
			if (!player.isValid) return;
			player.onScreenDisplay.setTitle(normalizedTitle, finalOptions);
		});
	}
}
