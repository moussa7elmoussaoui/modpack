import {
	CommandPermissionLevel,
	CustomCommandParamType,
	CustomCommandStatus,
	Player,
	system,
} from '@minecraft/server';
import { ModalFormData, MessageFormData } from '@minecraft/server-ui';

import { CustomCmd } from '../vendor/stylish.js';
import Waila from './Waila.js';
import WailaLogger from '../utils/Logger.js';

export class WailaSettings {
	static NAMESPACE = 'dark7mc';
	static log = WailaLogger.get('Settings');
	static DEFAULT_VIEW_DISTANCE = 8;

	static initialized = false;
	static categoryRegistry = [];
	static settingRegistry = [];
	static settingsMap = new Map();

	static DISPLAY_POSITION_OPTIONS = [
		{ value: 'top_left', labelKey: 'waila.settings.displayPosition.option.top_left' },
		{ value: 'top_middle', labelKey: 'waila.settings.displayPosition.option.top_middle' },
		{ value: 'top_right', labelKey: 'waila.settings.displayPosition.option.top_right' },
		{ value: 'left_middle', labelKey: 'waila.settings.displayPosition.option.left_middle' },
		{ value: 'center', labelKey: 'waila.settings.displayPosition.option.center' },
		{ value: 'right_middle', labelKey: 'waila.settings.displayPosition.option.right_middle' },
		{ value: 'bottom_left', labelKey: 'waila.settings.displayPosition.option.bottom_left' },
		{ value: 'bottom_middle', labelKey: 'waila.settings.displayPosition.option.bottom_middle' },
		{ value: 'bottom_right', labelKey: 'waila.settings.displayPosition.option.bottom_right' },
	];

	static WHEN_TO_SHOW_OPTIONS = [
		{ value: 'always', labelKey: 'waila.settings.whenToShow.option.always' },
		{ value: 'when_not_sneaking', labelKey: 'waila.settings.whenToShow.option.when_not_sneaking' },
		{ value: 'when_sneaking', labelKey: 'waila.settings.whenToShow.option.when_sneaking' },
		{ value: 'never', labelKey: 'waila.settings.whenToShow.option.never' },
	];

	static keys() {
		this.ensureInitialized();
		return this.settingRegistry.map((entry) => entry.key);
	}

	static entries() {
		this.ensureInitialized();
		return this.settingRegistry.map((entry) => [entry.key, entry.definition]);
	}

	static get(player, key) {
		this.ensureInitialized();
		const entry = this.settingsMap.get(key);
		if (!entry) throw new Error(`Unknown WAILA setting: ${key}`);

		const setting = entry.definition;
		const stored = player.getDynamicProperty(this.propertyKey(key));
		if (stored === undefined || stored === null) {
			return setting.default;
		}

		switch (setting.type) {
			case 'boolean':
				return typeof stored === 'boolean' ? stored : setting.default;
			case 'number':
				return typeof stored === 'number' ? stored : setting.default;
			case 'string':
				return typeof stored === 'string' ? stored : setting.default;
			case 'enum':
				return this.normalizeEnumStoredValue(setting, stored);
		}
	}

	static getAll(player) {
		const out = {};
		for (const [key] of this.entries()) {
			out[key] = this.get(player, key);
		}
		return out;
	}

	static getAllTyped(player) {
		return {
			isEnabled: this.get(player, 'isEnabled'),
			displayPosition: this.get(player, 'displayPosition'),
			displayPositionWhenSneaking: this.get(player, 'displayPositionWhenSneaking'),
			blockStatesVisibility: this.get(player, 'blockStatesVisibility'),
			effectiveToolVisibility: this.get(player, 'effectiveToolVisibility'),
			containerInventoryVisibility: this.get(player, 'containerInventoryVisibility'),
			entityTagsVisibility: this.get(player, 'entityTagsVisibility'),
			entityHealthVisibility: this.get(player, 'entityHealthVisibility'),
			alwaysDisplayEntityIntHealth: this.get(player, 'alwaysDisplayEntityIntHealth'),
			entityEffectsVisibility: this.get(player, 'entityEffectsVisibility'),
			packAuthorVisibility: this.get(player, 'packAuthorVisibility'),
		};
	}

