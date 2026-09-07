import { system, world } from '@minecraft/server';

const DEBUG_ENABLED = false;
const DEBUG_PREFIX = '[stylish:events]';

function debug(message, ...args) {
	if (DEBUG_ENABLED) {
		try {
			if (args.length > 0) console.debug(DEBUG_PREFIX, message, ...args);
			else console.debug(DEBUG_PREFIX, message);
		} catch {

		}
	}
}

const eventListeners = Object.create(null);

function listenersFor(eventName) {
	return eventListeners[eventName] ?? (eventListeners[eventName] = []);
}

const instanceMethodMap = new WeakMap();

const wiredPlatformEvents = {};
let startupTriggered = false;

function dispatchEvent(eventName) {
	return (eventData) => {
		const listeners = listenersFor(eventName);
		debug('dispatch', { event: eventName, count: listeners.length });
		for (const listener of listeners) listener(eventData);
	};
}

function wirePlatformEvent(eventName) {
	debug('wirePlatformEvent', { event: eventName });
	if (wiredPlatformEvents[eventName]) {
		debug('alreadyWired', { event: eventName });
		return;
	}
	switch (eventName) {
		case 'startup':
		case 'worldLoad':
			break;
		case 'beforeItemUse':
			debug('subscribe', { source: 'world.beforeEvents.itemUse' });
			world.beforeEvents.itemUse.subscribe(dispatchEvent('beforeItemUse'));
			wiredPlatformEvents[eventName] = true;
			break;
		default:
			break;
	}
}

function maybeWirePlatformEvents(targetEventName) {
	debug('maybeWirePlatformEvents', { startupTriggered });
	if (!startupTriggered) return;
	if (targetEventName) {
		if (listenersFor(targetEventName).length > 0) wirePlatformEvent(targetEventName);
		return;
	}
	for (const eventName of Object.keys(eventListeners)) {
		if (listenersFor(eventName).length > 0) wirePlatformEvent(eventName);
	}
}

function componentEventHandlerBuilder(eventName) {
	return function (target, propertyKey, descriptor) {
		if (typeof target === 'function' && propertyKey === undefined && descriptor === undefined) {

			debug('register:function', { event: eventName });
			listenersFor(eventName).push(target);
			maybeWirePlatformEvents(eventName);
			return;
		}
		if (propertyKey !== undefined && descriptor && typeof descriptor.value === 'function') {
			if (typeof target === 'function') {

				debug('register:static', { event: eventName, propertyKey: String(propertyKey) });
				const bound = descriptor.value.bind(target);
				listenersFor(eventName).push(bound);
				maybeWirePlatformEvents(eventName);
				return descriptor;
			}

			debug('annotate:instance', { event: eventName, propertyKey: String(propertyKey) });
			const constructor = target.constructor;
			let classMethods = instanceMethodMap.get(constructor);
			if (!classMethods) {
				classMethods = new Map();
				instanceMethodMap.set(constructor, classMethods);
			}
			const methodKeys = classMethods.get(eventName) ?? [];
			if (!methodKeys.includes(propertyKey)) methodKeys.push(propertyKey);
			classMethods.set(eventName, methodKeys);
			return descriptor;
		}
	};
}

export const OnStartup = componentEventHandlerBuilder('startup');
export const OnWorldLoad = componentEventHandlerBuilder('worldLoad');
export const BeforeItemUse = componentEventHandlerBuilder('beforeItemUse');

function registerInstanceMethods(instance) {
	if (!instance) return;
	const constructor = instance.constructor;
	const classMethods = instanceMethodMap.get(constructor);
	if (!classMethods) return;
	for (const [eventName, methodKeys] of classMethods) {
		const listeners = listenersFor(eventName);
		for (const methodKey of methodKeys) {
			const method = instance[methodKey];
			if (typeof method === 'function') listeners.push(method.bind(instance));
		}
		debug('register:instance', {
			event: eventName,
			class: constructor?.name ?? '<anonymous>',
			count: methodKeys.length,
		});
		maybeWirePlatformEvents(eventName);
	}
}

function triggerStartupEvent(startupEvent) {
	startupTriggered = true;
	maybeWirePlatformEvents();
	const listeners = listenersFor('startup');
	debug('triggerStartupEvent', { count: listeners.length });
	for (const listener of listeners) listener(startupEvent);
}

function triggerWorldLoadEvent(worldLoadEvent) {
	const listeners = listenersFor('worldLoad');
	debug('triggerWorldLoadEvent', { count: listeners.length });
	for (const listener of listeners) listener(worldLoadEvent);
}

const itemComponents = [];
const blockComponents = [];

function registerItemComponent(componentClass) {
	itemComponents.push(componentClass);
}

function registerBlockComponent(componentClass) {
	blockComponents.push(componentClass);
}

export function CustomComponent(componentClass) {
	registerItemComponent(componentClass);
	return componentClass;
}

export function BlockComponent(componentClass) {
	registerBlockComponent(componentClass);
	return componentClass;
}

function registerAllItemComponents(registry) {
	for (const componentClass of itemComponents) {
		const instance = new componentClass();
		registerInstanceMethods(instance);
		registry.registerCustomComponent(componentClass.componentId, instance);
	}
}

function registerAllBlockComponents(registry) {
	for (const componentClass of blockComponents) {
		const instance = new componentClass();
		registerInstanceMethods(instance);
		registry.registerCustomComponent(componentClass.componentId, instance);
	}
}

const customCommands = [];

export function CustomCmd(commandClass) {
	customCommands.push(commandClass);
	return commandClass;
}

function registerAllCustomCommands(registry) {
	for (const commandClass of customCommands) {
		const instance = new commandClass();
		registerInstanceMethods(instance);

		let runFunction;
		const staticRun = commandClass.run;
		if (typeof staticRun === 'function') {
			runFunction = staticRun.bind(commandClass);
		} else if (typeof instance.run === 'function') {
			runFunction = instance.run.bind(instance);
		}
		if (!runFunction) {
			throw new Error(
				`Custom command ${commandClass.name} has no run method. Define a static or instance run(origin, ...args).`,
			);
		}
		registry.registerCommand(instance, runFunction);
	}
}

function bindThis(_target, propertyKey, descriptor) {
	const originalMethod = descriptor.value;
	return {
		configurable: true,
		enumerable: descriptor.enumerable,
		get() {
			const bound = originalMethod.bind(this);
			Object.defineProperty(this, propertyKey, {
				value: bound,
				configurable: true,
				writable: true,
				enumerable: false,
			});
			return bound;
		},
	};
}

export { bindThis as BindThis };

export function initializeStylish() {
	system.beforeEvents.startup.subscribe((startupEvent) => {
		registerAllItemComponents(startupEvent.itemComponentRegistry);
		registerAllBlockComponents(startupEvent.blockComponentRegistry);
		registerAllCustomCommands(startupEvent.customCommandRegistry);
		triggerStartupEvent(startupEvent);
	});
	world.afterEvents.worldLoad.subscribe((worldLoadEvent) => {
		triggerWorldLoadEvent(worldLoadEvent);
	});
}
