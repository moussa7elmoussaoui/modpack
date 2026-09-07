import { Player, system, world } from '@minecraft/server';

import { Logger } from './logger.js';

export class PulseScheduler {
	constructor(processor, period) {
		this.items = [];
		this.period = 0;
		this.currentTick = 0;
		this.runId = undefined;
		this.nextIndex = 0;
		this.executionSchedule = [];
		this.processor = undefined;

		if (period <= 0) throw new Error('Period must be a positive integer.');
		if (!processor || typeof processor !== 'function') {
			throw new Error('Processor function must be defined.');
		}
		this.period = period;
		this.processor = processor;
	}

	remove(index) {
		if (index >= 0 && index < this.items.length) {
			this.items.splice(index, 1);
			if (index < this.nextIndex) this.nextIndex--;
			this.recalculateExecutionSchedule();
		}
	}

	removeIf(predicate) {
		for (let index = this.items.length - 1; index >= 0; index--) {
			if (predicate(this.items[index])) this.remove(index);
		}
	}

	getItems() {
		return this.items;
	}

	start() {
		this.stop();
		this.currentTick = 0;
		this.nextIndex = 0;
		this.runId = system.runInterval(() => this.tick(), 1);
	}

	stop() {
		if (this.runId !== undefined) {
			system.clearRun(this.runId);
			this.runId = undefined;
		}
	}

	recalculateExecutionSchedule() {
		const itemCount = this.items.length;
		this.executionSchedule = new Array(this.period).fill(0);
		if (itemCount === 0) return;

		const spacing = this.period / itemCount;
		for (let index = 0; index < itemCount; index++) {
			this.executionSchedule[Math.round(spacing * index) % this.period]++;
		}
	}

	tick() {
		if (this.items.length === 0) {
			PulseScheduler.log.trace('No items to process.');
			return;
		}
		const scheduledCount = this.executionSchedule[this.currentTick];
		if (scheduledCount === 0) {
			PulseScheduler.log.trace('No items to process this tick.');
			this.currentTick = (this.currentTick + 1) % this.period;
			if (this.currentTick === 0) this.nextIndex = 0;
			return;
		}
		let processed = 0;
		while (this.nextIndex < this.items.length && processed < scheduledCount) {
			try {
				this.processor(this.items[this.nextIndex]);
			} catch (error) {
				PulseScheduler.log.error('Error processing item', error);
			}
			processed++;
			this.nextIndex++;
		}
		this.currentTick = (this.currentTick + 1) % this.period;
		if (this.currentTick === 0) this.nextIndex = 0;
	}

	push(...items) {
		this.items.push(...items);
		this.recalculateExecutionSchedule();
		return this.items.length;
	}

	pop() {
		const item = this.items.pop();
		this.recalculateExecutionSchedule();
		return item;
	}

	shift() {
		const item = this.items.shift();
		this.recalculateExecutionSchedule();
		return item;
	}

	unshift(...items) {
		this.items.unshift(...items);
		this.recalculateExecutionSchedule();
		return this.items.length;
	}

	splice(start, deleteCount = 0, ...items) {
		const removed = this.items.splice(start, deleteCount, ...items);
		this.recalculateExecutionSchedule();
		return removed;
	}
}

PulseScheduler.log = Logger.getLogger('PulseScheduler', 'bedrock-boost', 'pulse-scheduler');

export class EntityPulseScheduler extends PulseScheduler {
	constructor(processor, period, queryOptions) {
		super(
			(entity) => {
				if (entity.isValid) {
					processor(entity);
				} else {
					this.removeIf((candidate) => !candidate.isValid);
				}
			},
			period,
		);
		this.filteredScratch = [];
		this.queryOptions = queryOptions;
		this.push(
			...world.getDimension('minecraft:overworld').getEntities(this.queryOptions),
		);
		this.push(...world.getDimension('minecraft:nether').getEntities(this.queryOptions));
		this.push(
			...world.getDimension('minecraft:the_end').getEntities(this.queryOptions),
		);
	}

	compareEntities(left, right) {
		return left.id === right.id;
	}

	start() {
		world.afterEvents.entityLoad.subscribe((event) => {
			this.addIfMatchesWithRetry(event.entity);
		});
		world.afterEvents.entitySpawn.subscribe((event) => {
			this.addIfMatchesWithRetry(event.entity);
		});
		world.afterEvents.entityRemove.subscribe((event) => {
			this.removeIf((candidate) => !candidate.isValid || candidate.id === event.removedEntityId);
		});
		super.start();
	}