	static set(player, key, value) {
		this.ensureInitialized();
		const entry = this.settingsMap.get(key);
		if (!entry) return false;

		const setting = entry.definition;
		const parsed = this.normalizeIncomingValue(setting, value);
		if (parsed === undefined) return false;

		player.setDynamicProperty(this.propertyKey(key), parsed);
		return true;
	}

	static reset(player, key) {
		this.ensureInitialized();
		const entry = this.settingsMap.get(key);
		if (!entry) return;
		player.setDynamicProperty(this.propertyKey(key), entry.definition.default);
	}

	static resetAll(player) {
		this.ensureInitialized();
		for (const entry of this.settingRegistry) {
			player.setDynamicProperty(this.propertyKey(entry.key), entry.definition.default);
		}
	}

	static categories() {
		this.ensureInitialized();
		return this.categoryRegistry
			.slice()
			.sort((a, b) => a.registryOrder - b.registryOrder)
			.map(({ registryOrder: _registryOrder, ...category }) => ({ ...category }));
	}

	static entriesSorted() {
		this.ensureInitialized();
		return this.settingRegistry
			.slice()
			.sort((a, b) => a.registryOrder - b.registryOrder)
			.map((entry) => [entry.key, entry.definition]);
	}

	static propertyKey(settingKey) {
		return `${this.NAMESPACE}:${settingKey}`;
	}

	static registerCategory(category) {
		this.ensureInitialized();
		this.addCategory(category);
	}

	static registerSetting(key, setting) {
		this.ensureInitialized();
		this.addSetting(key, setting);
	}

	static ensureInitialized() {
		if (this.initialized) return;
		this.initialized = true;
		this.seedDefaults();
	}

	static seedDefaults() {
		this.addCategory({
			key: 'general',
			labelKey: 'waila.settings.category.general',
		});
		this.addCategory({
			key: 'displayContent',
			labelKey: 'waila.settings.category.displayContent',
		});

		this.addSetting('isEnabled', {
			type: 'boolean',
			labelKey: 'waila.settings.isEnabled.label',
			category: 'general',
			default: true,
		});
		this.addSetting('displayPosition', {
			type: 'enum',
			labelKey: 'waila.settings.displayPosition.label',
			category: 'general',
			default: 'top_middle',
			options: this.DISPLAY_POSITION_OPTIONS,
		});
		this.addSetting('displayPositionWhenSneaking', {
			type: 'enum',
			labelKey: 'waila.settings.displayPositionWhenSneaking.label',
			descriptionKey: 'waila.settings.displayPositionWhenSneaking.description',
			category: 'general',
			default: 'unchanged',
			options: [
				{ value: 'unchanged', labelKey: 'waila.settings.displayPosition.option.unchanged' },
				...this.DISPLAY_POSITION_OPTIONS,
			],
		});
		this.addSetting('blockStatesVisibility', {
			type: 'enum',
			labelKey: 'waila.settings.blockStatesVisibility.label',
			category: 'displayContent',
			default: 'when_sneaking',
			options: this.WHEN_TO_SHOW_OPTIONS,
		});
		this.addSetting('effectiveToolVisibility', {
			type: 'enum',
			labelKey: 'waila.settings.effectiveToolVisibility.label',
			category: 'displayContent',
			default: 'always',
			options: this.WHEN_TO_SHOW_OPTIONS,
		});
		this.addSetting('containerInventoryVisibility', {
			type: 'enum',
			labelKey: 'waila.settings.containerInventoryVisibility.label',
			descriptionKey: 'waila.settings.containerInventoryVisibility.description',
			category: 'displayContent',
			default: 'never',
			options: this.WHEN_TO_SHOW_OPTIONS,
			experimental: {
				enabledValues: ['always', 'when_not_sneaking', 'when_sneaking'],
				confirmTitleKey: 'waila.settings.experimental.containerInventory.title',
				confirmBodyKey: 'waila.settings.experimental.containerInventory.body',
			},
		});
		this.addSetting('entityTagsVisibility', {
			type: 'enum',
			labelKey: 'waila.settings.entityTagsVisibility.label',
			category: 'displayContent',
			default: 'always',
			options: this.WHEN_TO_SHOW_OPTIONS,
		});
		this.addSetting('entityHealthVisibility', {
			type: 'enum',
			labelKey: 'waila.settings.entityHealthVisibility.label',
			category: 'displayContent',
			default: 'always',
			options: this.WHEN_TO_SHOW_OPTIONS,
		});
		this.addSetting('alwaysDisplayEntityIntHealth', {
			type: 'boolean',
			labelKey: 'waila.settings.alwaysDisplayEntityIntHealth.label',
			descriptionKey: 'waila.settings.alwaysDisplayEntityIntHealth.description',
			category: 'displayContent',
			default: false,
		});
		this.addSetting('entityEffectsVisibility', {
			type: 'enum',
			labelKey: 'waila.settings.entityEffectsVisibility.label',
			category: 'displayContent',
			default: 'when_sneaking',
			options: this.WHEN_TO_SHOW_OPTIONS,
		});
		this.addSetting('packAuthorVisibility', {
			type: 'enum',
			labelKey: 'waila.settings.packAuthorVisibility.label',
			category: 'displayContent',
			default: 'when_sneaking',
			options: this.WHEN_TO_SHOW_OPTIONS,
		});
	}

