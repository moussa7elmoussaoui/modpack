import {
	CommandPermissionLevel,
	CustomCommandStatus,
} from '@minecraft/server';

import Meta from '../Meta.js';
import { CustomCmd, OnWorldLoad } from '../vendor/stylish.js';
import WailaLogger from './Logger.js';
import { feedback } from '../../utils/messages.js';

export default class Version {
	static _instance;
	static log = WailaLogger.get('Version');

	version;

	constructor(version) {
		this.version = version;
	}

	static onWorldLoad() {
		Version.log.info(`Add-On version: ${Version.get().version}`);
		Version.log.info('WAILA is loaded and running!');
	}

	static get() {
		if (!this._instance) {
			this._instance = new Version(Meta.github.tag || Meta.manifest.bp.version);
		}
		return this._instance;
	}
}

OnWorldLoad(Version.onWorldLoad);

export class VersionCommand {
	name = 'dark7mc:waila_version';
	description = 'commands.waila_version.description';
	permissionLevel = CommandPermissionLevel.Any;

	run(origin) {
		const { sourceEntity } = origin;
		if (sourceEntity?.isValid) {
			sourceEntity.sendMessage(feedback('commands.waila.version', [Version.get().version, Meta.github.commit]));
		}
		return { status: CustomCommandStatus.Success };
	}
}

CustomCmd(VersionCommand);