	addIfMatchesWithRetry(entity) {
		try {
			if (!entity) return;
			if (entity.isValid) {
				if (entity.matches(this.queryOptions)) this.push(entity);
			} else {
				const retryId = system.runInterval(() => {
					if (entity.isValid && entity.matches(this.queryOptions)) {
						system.clearRun(retryId);
						this.push(entity);
					}
				}, 1);
			}
		} catch (error) {
			EntityPulseScheduler.logger.debug('Failed to push entity to scheduler.', error);
		}
	}

	push(...entities) {
		const filtered = this.filteredScratch;
		filtered.length = 0;
		for (const entity of entities) {
			if (!entity.isValid) continue;
			let duplicate = false;
			for (const existing of this.items) {
				if (this.compareEntities(existing, entity)) {
					duplicate = true;
					break;
				}
			}
			if (!duplicate) filtered.push(entity);
		}
		const result = super.push(...filtered);
		filtered.length = 0;
		return result;
	}

	unshift(...entities) {
		const filtered = this.filteredScratch;
		filtered.length = 0;
		for (const entity of entities) {
			if (!entity.isValid) continue;
			let duplicate = false;
			for (const existing of this.items) {
				if (this.compareEntities(existing, entity)) {
					duplicate = true;
					break;
				}
			}
			if (!duplicate) filtered.push(entity);
		}
		const result = super.unshift(...filtered);
		filtered.length = 0;
		return result;
	}

	splice(start, deleteCount, ...entities) {
		if (deleteCount === undefined) return super.splice(start);
		const filtered = this.filteredScratch;
		filtered.length = 0;
		for (const entity of entities) {
			let duplicate = false;
			for (const existing of this.items) {
				if (this.compareEntities(existing, entity)) {
					duplicate = true;
					break;
				}
			}
			if (!duplicate) filtered.push(entity);
		}
		const result = super.splice(start, deleteCount, ...filtered);
		filtered.length = 0;
		return result;
	}
}

EntityPulseScheduler.logger = Logger.getLogger(
	'EntityPulseScheduler',
	'bedrock-boost',
	'entity-pulse-scheduler',
);

export class PlayerPulseScheduler extends PulseScheduler {
	constructor(processor, period) {
		super(
			(player) => {
				if (player.isValid) {
					processor(player);
				} else {
					this.removeIf((candidate) => !candidate.isValid);
				}
			},
			period,
		);
		try {
			this.push(...world.getAllPlayers());
		} catch {
			system.runTimeout(() => {
				this.push(...world.getAllPlayers());
			}, 1);
		}
	}

	compareEntities(left, right) {
		return left.id === right.id;
	}

	start() {
		world.afterEvents.playerJoin.subscribe((event) => {
			let attempts = 0;
			const attemptPush = () => {
				attempts++;
				if (attempts > 10) {
					PlayerPulseScheduler.logger.debug(
						'Failed to push player to scheduler after 10 attempts.',
					);
					return;
				}
				try {
					const entity = world.getEntity(event.playerId);
					if (entity === undefined) {
						system.runTimeout(attemptPush, 1);
					}
					if (entity instanceof Player) this.push(entity);
				} catch (error) {
					PlayerPulseScheduler.logger.debug(
						'Failed to push player to scheduler.',
						error,
					);
					system.runTimeout(attemptPush, 1);
				}
			};
			attemptPush();
		});
		world.afterEvents.playerLeave.subscribe((event) => {
			this.removeIf((candidate) => !candidate.isValid || candidate.id === event.playerId);
		});
		super.start();
	}

	push(...players) {
		const filtered = players.filter(
			(candidate) =>
				candidate.isValid &&
				!this.items.some((existing) => this.compareEntities(existing, candidate)),
		);
		return super.push(...filtered);
	}

	unshift(...players) {
		const filtered = players.filter(
			(candidate) =>
				candidate.isValid &&
				!this.items.some((existing) => this.compareEntities(existing, candidate)),
		);
		return super.unshift(...filtered);
	}

	splice(start, deleteCount, ...players) {
		if (deleteCount === undefined) return super.splice(start);
		const filtered = players.filter(
			(candidate) =>
				!this.items.some((existing) => this.compareEntities(existing, candidate)),
		);
		return super.splice(start, deleteCount, ...filtered);
	}
}

PlayerPulseScheduler.logger = Logger.getLogger(
	'PlayerPulseScheduler',
	'bedrock-boost',
	'player-pulse-scheduler',
);
