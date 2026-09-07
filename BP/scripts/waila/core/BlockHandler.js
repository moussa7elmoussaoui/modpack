import { EntityComponentTypes, ItemStack } from '@minecraft/server';

import { LookAtObjectTypeEnum } from '../types/LookAtObjectTypeEnum.js';
import { BlockToolsEnum, TagRemarksEnum } from '../types/TagsEnum.js';

import blockTools from '../datasets/blockTools.js';
import { RuleMatcher } from '../utils/RuleMatcher.js';
import { getMainHandContext } from '../utils/PlayerEquipment.js';
import WailaLogger from '../utils/Logger.js';

const INVENTORY_SECOND_ROW_LIMIT = 18;

export class BlockHandler {
	static log = WailaLogger.get('BlockHandler');

	static createLookupData(block) {
		return {
			type: LookAtObjectTypeEnum.TILE,
			hitIdentifier: BlockHandler.resolveHitIdentifier(block),
			block,
		};
	}

	static createRenderData(block, player, options) {
		const includeInventory = options?.includeInventory ?? true;
		const extracted = includeInventory ? BlockHandler.extractInventory(block) : undefined;
		const renderData = {
			toolIcons: BlockHandler.buildToolIconString(block, player),
			blockStates: BlockHandler.describeStates(block),
		};

		if (includeInventory && extracted) {
			if (extracted.slots) {
				renderData.inventory = extracted.slots;
			}
			if (extracted.overflow > 0) {
				renderData.inventoryOverflow = extracted.overflow;
			}
		}

		return renderData;
	}

	static resolveHitIdentifier(block) {
		try {
			const stack = block.getItemStack(1, true);
			if (stack?.typeId) return stack.typeId;
		} catch {

		}
		return block.typeId;
	}

	static buildToolIconString(block, player) {
		const matches = BlockHandler.collectMatchingTags(block);
		if (matches.length === 0) {
			return `${BlockToolsEnum.UNDEFINED},${TagRemarksEnum.UNDEFINED};${BlockToolsEnum.UNDEFINED},${TagRemarksEnum.UNDEFINED}:`;
		}

		const mainHand = getMainHandContext(player);
		const processed = [];

		for (const tagDef of matches) {
			const iconId = BlockHandler.resolveToolIconId(tagDef.name);
			const remark = BlockHandler.resolveRemarkIcon(tagDef, mainHand);

			if (processed.some((entry) => entry.iconId.charAt(0) === iconId.charAt(0))) {
				continue;
			}

			processed.push({ iconId, remark });
			if (processed.length >= 2) break;
		}

		const [primary, secondary] = BlockHandler.padToolEntries(processed);
		return `${primary.iconId},${primary.remark};${secondary.iconId},${secondary.remark}:`;
	}

	static collectMatchingTags(block) {
		const blockId = block.typeId;
		const namespaceLess = blockId.includes(':') ? blockId.split(':')[1] : blockId;
		const blockTags = block.getTags();

		return blockTools.filter((tagDef) => {
			let hasPositiveMatch = false;

			for (const matcher of tagDef.target) {
				if (typeof matcher === 'string') {
					const isNegated = matcher.startsWith('!');
					const rule = isNegated ? matcher.substring(1) : matcher;
					if (!rule) continue;

					const matches = BlockHandler.matchesBlockRule(rule, blockId, namespaceLess);
					if (matches) {
						if (isNegated) return false;
						hasPositiveMatch = true;
					}
					continue;
				}

				const tagRule = matcher.tag;
				if (!tagRule) continue;
				const isNegated = tagRule.startsWith('!');
				const actualRule = isNegated ? tagRule.substring(1) : tagRule;
				const matches = BlockHandler.matchesTagRule(actualRule, blockTags);

				if (matches) {
					if (isNegated) return false;
					hasPositiveMatch = true;
				} else if (!isNegated) {

				}
			}

			return hasPositiveMatch;
		});
	}

	static matchesBlockRule(rule, blockId, namespaceLess) {
		return (
			RuleMatcher.matches(blockId, rule) ||
			RuleMatcher.matches(namespaceLess, rule)
		);
	}

