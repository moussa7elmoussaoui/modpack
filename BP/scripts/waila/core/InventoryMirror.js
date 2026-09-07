import {
	Block,
	EntityComponentTypes,
	EnchantmentTypes,
	ItemComponentTypes,
	ItemLockMode,
	ItemStack,
} from '@minecraft/server';

import WailaLogger from '../utils/Logger.js';

const PROPERTY_TRACKED_SLOTS = 'dark7mc:waila_inventory_item_holder_slots';
const PROPERTY_ITEM_BACKUPS = 'dark7mc:waila_inventory_item_backups';
const PROPERTY_ITEM_BACKUPS_CHUNK_SUFFIX = '_chunk_';
const DYNAMIC_PROPERTY_CHUNK_LIMIT = 32760;
const DYNAMIC_PROPERTY_MAX_CHUNKS = 16;
const INVENTORY_MIRROR_START_SLOT = 9;
const INVENTORY_MIRROR_END_SLOT = 26;

export class InventoryMirror {
	static log = WailaLogger.get('InventoryMirror');

	static apply(player, requests, mirrorAuxSlots = true) {
		if (requests.length === 0) return;

		const playerContainer = this.getPlayerContainer(player);
		if (!playerContainer) return;

		const trackedSlotsSet = new Set(this.getTrackedSlots(player));
		const backups = this.getBackupMap(player);
		const touchedSlots = new Set();

		for (const request of requests) {
			const slotIndex = request.slot;
			if (slotIndex < 0 || slotIndex > playerContainer.size - 1) continue;

			const slotKey = String(slotIndex);
			if (!trackedSlotsSet.has(slotIndex)) {
				const original = playerContainer.getItem(slotIndex);
				backups[slotKey] = this.serializeItemStack(original);
				trackedSlotsSet.add(slotIndex);
			}

			this.applyRequestToSlot(playerContainer, slotIndex, request.item);
			touchedSlots.add(slotIndex);
		}

		if (mirrorAuxSlots) {
			for (
				let slotIndex = INVENTORY_MIRROR_START_SLOT;
				slotIndex <= INVENTORY_MIRROR_END_SLOT;
				slotIndex++
			) {
				if (slotIndex >= playerContainer.size) break;
				if (touchedSlots.has(slotIndex)) continue;

				const slotKey = String(slotIndex);
				if (!trackedSlotsSet.has(slotIndex)) {
					const original = playerContainer.getItem(slotIndex);
					backups[slotKey] = this.serializeItemStack(original);
					trackedSlotsSet.add(slotIndex);
				}

				this.applyRequestToSlot(playerContainer, slotIndex, undefined);
			}
		}

		if (!this.storeBackupMap(player, backups)) {
			this.revertSlotsFromBackup(playerContainer, trackedSlotsSet, backups);
			this.clearTrackedSlots(player);
			return;
		}
		this.setTrackedSlots(player, Array.from(trackedSlotsSet).sort((a, b) => a - b));
	}

	static restore(player) {
		const trackedSlots = this.getTrackedSlots(player);
		if (trackedSlots.length === 0) {
			this.clearTrackedSlots(player);
			return;
		}

		const playerContainer = this.getPlayerContainer(player);
		if (!playerContainer) {
			this.clearTrackedSlots(player);
			return;
		}

		const backups = this.getBackupMap(player);

		for (const slotIndex of trackedSlots) {
			const slotKey = String(slotIndex);
			const serialized = backups[slotKey];
			delete backups[slotKey];

			const restored = this.deserializeItemStack(serialized);
			try {
				playerContainer.setItem(slotIndex, restored ?? undefined);
			} catch (error) {
				this.log.warn(`Failed restoring slot ${slotIndex}: ${error}`);
			}
		}

		this.storeBackupMap(player, backups);
		this.clearTrackedSlots(player);
	}

	static createPrimaryIconRequest(source) {
		const itemStack =
			source instanceof Block ? InventoryMirror.blockToItem(source) : source.clone();
		if (itemStack) {
			itemStack.amount = source instanceof Block ? 1 : itemStack.amount;
		}
		return { slot: 17, item: itemStack };
	}

