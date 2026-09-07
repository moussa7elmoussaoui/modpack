import { ItemStack } from '@minecraft/server';

import frameBlockIds from '../../datasets/frameBlockIds.js';
import nameAliases from '../../datasets/nameAliases.js';
import { shouldDisplayFeature } from '../Settings.js';
import { InventoryMirror } from '../InventoryMirror.js';
import { LookAtObjectTypeEnum } from '../../types/LookAtObjectTypeEnum.js';
import { BlockHandler } from '../BlockHandler.js';
import { EntityHandler } from '../EntityHandler.js';
import WailaLogger from '../../utils/Logger.js';

const EMPTY_BLOCK_TOOL_ICONS = 'zz,z;zz,z:';
const EMPTY_ENTITY_TAG_ICONS = ':zz,z;zz,z:';
const EMPTY_HEALTH_RENDERER = 'yyyyyyyyyyyyyyyyyyyy';
const INT_HEALTH_RENDERER = 'yxyyyyyyyyyyyyyyyyyy';
const EMPTY_ARMOR_RENDERER = 'dddddddddd';

export class LookPipeline {
	constructor() {
		this.log = WailaLogger.get('LookPipeline');
	}

	assess(player, lookAtObject, settings) {
		if (
			!lookAtObject.type ||
			!lookAtObject.hitIdentifier ||
			lookAtObject.hitIdentifier === '__r4ui:none'
		) {
			return { hasTarget: false };
		}

		if (lookAtObject.type === LookAtObjectTypeEnum.ENTITY) {
			const context = this.buildEntityContext(player, lookAtObject, settings);
			if (!context) return { hasTarget: false };

			const signaturePayload = {
				hit: context.hitIdentifier,
				sneaking: player.isSneaking,
				name: context.displayName,
				tagIcons: context.renderData.tagIcons,
				healthRenderer: context.renderData.healthRenderer,
				armorRenderer: context.renderData.armorRenderer,
				health: `${context.renderData.hp}/${context.renderData.maxHp}`,
				effects: context.renderData.effectsRenderer.effectString,
				itemContext: context.itemContextIdentifier ?? '',
			};

			return {
				hasTarget: true,
				signature: JSON.stringify(signaturePayload),
				context,
			};
		}

		if (lookAtObject.type === LookAtObjectTypeEnum.TILE) {
			const context = this.buildBlockContext(player, lookAtObject, settings);
			if (!context) return { hasTarget: false };

			const signaturePayload = {
				hit: lookAtObject.hitIdentifier,
				sneaking: player.isSneaking,
				name: context.displayName,
				toolIcons: context.renderData.toolIcons,
				blockStates: context.extendedInfoActive
					? context.renderData.blockStates ?? ''
					: '',
				inventory: context.inventorySignature,
				overflow: context.renderData.inventoryOverflow ?? 0,
				frameItem: context.itemInsideFrameTranslationKey ?? '',
			};

			return {
				hasTarget: true,
				signature: JSON.stringify(signaturePayload),
				context,
			};
		}

		return { hasTarget: false };
	}

	finalize(context) {
		if (context.type === LookAtObjectTypeEnum.ENTITY) {
			return this.finalizeEntity(context);
		}
		return this.finalizeBlock(context);
	}

	buildEntityContext(player, lookAtObject, settings) {
		const { entity } = lookAtObject;
		if (!entity || !entity.isValid) return undefined;

		const renderData = EntityHandler.createRenderData(
			entity,
			player,
			entity.typeId === 'minecraft:player',
			settings,
		);

		const isSneaking = player.isSneaking;
		const showTags = shouldDisplayFeature(settings.entityTagsVisibility, isSneaking);
		const showHealth = shouldDisplayFeature(settings.entityHealthVisibility, isSneaking);

		if (!showTags) {
			renderData.tagIcons = EMPTY_ENTITY_TAG_ICONS;
		}

		if (!showHealth) {
			renderData.healthRenderer = EMPTY_HEALTH_RENDERER;
			renderData.armorRenderer = EMPTY_ARMOR_RENDERER;
			renderData.hp = 0;
			renderData.maxHp = 0;
		}
		if (renderData.maxHp > 0 && settings.alwaysDisplayEntityIntHealth) {
			renderData.healthRenderer = INT_HEALTH_RENDERER;
			renderData.intHealthDisplay = true;
		}

		let displayName = entity.localizationKey;
		let nameTagContextTranslationKey;
		let itemContextIdentifier;
		let itemStack;

		const entityNameTag = entity.nameTag;
		if (entityNameTag && entityNameTag.length > 0) {
			displayName = entityNameTag;
			nameTagContextTranslationKey = entity.localizationKey;
		} else if (entity.typeId === 'minecraft:item') {
			const itemEntity = lookAtObject;
			if (itemEntity.itemStack) {
				itemContextIdentifier = itemEntity.itemStack.typeId;
				itemStack = itemEntity.itemStack.clone();
			}
		}

		const hitNamespace = this.resolveNamespace(lookAtObject.hitIdentifier);

		return {
			type: LookAtObjectTypeEnum.ENTITY,
			hitIdentifier: entity.typeId,
			namespace: hitNamespace,
			displayName,
			entity,
			renderData,
			nameTagContextTranslationKey,
			itemContextIdentifier,
			itemStack,
			isPlayer: entity.typeId === 'minecraft:player',
		};
	}

