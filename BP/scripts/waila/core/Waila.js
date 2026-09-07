import { world } from '@minecraft/server';

import AfterWorldLoad from '../utils/Init.js';
import { WailaSettings } from './Settings.js';
import { PauseManager } from './PauseManager.js';
import { SignatureStore } from './SignatureStore.js';
import { LookPipeline } from './look/LookPipeline.js';
import { LookScanner } from './look/LookScanner.js';
import { UiController } from './ui/UiController.js';
import { PlayerPulseScheduler } from '../vendor/scheduler.js';
import WailaLogger from '../utils/Logger.js';

export default class Waila {
	static instance;

	constructor() {
		this.log = WailaLogger.get('Main');
		this.signatureStore = new SignatureStore();
		this.lookScanner = new LookScanner();
		this.lookPipeline = new LookPipeline();
		this.uiController = new UiController();
		this.playerHasTarget = new Map();
		this.pauseManager = undefined;

		this.pauseManager = new PauseManager((player) => this.handleExternalClear(player));
		this.pauseManager.initialize();

		AfterWorldLoad(() => {
			world.gameRules.showTags = false;

			const pulse = new PlayerPulseScheduler((player) => {
				const isEnabled = WailaSettings.get(player, 'isEnabled');
				if (isEnabled === undefined || isEnabled === true) {
					this.processPlayer(player);
				}
			}, 3);
			pulse.start();
		});
	}

	static getInstance() {
		if (!Waila.instance) {
			Waila.instance = new Waila();
		}
		return Waila.instance;
	}

	processPlayer(player) {
		this.pauseManager.checkPlayerInventoryOpen(player);
		if (this.pauseManager.isPaused(player)) return;

		const settings = WailaSettings.getAllTyped(player);
		const lookAt = this.lookScanner.scan(player, WailaSettings.DEFAULT_VIEW_DISTANCE);
		const assessment = this.lookPipeline.assess(player, lookAt, settings);

		this.updateTargetState(player, assessment);

		if (!assessment.hasTarget || !assessment.signature || !assessment.context) {
			this.signatureStore.clear(player);
			return;
		}

		if (this.signatureStore.isDuplicate(player, assessment.signature)) return;

		const resolution = this.lookPipeline.finalize(assessment.context);
		this.uiController.present(player, resolution, settings);
	}

	updateTargetState(player, assessment) {
		const playerId = player.id;
		const hadTarget = this.playerHasTarget.get(playerId) ?? false;
		const hasTarget = assessment.hasTarget;

		if (!hasTarget && hadTarget) {
			this.handleExternalClear(player);
		}

		this.playerHasTarget.set(playerId, hasTarget);
	}

	handleExternalClear(player) {
		this.uiController.clear(player);
		this.signatureStore.clear(player);
		this.playerHasTarget.set(player.id, false);
	}

	clearUI(player) {
		this.handleExternalClear(player);
	}

	isPaused(player) {
		return this.pauseManager.isPaused(player);
	}
}

Waila.getInstance();