	static createInventoryRequests(items) {
		return items.map(({ item, slot }) => ({ slot: Math.min(9 + slot, 35), item }));
	}

	static blockToItem(block) {
		const SPECIAL_CASES = {
			'minecraft:bubble_column': 'minecraft:water_bucket',
			'minecraft:flowing_lava': 'minecraft:lava_bucket',
			'minecraft:flowing_water': 'minecraft:water_bucket',
			'minecraft:water': 'minecraft:water_bucket',
			'minecraft:lava': 'minecraft:lava_bucket',
		};

		const mapped = SPECIAL_CASES[block.typeId];
		if (mapped) return new ItemStack(mapped);

		try {
			return block.getItemStack(1, true);
		} catch {
			try {
				return new ItemStack(block.typeId);
			} catch {
				return undefined;
			}
		}
	}

	static getPlayerContainer(player) {
		return player.getComponent(EntityComponentTypes.Inventory)?.container;
	}

	static getTrackedSlots(player) {
		const stored = player.getDynamicProperty(PROPERTY_TRACKED_SLOTS);
		if (typeof stored === 'string' && stored.length > 0) {
			try {
				const parsed = JSON.parse(stored);
				return Array.isArray(parsed) ? parsed : [];
			} catch {
				return [];
			}
		}
		return [];
	}

	static setTrackedSlots(player, slots) {
		player.setDynamicProperty(
			PROPERTY_TRACKED_SLOTS,
			slots.length > 0 ? JSON.stringify(slots) : undefined,
		);
	}

	static clearTrackedSlots(player) {
		player.setDynamicProperty(PROPERTY_TRACKED_SLOTS, undefined);
		this.clearBackupPayload(player);
	}

	static applyRequestToSlot(container, slotIndex, item) {
		if (!item) {
			try {
				container.setItem(slotIndex, undefined);
			} catch (error) {
				this.log.warn(`Failed clearing slot ${slotIndex}: ${error}`);
			}
			return;
		}

		let cloned;
		try {
			cloned = item.clone();
		} catch (error) {
			this.log.warn(`Failed cloning request item for slot ${slotIndex}: ${error}`);
			try {
				container.setItem(slotIndex, undefined);
			} catch (setError) {
				this.log.warn(
					`Failed clearing slot ${slotIndex} after clone failure: ${setError}`,
				);
			}
			return;
		}

		if (!cloned) {
			try {
				container.setItem(slotIndex, undefined);
			} catch (error) {
				this.log.warn(
					`Failed clearing slot ${slotIndex} after undefined clone: ${error}`,
				);
			}
			return;
		}

		cloned.lockMode = ItemLockMode.slot;
		cloned.keepOnDeath = true;
		cloned.nameTag = '\u00A77 \u00A7r';

		try {
			container.setItem(slotIndex, cloned);
		} catch (error) {
			this.log.warn(`Failed injecting item into slot ${slotIndex}: ${error}`);
		}
	}

	static getBackupMap(player) {
		const payload = this.readBackupPayload(player);
		if (!payload) return {};
		try {
			const parsed = JSON.parse(payload);
			return parsed && typeof parsed === 'object' ? parsed : {};
		} catch (error) {
			this.log.warn(`Failed parsing inventory mirror payload: ${error}`);
			return {};
		}
	}

	static storeBackupMap(player, backups) {
		const entries = Object.entries(backups).filter(([, value]) => value !== undefined);
		if (entries.length === 0) {
			this.clearBackupPayload(player);
			return true;
		}

		const sanitized = {};
		for (const [slot, value] of entries) {
			sanitized[slot] = value ?? null;
		}

		const payload = JSON.stringify(sanitized);
		const maxLength = DYNAMIC_PROPERTY_CHUNK_LIMIT * DYNAMIC_PROPERTY_MAX_CHUNKS;
		if (payload.length > maxLength) {
			this.log.warn(
				`Inventory mirror payload (${payload.length}) exceeds limit (${maxLength}). Original items may be lost.`,
			);
			return false;
		}

		return this.writeBackupPayload(player, payload);
	}