	buildBlockContext(player, lookAtObject, settings) {
		const block = lookAtObject.block;
		if (!block) return undefined;

		const isSneaking = player.isSneaking;
		const includeInventory = shouldDisplayFeature(
			settings.containerInventoryVisibility,
			isSneaking,
		);

		let renderData;
		try {
			renderData = BlockHandler.createRenderData(block, player, {
				includeInventory,
			});
		} catch (error) {
			this.log.warn(`Failed to build block render data for ${block.typeId}: ${error}`);
			return undefined;
		}

		if (!includeInventory) {
			renderData.inventory = undefined;
			renderData.inventoryOverflow = 0;
		}

		const showTools = shouldDisplayFeature(settings.effectiveToolVisibility, isSneaking);
		if (!showTools) {
			renderData.toolIcons = EMPTY_BLOCK_TOOL_ICONS;
		}

		const blockTypeId = block.typeId;
		const hitNamespace = this.resolveNamespace(lookAtObject.hitIdentifier);

		const aliasKey = nameAliases[blockTypeId.replace(/.*:/g, '')];
		const displayName = aliasKey ? `${aliasKey}.name` : block.localizationKey;

		const showBlockStates = shouldDisplayFeature(
			settings.blockStatesVisibility,
			isSneaking,
		);
		const extendedInfoActive = Boolean(renderData.blockStates && showBlockStates);

		const frameItemTranslationKey = this.resolveFrameItemKey(
			blockTypeId,
			lookAtObject.hitIdentifier,
		);
		const inventorySignature = includeInventory
			? this.encodeInventory(renderData.inventory)
			: '';

		return {
			type: LookAtObjectTypeEnum.TILE,
			hitIdentifier: lookAtObject.hitIdentifier,
			namespace: hitNamespace,
			displayName,
			block,
			blockTypeId,
			renderData,
			inventorySignature,
			extendedInfoActive,
			itemInsideFrameTranslationKey: frameItemTranslationKey,
		};
	}

	finalizeEntity(context) {
		const metadata = {
			type: LookAtObjectTypeEnum.ENTITY,
			hitIdentifier: context.entity.typeId,
			namespace: context.namespace,
			displayName: context.displayName,
			renderData: context.renderData,
			...(context.nameTagContextTranslationKey && {
				nameTagContextTranslationKey: context.nameTagContextTranslationKey,
			}),
			...(context.itemContextIdentifier && {
				itemContextIdentifier: context.itemContextIdentifier,
			}),
		};

		const iconRequests = [];
		if (context.itemStack) {
			iconRequests.push(InventoryMirror.createPrimaryIconRequest(context.itemStack));
		}

		return {
			metadata,
			iconRequests,
			extendedInfoActive: false,
		};
	}

	finalizeBlock(context) {
		const metadata = {
			type: LookAtObjectTypeEnum.TILE,
			hitIdentifier: context.blockTypeId,
			namespace: context.namespace,
			displayName: context.displayName,
			renderData: context.renderData,
			...(context.itemInsideFrameTranslationKey && {
				itemInsideFrameTranslationKey: context.itemInsideFrameTranslationKey,
			}),
		};

		const iconRequests = [InventoryMirror.createPrimaryIconRequest(context.block)];

		if (context.renderData.inventory) {
			iconRequests.push(
				...InventoryMirror.createInventoryRequests(context.renderData.inventory),
			);
		}

		return {
			metadata,
			iconRequests,
			extendedInfoActive: context.extendedInfoActive,
		};
	}

	resolveNamespace(hitIdentifier) {
		return hitIdentifier.includes(':')
			? hitIdentifier.substring(0, hitIdentifier.indexOf(':') + 1)
			: 'minecraft:';
	}

	resolveFrameItemKey(blockTypeId, hitIdentifier) {
		if (!frameBlockIds.includes(blockTypeId)) return undefined;
		if (frameBlockIds.includes(hitIdentifier)) return undefined;

		const namespaceLess = hitIdentifier.replace(/.*:/g, '');
		const mappedAlias = nameAliases[namespaceLess];
		if (mappedAlias) {
			return `${mappedAlias}.name`;
		}

		try {
			return new ItemStack(hitIdentifier).localizationKey;
		} catch {
			return undefined;
		}
	}

	encodeInventory(inventory) {
		if (!inventory || inventory.length === 0) return '';
		return inventory
			.map((entry) => {
				const typeId = entry.item?.typeId ?? 'minecraft:air';
				const amount = entry.item?.amount ?? 0;
				return `${entry.slot}:${typeId}:${amount}`;
			})
			.join('|');
	}
}