	static matchesTagRule(rule, blockTags) {
		return blockTags.some((tag) => RuleMatcher.matches(tag, rule));
	}

	static matchesTagCondition(rule, tags) {
		if (!rule) return false;
		const isNegated = rule.startsWith('!');
		const actualRule = isNegated ? rule.substring(1) : rule;
		const positiveMatch = tags.some((tag) => RuleMatcher.matches(tag, actualRule));
		return isNegated ? !positiveMatch : positiveMatch;
	}

	static matchesItemRule(rule, itemTypeId) {
		if (!rule) return false;
		const isNegated = rule.startsWith('!');
		const actualRule = isNegated ? rule.substring(1) : rule;
		const value = itemTypeId;
		const namespaceLess = BlockHandler.getNamespaceLessIdentifier(value);
		const tokens = namespaceLess.split('_').filter(Boolean);

		let matched = false;

		if (actualRule.includes(':')) {
			matched = value === actualRule;
		} else {
			matched = namespaceLess === actualRule || tokens.includes(actualRule);
		}

		return isNegated ? !matched : matched;
	}

	static getNamespaceLessIdentifier(value) {
		return value.includes(':') ? value.split(':')[1] : value;
	}

	static resolveToolIconId(tagName) {
		const key = tagName.toUpperCase();
		return BlockToolsEnum[key] ?? BlockToolsEnum.UNDEFINED;
	}

	static resolveRemarkIcon(tagDef, context) {
		if (!tagDef.remarks) return TagRemarksEnum.UNDEFINED;

		for (const remarkKey of Object.keys(tagDef.remarks)) {
			const enumKey = remarkKey.toUpperCase();
			if (!(enumKey in TagRemarksEnum)) continue;

			const remarkEnum = TagRemarksEnum[enumKey];
			const conditions = tagDef.remarks[remarkKey];

			const matchesByTag =
				conditions.tags?.some((rule) =>
					BlockHandler.matchesTagCondition(rule, context.tags),
				) ?? false;
			const matchesByItem =
				conditions.itemIds?.some((rule) =>
					BlockHandler.matchesItemRule(rule, context.itemTypeId),
				) ?? false;

			if (matchesByTag || matchesByItem) {
				return remarkEnum;
			}
		}

		return TagRemarksEnum.UNDEFINED;
	}

	static padToolEntries(entries) {
		const defaultEntry = {
			iconId: BlockToolsEnum.UNDEFINED,
			remark: TagRemarksEnum.UNDEFINED,
		};
		return [entries[0] ?? defaultEntry, entries[1] ?? defaultEntry];
	}

	static describeStates(block) {
		try {
			const states = block.permutation.getAllStates();
			const keys = Object.keys(states).sort();
			if (keys.length === 0) return undefined;

			return keys
				.map((key) => {
					const value = states[key];
					const formattedKey = key.replace('minecraft:', '');
					const prefix = BlockHandler.colorForStateValue(value);
					return `\u00A77${formattedKey}: ${prefix}${value}\u00A7r`;
				})
				.join('\n');
		} catch {
			return undefined;
		}
	}

	static colorForStateValue(value) {
		if (typeof value === 'number') return '\u00A73';
		if (typeof value === 'boolean') return value ? '\u00A7a' : '\u00A7c';
		return '\u00A7e';
	}

	static extractInventory(block) {
		const container = BlockHandler.getBlockContainer(block);
		if (!container) return { slots: undefined, overflow: 0 };

		const allNonEmpty = BlockHandler.collectNonEmptyStacks(container);

		if (container.size > INVENTORY_SECOND_ROW_LIMIT) {
			if (allNonEmpty.length === 0) return { slots: undefined, overflow: 0 };
			const packed = BlockHandler.packIntoTwoRows(allNonEmpty);
			const slots = packed.slots;
			const overflow = Math.max(0, packed.aggregatedSize - slots.length);
			return {
				slots: slots.length > 0 ? slots : undefined,
				overflow,
			};
		}

		const mirrored = BlockHandler.mirrorContainer(container);
		if (!mirrored) return { slots: undefined, overflow: 0 };
		const overflow = Math.max(0, allNonEmpty.length - mirrored.mirroredNonEmpty);
		return {
			slots: mirrored.slots,
			overflow,
		};
	}