	static addCategory(category) {
		const existingIndex = this.categoryRegistry.findIndex((entry) => entry.key === category.key);
		if (existingIndex >= 0) {
			const existing = this.categoryRegistry[existingIndex];
			this.categoryRegistry[existingIndex] = {
				...existing,
				...category,
				registryOrder: existing.registryOrder,
			};
			return;
		}
		this.categoryRegistry.push({ ...category, registryOrder: this.categoryRegistry.length });
	}

	static addSetting(key, setting) {
		const existing = this.settingsMap.get(key);
		if (existing) {
			existing.definition = this.cloneSetting(setting);
			return;
		}
		const entry = {
			key,
			definition: this.cloneSetting(setting),
			registryOrder: this.settingRegistry.length,
		};
		this.settingRegistry.push(entry);
		this.settingsMap.set(key, entry);
	}

	static cloneSetting(setting) {
		if (setting.type === 'enum') {
			return {
				...setting,
				options: setting.options.map((option) => ({ ...option })),
			};
		}
		return { ...setting };
	}

	static normalizeEnumStoredValue(setting, stored) {
		if (typeof stored === 'string') {
			const match = setting.options.find((opt) => opt.value === stored);
			if (match) return match.value;
		}
		if (typeof stored === 'number') {
			const directMatch = setting.options.find((opt) => opt.value === stored);
			if (directMatch) return directMatch.value;
			const option = setting.options[stored];
			if (option) return option.value;
		}
		return setting.default;
	}

	static normalizeIncomingValue(setting, rawValue) {
		switch (setting.type) {
			case 'boolean':
				return typeof rawValue === 'boolean' ? rawValue : undefined;
			case 'number':
				return typeof rawValue === 'number' ? rawValue : undefined;
			case 'string':
				return typeof rawValue === 'string' ? rawValue : undefined;
			case 'enum': {

				if (typeof rawValue === 'number') {
					const byIndex = setting.options[rawValue];
					if (byIndex) return byIndex.value;
					const direct = setting.options.find((o) => o.value === rawValue);
					return direct ? direct.value : undefined;
				}
				if (typeof rawValue === 'string') {
					const opt = setting.options.find((o) => o.value === rawValue);
					return opt ? opt.value : undefined;
				}
				return undefined;
			}
			default:
				return undefined;
		}
	}

	static isExperimentalEnabled(setting, value) {
		if (!setting.experimental) return false;
		return setting.experimental.enabledValues.some((candidate) => candidate === value);
	}
}

export class WailaCommand {
	static NAMESPACE = WailaSettings.NAMESPACE;
	static log = WailaLogger.get('Command');

	constructor() {
		this.name = WailaCommand.NAMESPACE + ':waila';
		this.description = 'commands.waila.description';
		this.permissionLevel = CommandPermissionLevel.Any;
		this.cheatsRequired = false;

		this.optionalParameters = [
			{
				name: 'player',
				type: CustomCommandParamType.PlayerSelector,
			},
		];
	}

