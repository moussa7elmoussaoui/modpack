import {
	CommandPermissionLevel,
	CustomCommandStatus,
	world,
} from '@minecraft/server';

import Meta from '../Meta.js';
import { Registry } from '../vendor/registry.js';
import { CustomCmd, OnWorldLoad } from '../vendor/stylish.js';
import WailaLogger from './Logger.js';

export default class Version {
	static _instance;
	static log = WailaLogger.get('Version');

	version;
	major;
	minor;
	patch;

	constructor(version) {
		const [x, y, z] = version.replace(/[^0-9.]/g, '').split('.');
		this.major = x;
		this.minor = y;
		this.patch = z;
		this.version = version;
	}

	saveToWorld() {
		world.setDynamicProperty('dark7mc:waila_version', this.version);
	}

	static onWorldLoad() {
		const storedVersion = world.getDynamicProperty('dark7mc:waila_version');
		const currentVersion = Version.get();
		const comparison =
			typeof storedVersion === 'string' ? Version.compareTo(storedVersion) : -1;

		const context = {
			previous:
				typeof storedVersion === 'string'
					? { version: new Version(storedVersion), commit: Meta.github.commit }
					: null,
			current: { version: currentVersion, commit: Meta.github.commit },
		};

		if (comparison < 0) {
			Version.log.info(
				`World was loaded with older version (${storedVersion ?? 'unknown'}). Upgrading to ${currentVersion.version}.`,
			);
			currentVersion.saveToWorld();
			Version.onUpgrade(context);
		} else if (comparison > 0) {
			Version.log.warn(
				`World was loaded with newer version (${storedVersion}). Downgrading to ${currentVersion.version}.`,
			);
			currentVersion.saveToWorld();
			Version.onDowngrade(context);
		} else {
			Version.log.info(`World is up to date with ${currentVersion.version}.`);
		}

		Version.log.info(`Add-On namespace registry size: ${Object.keys(Registry).length}`);
		Version.log.info('WAILA is loaded and running!');
	}

	static onUpgrade(_context) {}

	static onDowngrade(_context) {}

	static get() {
		if (!this._instance) {
			this._instance = new Version(Meta.github.tag || Meta.manifest.bp.version);
		}
		return this._instance;
	}

	static compareTo(version) {
		if (!/^v?\d+\.\d+\.\d+$/.test(version)) {
			return -1;
		}

		const current = this.get();
		const [x, y, z] = version
			.replace(/[^0-9.]/g, '')
			.split('.')
			.map(Number);
		const [currX, currY, currZ] = [
			current.major,
			current.minor,
			current.patch,
		].map(Number);

		if (currX !== x) return x - currX;
		if (currY !== y) return y - currY;
		if (currZ !== z) return z - currZ;
		return 0;
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
			sourceEntity.sendMessage({
				translate: 'commands.waila.version',
				with: [Version.get().version, Meta.github.commit],
			});
		}
		return { status: CustomCommandStatus.Success };
	}
}

CustomCmd(VersionCommand);