	static serializeItemStack(item) {
		if (!item) return null;
		let snapshot;
		try {
			snapshot = item.clone();
		} catch (error) {
			this.log.warn(`Failed cloning item stack for serialization: ${error}`);
			return null;
		}
		if (!snapshot) {
			this.log.warn(
				`Clone returned undefined during serialization for ${item.typeId}`,
			);
			return null;
		}

		const serialized = {
			typeId: snapshot.typeId,
			amount: snapshot.amount,
		};

		if (snapshot.keepOnDeath) serialized.keepOnDeath = true;
		if (snapshot.lockMode && snapshot.lockMode !== ItemLockMode.none) {
			serialized.lockMode = snapshot.lockMode;
		}
		if (snapshot.nameTag) serialized.nameTag = snapshot.nameTag;

		const canDestroy = this.safeGet(() => snapshot.getCanDestroy());
		if (canDestroy && canDestroy.length > 0) serialized.canDestroy = canDestroy;

		const canPlaceOn = this.safeGet(() => snapshot.getCanPlaceOn());
		if (canPlaceOn && canPlaceOn.length > 0) serialized.canPlaceOn = canPlaceOn;

		const lore = this.safeGet(() => snapshot.getLore());
		if (lore && lore.length > 0) serialized.lore = lore;

		const durability = this.serializeDurability(snapshot);
		if (durability) serialized.durability = durability;

		const enchantments = this.serializeEnchantments(snapshot);
		if (enchantments && enchantments.length > 0) {
			serialized.enchantments = enchantments;
		}

		const dynamicProperties = this.serializeDynamicProperties(snapshot);
		if (dynamicProperties && dynamicProperties.length > 0) {
			serialized.dynamicProperties = dynamicProperties;
		}

		return serialized;
	}

	static deserializeItemStack(data) {
		if (!data) return undefined;
		try {
			const amount = Math.max(1, data.amount ?? 1);
			const item = new ItemStack(data.typeId, amount);
			item.amount = amount;

			if (data.keepOnDeath !== undefined) item.keepOnDeath = data.keepOnDeath;
			item.lockMode = data.lockMode ?? ItemLockMode.none;

			if (data.nameTag !== undefined) item.nameTag = data.nameTag;
			if (data.lore) {
				this.trySet(() => item.setLore(data.lore));
			}
			if (data.canDestroy) {
				this.trySet(() => item.setCanDestroy(data.canDestroy));
			}
			if (data.canPlaceOn) {
				this.trySet(() => item.setCanPlaceOn(data.canPlaceOn));
			}

			if (data.dynamicProperties) {
				this.trySet(() => item.clearDynamicProperties());
				for (const prop of data.dynamicProperties) {
					this.trySet(() => {
						if (prop.type === 'vector3') {
							item.setDynamicProperty(prop.id, prop.value);
							return;
						}
						item.setDynamicProperty(prop.id, prop.value);
					});
				}
			}

			if (data.enchantments) {
				const enchantable = this.safeGet(() =>
					item.getComponent(ItemComponentTypes.Enchantable),
				);
				if (enchantable) {
					this.trySet(() => enchantable.removeAllEnchantments());
					const toApply = [];
					for (const enchant of data.enchantments) {
						const type = EnchantmentTypes.get(enchant.id);
						if (!type) continue;
						toApply.push({ type, level: enchant.level });
					}
					if (toApply.length > 0) {
						this.trySet(() => enchantable.addEnchantments(toApply));
					}
				}
			}

			if (data.durability) {
				const durability = this.safeGet(() =>
					item.getComponent(ItemComponentTypes.Durability),
				);
				if (durability) {
					this.trySet(() => {
						durability.damage = data.durability.damage ?? 0;
					});
				}
			}

			return item;
		} catch (error) {
			this.log.warn(`Failed to deserialize inventory mirror entry: ${error}`);
			return undefined;
		}
	}

	static serializeDurability(item) {
		try {
			const durability = item.getComponent(ItemComponentTypes.Durability);
			if (!durability) return undefined;
			if (typeof durability.damage !== 'number' || durability.damage <= 0) {
				return undefined;
			}
			return { damage: durability.damage };
		} catch (error) {
			this.log.debug?.(`Durability serialization failed: ${error}`);
			return undefined;
		}
	}