	static getBlockContainer(block) {
		const component = block.getComponent(EntityComponentTypes.Inventory);
		return component?.container ?? undefined;
	}

	static collectNonEmptyStacks(container) {
		const result = [];
		for (let index = 0; index < container.size; index++) {
			const stack = container.getItem(index);
			if (stack && stack.typeId !== 'minecraft:air' && stack.amount > 0) {
				result.push(stack);
			}
		}
		return result;
	}

	static packIntoTwoRows(items) {
		const aggregated = BlockHandler.aggregateStackableItems(items);
		const allowedSlots = [];
		for (let index = 0; index < INVENTORY_SECOND_ROW_LIMIT; index++) {
			if (index === 8) continue;
			allowedSlots.push(index);
		}

		const slots = [];
		for (let index = 0; index < allowedSlots.length; index++) {
			const item = aggregated[index];
			if (!item) break;
			slots.push({ item, slot: allowedSlots[index] });
		}
		return { slots, aggregatedSize: aggregated.length };
	}

	static mirrorContainer(container) {
		const rendered = [];
		let mirroredNonEmpty = 0;
		for (let slot = 0; slot < container.size; slot++) {
			const mapped = slot < 8 ? slot : slot + 1;
			if (mapped >= INVENTORY_SECOND_ROW_LIMIT) break;
			const stack = container.getItem(slot);
			if (stack && stack.typeId !== 'minecraft:air' && stack.amount > 0) {
				mirroredNonEmpty++;
			}
			rendered.push({
				item: stack ?? new ItemStack('minecraft:air'),
				slot: mapped,
			});
		}
		return mirroredNonEmpty > 0 ? { slots: rendered, mirroredNonEmpty } : undefined;
	}

	static aggregateStackableItems(items) {
		if (items.length === 0) return items;

		const order = [];
		const buckets = new Map();

		for (const item of items) {
			if (!item) continue;
			if (!BlockHandler.isStackableCandidate(item)) {
				order.push({ kind: 'single', stack: item });
				continue;
			}

			const key = item.typeId;
			let bucket = buckets.get(key);
			if (!bucket) {
				bucket = {
					template: item,
					maxAmount: BlockHandler.resolveMaxStackSize(item),
					total: 0,
				};
				buckets.set(key, bucket);
				order.push({ kind: 'bucket', key });
			}
			bucket.total += Math.max(0, item.amount);
		}

		const aggregated = [];
		for (const entry of order) {
			if (entry.kind === 'single') {
				aggregated.push(entry.stack);
				continue;
			}

			const bucket = buckets.get(entry.key);
			if (!bucket) continue;

			let remaining = bucket.total;
			const maxStack = Math.max(1, bucket.maxAmount);
			while (remaining > 0) {
				const portion = Math.min(maxStack, remaining);
				const clone = BlockHandler.cloneItemForAggregation(bucket.template, portion);
				if (clone) {
					aggregated.push(clone);
				}
				remaining -= portion;
			}
			buckets.delete(entry.key);
		}

		return aggregated;
	}

	static isStackableCandidate(item) {
		if (!item || item.amount <= 0) return false;
		if (item.isStackable !== true) return false;
		const maxAmount = typeof item.maxAmount === 'number' ? item.maxAmount : 0;
		return maxAmount > 1;
	}

	static resolveMaxStackSize(item) {
		const maxAmount = typeof item.maxAmount === 'number' ? item.maxAmount : 0;
		return maxAmount > 0 ? maxAmount : 64;
	}

	static cloneItemForAggregation(source, amount) {
		try {
			const clone = source.clone();
			clone.amount = amount;
			return clone;
		} catch (error) {
			BlockHandler.log.debug?.(`Failed to clone stack for aggregation: ${error}`);
			try {
				const fallback = new ItemStack(source.typeId, amount);
				fallback.amount = amount;
				return fallback;
			} catch (creationError) {
				BlockHandler.log.warn(
					`Failed to create fallback stack for ${source.typeId}: ${creationError}`,
				);
				return undefined;
			}
		}
	}
}
