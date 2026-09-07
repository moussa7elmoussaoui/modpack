import { EntityComponentTypes, system, world } from '@minecraft/server';
import { Vec2 } from '../vendor/vector2.js';
import { Vec3 } from '../vendor/vector3.js';

import pauseBlocks from '../datasets/guiPauseBlocks.js';
import WailaLogger from '../utils/Logger.js';

const PROPERTY_PAUSED = 'dark7mc:waila_paused';

export class PauseManager {
	constructor(clearUi) {
		this.clearUi = clearUi;
		this.log = WailaLogger.get('PauseManager');
		this.resumeWatchers = new Map();
	}

	initialize() {
		world.afterEvents.playerInteractWithBlock.subscribe(({ player, block }) => {
			if (!block) return;
			if (pauseBlocks.includes(block.typeId)) {
				this.pause(player);
			}
		});

		world.beforeEvents.playerLeave.subscribe(({ player }) => {
			this.clearUi(player);
			player.setDynamicProperty(PROPERTY_PAUSED, undefined);
			this.stopResumeWatcher(player.id);
		});
	}

	checkPlayerInventoryOpen(player) {
		const playerCursor = player.getComponent(EntityComponentTypes.CursorInventory);
		if (!playerCursor) return;

		if (playerCursor.item !== undefined) {
			this.pause(player);
		}
	}

	isPaused(player) {
		return Boolean(player.getDynamicProperty(PROPERTY_PAUSED));
	}

	pause(player) {
		if (this.isPaused(player)) return;

		player.setDynamicProperty(PROPERTY_PAUSED, true);
		this.clearUi(player);
		this.log.info(`Player ${player.name} opened a UI, pausing updates.`);

		const initialPosition = Vec3.from(player.location);
		const initialRotation = Vec2.from(player.getRotation());

		const interval = system.runInterval(() => {
			if (!player.isValid) {
				this.stopResumeWatcher(player.id);
				return;
			}

			const currentPosition = Vec3.from(player.location);
			const currentRotation = Vec2.from(player.getRotation());

			const movedFar = initialPosition.distance(currentPosition) > 2;
			const rotatedEnough = currentRotation.distance(initialRotation) > 10;
			if (!movedFar && !rotatedEnough) return;

			this.log.info(`Player ${player.name} moved, resuming WAILA UI.`);
			this.stopResumeWatcher(player.id);
			player.setDynamicProperty(PROPERTY_PAUSED, undefined);
			this.clearUi(player);
		}, 5);

		this.resumeWatchers.set(player.id, interval);
	}

	stopResumeWatcher(playerId) {
		const handle = this.resumeWatchers.get(playerId);
		if (handle === undefined) return;
		try {
			system.clearRun(handle);
		} catch (error) {
			this.log.warn(`Failed to clear resume watcher for player ${playerId}: ${error}`);
		}
		this.resumeWatchers.delete(playerId);
	}
}