	static serializeEnchantments(item) {
		try {
			const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
			if (!enchantable) return undefined;
			const enchantments = enchantable.getEnchantments();
			if (!enchantments || enchantments.length === 0) return undefined;
			return enchantments.map((enchant) => ({
				id: enchant.type.id,
				level: enchant.level,
			}));
		} catch (error) {
			this.log.debug?.(`Enchantment serialization failed: ${error}`);
			return undefined;
		}
	}

	static serializeDynamicProperties(item) {
		try {
			const ids = item.getDynamicPropertyIds();
			if (!ids || ids.length === 0) return undefined;
			const out = [];
			for (const id of ids) {
				const value = item.getDynamicProperty(id);
				if (value === undefined || value === null) continue;
				switch (typeof value) {
					case 'boolean':
						out.push({ id, type: 'boolean', value });
						break;
					case 'number':
						out.push({ id, type: 'number', value });
						break;
					case 'string':
						out.push({ id, type: 'string', value });
						break;
					case 'object': {
						if (
							typeof value.x === 'number' &&
							typeof value.y === 'number' &&
							typeof value.z === 'number'
						) {
							out.push({
								id,
								type: 'vector3',
								value: { x: value.x, y: value.y, z: value.z },
							});
						}
						break;
					}
				}
			}
			return out.length ? out : undefined;
		} catch (error) {
			this.log.debug?.(`Dynamic property serialization failed: ${error}`);
			return undefined;
		}
	}

	static writeBackupPayload(player, payload) {
		if (!payload) {
			this.clearBackupPayload(player);
			return true;
		}

		const chunks = this.chunkString(payload, DYNAMIC_PROPERTY_CHUNK_LIMIT);
		if (chunks.length > DYNAMIC_PROPERTY_MAX_CHUNKS) {
			this.log.warn(`Inventory mirror chunk count exceeded: ${chunks.length}`);
			return false;
		}

		this.clearBackupPayload(player);
		for (let index = 0; index < chunks.length; index++) {
			player.setDynamicProperty(this.getBackupChunkId(index), chunks[index]);
		}
		return true;
	}

	static readBackupPayload(player) {
		const chunks = [];
		for (let index = 0; index < DYNAMIC_PROPERTY_MAX_CHUNKS; index++) {
			const value = player.getDynamicProperty(this.getBackupChunkId(index));
			if (typeof value !== 'string') {
				if (index === 0) return '';
				break;
			}
			chunks.push(value);
		}
		return chunks.join('');
	}

	static clearBackupPayload(player) {
		for (let index = 0; index < DYNAMIC_PROPERTY_MAX_CHUNKS; index++) {
			const propertyId = this.getBackupChunkId(index);
			if (player.getDynamicProperty(propertyId) === undefined) continue;
			player.setDynamicProperty(propertyId, undefined);
		}
	}

	static getBackupChunkId(index) {
		return index === 0
			? PROPERTY_ITEM_BACKUPS
			: `${PROPERTY_ITEM_BACKUPS}${PROPERTY_ITEM_BACKUPS_CHUNK_SUFFIX}${index}`;
	}

	static chunkString(value, maxLength) {
		const chunks = [];
		let cursor = 0;
		while (cursor < value.length) {
			chunks.push(value.slice(cursor, cursor + maxLength));
			cursor += maxLength;
		}
		return chunks.length ? chunks : [value];
	}

	static safeGet(fn) {
		try {
			return fn();
		} catch (error) {

			this.log.debug?.(`InventoryMirror safeGet failed: ${error}`);
			return undefined;
		}
	}

	static trySet(fn) {
		try {
			fn();
		} catch (error) {
			this.log.debug?.(`InventoryMirror trySet failed: ${error}`);
		}
	}

	static revertSlotsFromBackup(container, slots, backups) {
		for (const slotIndex of slots) {
			const original = this.deserializeItemStack(backups[String(slotIndex)]);
			try {
				container.setItem(slotIndex, original ?? undefined);
			} catch (error) {
				this.log.warn(
					`Failed reverting slot ${slotIndex} after backup overflow: ${error}`,
				);
			}
		}
	}
}