	run(origin, player) {
		const { sourceEntity } = origin;
		if (!sourceEntity || !sourceEntity.isValid || !(sourceEntity instanceof Player)) {
			return {
				status: CustomCommandStatus.Failure,
				message: 'commands.waila.runOnPlayer',
			};
		}

		if (player && player.length === 0) {
			return {
				status: CustomCommandStatus.Failure,
				message: 'commands.waila.noTargets',
			};
		}

		if (player && player.length > 1) {
			return {
				status: CustomCommandStatus.Failure,
				message: 'commands.waila.selectOne',
			};
		}

		if (
			player &&
			player?.[0].id !== sourceEntity.id &&
			sourceEntity.commandPermissionLevel < CommandPermissionLevel.Admin
		) {
			return {
				status: CustomCommandStatus.Failure,
				message: 'commands.waila.noPermission',
			};
		}

		system.run(() => {
			WailaSettingsUI.showUI(sourceEntity, player?.[0]);
		});

		WailaCommand.log.info(
			`Displayed to: ${sourceEntity.name}, editing: ${player?.[0].name ?? 'self'}`,
		);

		sourceEntity.sendMessage({
			translate: 'commands.waila.success',
			with: [sourceEntity.name],
		});

		return { status: CustomCommandStatus.Success };
	}
}

CustomCmd(WailaCommand);

export class WailaSettingsUI {
	static NAMESPACE = WailaSettings.NAMESPACE;

	static async showUI(manager, forPlayer) {
		const target = forPlayer ?? manager;
		if (!target?.isValid || !manager?.isValid) {
			return;
		}

		const form = new ModalFormData()
			.title(
				this.str('waila.settings.title' + (manager.id !== target.id ? '_for' : ''), target),
			)
			.submitButton(this.str('waila.settings.submit'));

		const renderedSettingKeys = [];

		const entries = WailaSettings.entriesSorted();
		const categories = WailaSettings.categories();
		const entriesByCategory = new Map();
		const ungroupedEntries = [];

		for (const entry of entries) {
			const [, setting] = entry;
			if (!setting.category) {
				ungroupedEntries.push(entry);
				continue;
			}

			const bucket = entriesByCategory.get(setting.category) ?? [];
			if (!entriesByCategory.has(setting.category)) {
				entriesByCategory.set(setting.category, bucket);
			}
			bucket.push(entry);
		}

		const renderSetting = (key, setting) => {
			const currentValue = WailaSettings.get(target, key);

			switch (setting.type) {
				case 'boolean': {
					const defaultValue =
						typeof currentValue === 'boolean' ? currentValue : setting.default;
					form.toggle(this.str(setting.labelKey), { defaultValue });
					break;
				}
				case 'number': {
					const numberSetting = setting;
					const defaultValue =
						typeof currentValue === 'number' ? currentValue : numberSetting.default;
					form.slider(
						this.str(numberSetting.labelKey),
						numberSetting.range[0],
						numberSetting.range[1],
						{
							valueStep: numberSetting.step ?? 1,
							defaultValue,
						},
					);
					break;
				}
				case 'string': {
					const stringSetting = setting;
					const defaultValue =
						typeof currentValue === 'string' ? currentValue : stringSetting.default;
					form.textField(this.str(stringSetting.labelKey), stringSetting.default, {
						defaultValue,
					});
					break;
				}
				case 'enum': {
					const enumSetting = setting;
					const enumValue =
						typeof currentValue === 'string' || typeof currentValue === 'number'
							? currentValue
							: enumSetting.default;
					const items = enumSetting.options.map((opt) => this.str(opt.labelKey));
					form.dropdown(this.str(enumSetting.labelKey), items, {
						defaultValueIndex: this.getEnumOptionIndex(enumSetting, enumValue),
					});
					break;
				}
			}
			renderedSettingKeys.push(key);

			if (setting.descriptionKey) {
				form.label(this.str(setting.descriptionKey, '\u00A77'));
			}
		};

		if (ungroupedEntries.length > 0) {
			for (const [key, setting] of ungroupedEntries) {
				renderSetting(key, setting);
			}
		}

		for (const category of categories) {
			const categoryEntries = entriesByCategory.get(category.key);
			if (!categoryEntries || categoryEntries.length === 0) continue;

			form.label(this.str(category.labelKey, '\n\u00A7l'));
			if (category.descriptionKey) {
				form.label(this.str(category.descriptionKey, '\u00A77'));
			}
			form.divider();

			for (const [key, setting] of categoryEntries) {
				renderSetting(key, setting);
			}
		}

		form.label(
			this.str(
				manager.id !== target.id
					? 'waila.settings.footer.other_player'
					: 'waila.settings.footer.self_adjusting',
				'\n',
				target,
			),
		);

		let response;
		try {
			response = await form.show(manager);
		} catch (error) {
			WailaSettings.log.warn(`Failed to display settings UI: ${error}`);
			return;
		}

		if (response.canceled || !response.formValues?.length) {
			if (manager.isValid) manager.playSound('note.bass');
			return;
		}

		const { changesApplied } = await this.handleResponse(
			manager,
			target,
			response.formValues ?? [],
			renderedSettingKeys,
			entries,
		);

		if (changesApplied > 0) {
			if (manager.isValid) manager.playSound('note.pling');
			if (target.isValid) {
				Waila.getInstance().clearUI(target);
			}
			this.notifyPlayers(manager, target);
		} else if (manager.isValid) {
			manager.playSound('note.bass');
		}
	}

