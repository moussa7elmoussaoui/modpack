import { Registry } from '../../vendor/registry.js';
import inventoryTokens from '../../datasets/blockInventoryTokens.js';
import { LookAtObjectTypeEnum } from '../../types/LookAtObjectTypeEnum.js';
import {
	shouldDisplayFeature,
	resolveDisplayAnchor,
} from '../Settings.js';
import { MAX_TRACKED_EFFECTS } from '../EntityHandler.js';

import '../../utils/String.js';

export class UiBuilder {
	static build(player, metadata, settings, extendedInfoActive) {
		const subtitleParts = [];
		if (
			metadata.type === LookAtObjectTypeEnum.ENTITY &&
			!metadata.itemContextIdentifier
		) {
			subtitleParts.push({
				text: metadata.renderData.entityId || '',
			});
		}

		const isSneaking = player.isSneaking;

		const isTileOrItemEntity =
			metadata.type === LookAtObjectTypeEnum.TILE ||
			(metadata.type === LookAtObjectTypeEnum.ENTITY && !!metadata.itemContextIdentifier);

		const shouldDisplayInventory =
			metadata.type === LookAtObjectTypeEnum.TILE &&
			shouldDisplayFeature(settings.containerInventoryVisibility, isSneaking);

		const prefixType = isTileOrItemEntity ? 'A' : 'B';

		let healthOrArmor = '';
		let finalTagIcons = '';
		let effectsStr = '';
		let inventoryOverflow = 0;

		if (isTileOrItemEntity) {
			if (metadata.type === LookAtObjectTypeEnum.TILE) {
				const blockData = metadata.renderData;
				finalTagIcons = blockData.toolIcons;
				if (shouldDisplayInventory) {
					inventoryOverflow = blockData.inventoryOverflow ?? 0;
				}
			} else {
				finalTagIcons = 'zz,z;zz,z:';
			}
		} else {
			const entityData = metadata.renderData;
			healthOrArmor = `${entityData.healthRenderer}${entityData.armorRenderer}`;
			finalTagIcons = entityData.tagIcons;
			effectsStr = `${
				entityData.effectsRenderer.effectString
			}e${entityData.effectsRenderer.effectsResolvedArray.length
				.toString()
				.padStart(2, '0')}`;
		}

		const nameElements = [];
		if (metadata.hitIdentifier === 'minecraft:player') {
			nameElements.push({ text: '__r4ui:humanoid.' });
		}
		if (
			metadata.nameTagContextTranslationKey &&
			metadata.hitIdentifier !== 'minecraft:player'
		) {
			nameElements.push({ text: `${metadata.displayName} \u00A77(` });
			nameElements.push({ translate: metadata.nameTagContextTranslationKey });
			nameElements.push({ text: ')\u00A7r' });
		} else {
			nameElements.push({ translate: metadata.displayName });
		}
		if (metadata.itemInsideFrameTranslationKey) {
			nameElements.push({ text: '\n\u00A77[' });
			nameElements.push({ translate: metadata.itemInsideFrameTranslationKey });
			nameElements.push({ text: ']\u00A7r' });
		}
		nameElements.push({ text: '\u00A7r' });

		const blockStatesText =
			metadata.type === LookAtObjectTypeEnum.TILE && extendedInfoActive
				? metadata.renderData.blockStates ?? ''
				: '';

		const itemEntityText =
			metadata.type === LookAtObjectTypeEnum.ENTITY && metadata.itemContextIdentifier
				? `\n\u00A77${metadata.itemContextIdentifier}\u00A7r`
				: '';

		let healthText = '';
		let paddingNewlines = '';

		if (metadata.type === LookAtObjectTypeEnum.ENTITY) {
			const entityData = metadata.renderData;

			if (entityData.maxHp > 0 && entityData.intHealthDisplay) {
				const percentage = Math.round((entityData.hp / entityData.maxHp) * 100);
				const hpDisplay =
					entityData.maxHp < 1000000
						? `\uE10C ${entityData.hp}/${entityData.maxHp} (${percentage}%)`
						: '\uE10C \u221E';
				healthText = `\n\u00A77 ${hpDisplay}\u00A7r`;
			}

			if (
				entityData.maxHp > 0 &&
				entityData.maxHp <= 40 &&
				!entityData.intHealthDisplay
			) {
				paddingNewlines += '\n';
			}
			if (
				entityData.maxHp > 20 &&
				entityData.maxHp <= 40 &&
				!entityData.intHealthDisplay
			) {
				paddingNewlines += '\n';
			}
			if (entityData.maxHp > 40 && !entityData.intHealthDisplay) {
				healthText = `\n\u00A77 ${
					entityData.maxHp < 1000000
						? `${entityData.hp}/${entityData.maxHp} (${Math.round(
								(entityData.hp / entityData.maxHp) * 100,
						  )}%)`
						: '\u221E'
				}\u00A7r`;
			}

			const numEffects = entityData.effectsRenderer.effectsResolvedArray.length;
			const numEffectsThreshold = Math.ceil(MAX_TRACKED_EFFECTS / 2);
			if (numEffects > 0 && numEffects <= numEffectsThreshold) {
				paddingNewlines += '\n\n'.repeat(numEffects);
			} else if (numEffects > numEffectsThreshold) {
				paddingNewlines +=
					!entityData.intHealthDisplay && entityData.maxHp > 40 ? '\n' : '\n\n';
			}

			if (entityData.armorRenderer !== 'dddddddddd') {
				paddingNewlines += '\n';
			}
		}

		const showPackAuthor = shouldDisplayFeature(
			settings.packAuthorVisibility,
			isSneaking,
		);
		const namespaceText = UiBuilder.resolveNamespaceText(
			metadata.namespace,
			showPackAuthor,
		);

		const titleParts = [
			{ text: `_r4ui:${prefixType}:` },
			{ text: healthOrArmor },
			{ text: finalTagIcons },
			{ text: effectsStr },
			...nameElements,
			{ text: itemEntityText },
			{ text: healthText },
			{ text: paddingNewlines },
			{ text: '\n\u00A79\u00A7o' },
			{ translate: namespaceText },
			{ text: '\u00A7r' },
		];

		const baseAnchor = resolveDisplayAnchor(settings.displayPosition, 'top_middle');
		let anchorSetting = baseAnchor;
		if (isSneaking) {
			anchorSetting = resolveDisplayAnchor(
				settings.displayPositionWhenSneaking,
				baseAnchor,
			);
		}
		if (extendedInfoActive && blockStatesText.length > 0) {
			subtitleParts.push({ text: '__r4ui:block_states__' });
			subtitleParts.push({ text: blockStatesText });
		}

		if (
			shouldDisplayInventory &&
			metadata.type === LookAtObjectTypeEnum.TILE &&
			inventoryOverflow > 0
		) {
			const clampedOverflow = Math.min(99, Math.max(0, inventoryOverflow));
			titleParts.push({ text: `__r4ui:inv.size_${clampedOverflow}__` });
		}

		titleParts.push({ text: `__r4ui:anchor.${anchorSetting}__` });

		if (
			shouldDisplayInventory &&
			metadata.type === LookAtObjectTypeEnum.TILE &&
			metadata.renderData.inventory
		) {
			for (const token of UiBuilder.collectInventoryTokens(metadata.hitIdentifier)) {
				titleParts.push({ text: token });
			}
		}

		const filteredTitle = titleParts.filter(
			(part) => !(typeof part === 'object' && 'text' in part && part.text === ''),
		);

		return { title: filteredTitle, subtitle: subtitleParts };
	}

	static collectInventoryTokens(blockId) {
		const matches = [];
		for (const rule of inventoryTokens) {
			if (rule.match.some((candidate) => candidate === blockId)) {
				matches.push(rule.token);
			}
		}
		return matches;
	}

	static resolveNamespaceText(namespace, showPackAuthor) {
		const value = Registry[namespace.replace(':', '')];
		if (value) {
			if (showPackAuthor && value.creator) {
				return `${value.name}\nby ${value.creator}`;
			}
			return value.name;
		}

		if (namespace.length > 3) {
			return namespace
				.replace(/_/g, ' ')
				.replace(':', '')
				.toTitle()
				.abrevCaps();
		}

		return namespace.replace(':', '').toUpperCase();
	}
}