	static async handleResponse(
		manager,
		target,
		formValues,
		renderedSettingKeys,
		renderedEntries,
	) {
		let applied = 0;
		const entryByKey = new Map(renderedEntries);
		let valueIndex = 0;

		for (const key of renderedSettingKeys) {
			const setting = entryByKey.get(key);
			if (!setting) continue;

			while (valueIndex < formValues.length && formValues[valueIndex] === undefined) {
				valueIndex++;
			}
			if (valueIndex >= formValues.length) break;

			const rawValue = formValues[valueIndex];
			valueIndex++;
			const normalized = WailaSettings.normalizeIncomingValue(setting, rawValue);
			if (normalized === undefined) continue;

			const previous = WailaSettings.get(target, key);
			if (this.areValuesEqual(previous, normalized)) continue;

			if (
				setting.experimental &&
				WailaSettings.isExperimentalEnabled(setting, normalized) &&
				!WailaSettings.isExperimentalEnabled(setting, previous)
			) {
				const confirmed = await this.confirmExperimental(manager, setting, target);
				if (!confirmed) {
					continue;
				}
			}

			if (WailaSettings.set(target, key, normalized)) {
				applied++;
			}
		}

		return { changesApplied: applied };
	}

	static async confirmExperimental(manager, setting, target) {
		if (!setting.experimental) return true;
		if (!manager.isValid) return false;

		const confirmForm = new MessageFormData()
			.title(this.str(setting.experimental.confirmTitleKey, target))
			.body(this.str(setting.experimental.confirmBodyKey))
			.button1(this.str('waila.settings.experimental.confirm'))
			.button2(this.str('waila.settings.experimental.cancel'));

		let response;
		try {
			response = await confirmForm.show(manager);
		} catch (error) {
			WailaSettings.log.warn(`Failed to display experimental confirmation: ${error}`);
			return false;
		}

		return response.selection === 0;
	}

	static notifyPlayers(manager, target) {
		const samePlayer = manager.id === target.id;
		if (target.isValid) {
			const targetMessage = samePlayer
				? this.str('waila.settings.feedback.updatedSelf')
				: this.str('waila.settings.feedback.updatedByOther', manager);
			target.sendMessage(targetMessage);
		}
		if (!samePlayer && manager.isValid) {
			manager.sendMessage(this.str('waila.settings.feedback.updatedOther', target));
		}
	}

	static areValuesEqual(a, b) {
		return a === b;
	}

	static str(token, prefixOrPlayer, playerArg) {
		if (playerArg) {
			return {
				rawtext: [
					{ text: prefixOrPlayer },
					{ translate: token, with: [playerArg.name] },
				],
			};
		}

		if (typeof prefixOrPlayer === 'string') {
			return { rawtext: [{ text: prefixOrPlayer }, { translate: token }] };
		} else if (prefixOrPlayer) {
			return { rawtext: [{ translate: token, with: [prefixOrPlayer.name] }] };
		} else {
			return { rawtext: [{ translate: token }] };
		}
	}

	static getEnumOptionIndex(setting, value) {
		const index = setting.options.findIndex((opt) => opt.value === value);
		return index >= 0 ? index : 0;
	}
}

export function shouldDisplayFeature(option, isSneaking) {
	switch (option) {
		case 'always':
			return true;
		case 'when_not_sneaking':
			return !isSneaking;
		case 'when_sneaking':
			return isSneaking;
		case 'never':
		default:
			return false;
	}
}

export function resolveDisplayAnchor(required, fallback) {
	return required === 'unchanged' ? fallback : required;
}
