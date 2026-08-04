export class Color {
	constructor(code, color) {
		this.code = code;
		this.color = color;
		if (color) {
			this.r = (color >> 16) & 255;
			this.g = (color >> 8) & 255;
			this.b = color & 255;
		}
	}

	toString() {
		return Color.PREFIX + this.code;
	}

	toRGB() {
		return this.color;
	}

	toHex() {
		return this.color?.toString(16);
	}

	getRed() {
		return this.r;
	}

	getGreen() {
		return this.g;
	}

	getBlue() {
		return this.b;
	}

	getCode() {
		return this.code;
	}

	static stripColor(value) {
		return value.replace(/§[0-9a-u]/g, '');
	}

	static findClosestColor(red, green, blue) {
		let closestDistance = Number.MAX_VALUE;
		let closestColor = Color.WHITE;
		for (const color of Color.ALL_COLORS) {
			if (color.r && color.g && color.b) {
				const distance = Math.sqrt(
					Math.pow(color.r - red, 2) +
						Math.pow(color.g - green, 2) +
						Math.pow(color.b - blue, 2),
				);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestColor = color;
				}
			}
		}
		return closestColor;
	}
}

Color.BLACK = new Color('0', 0);
Color.DARK_BLUE = new Color('1', 170);
Color.DARK_GREEN = new Color('2', 43520);
Color.DARK_AQUA = new Color('3', 43690);
Color.DARK_RED = new Color('4', 11141120);
Color.DARK_PURPLE = new Color('5', 11141290);
Color.GOLD = new Color('6', 16755200);
Color.GRAY = new Color('7', 11184810);
Color.DARK_GRAY = new Color('8', 5592405);
Color.BLUE = new Color('9', 5592575);
Color.GREEN = new Color('a', 5635925);
Color.AQUA = new Color('b', 5636095);
Color.RED = new Color('c', 16733525);
Color.LIGHT_PURPLE = new Color('d', 16733695);
Color.YELLOW = new Color('e', 16777045);
Color.WHITE = new Color('f', 16777215);
Color.MINECOIN_GOLD = new Color('g', 14603781);
Color.MATERIAL_QUARTZ = new Color('h', 14931153);
Color.MATERIAL_IRON = new Color('i', 13552330);
Color.MATERIAL_NETHERITE = new Color('j', 4471355);
Color.MATERIAL_REDSTONE = new Color('m', 9901575);
Color.MATERIAL_COPPER = new Color('n', 11823181);
Color.MATERIAL_GOLD = new Color('p', 14594349);
Color.MATERIAL_EMERALD = new Color('q', 1155126);
Color.MATERIAL_DIAMOND = new Color('s', 2931368);
Color.MATERIAL_LAPIS = new Color('t', 2181499);
Color.MATERIAL_AMETHYST = new Color('u', 10116294);
Color.OBFUSCATED = new Color('k');
Color.BOLD = new Color('l');
Color.ITALIC = new Color('o');
Color.RESET = new Color('r');
Color.VALUES = [
	Color.BLACK,
	Color.DARK_BLUE,
	Color.DARK_GREEN,
	Color.DARK_AQUA,
	Color.DARK_RED,
	Color.DARK_PURPLE,
	Color.GOLD,
	Color.GRAY,
	Color.DARK_GRAY,
	Color.BLUE,
	Color.GREEN,
	Color.AQUA,
	Color.RED,
	Color.LIGHT_PURPLE,
	Color.YELLOW,
	Color.WHITE,
	Color.MINECOIN_GOLD,
	Color.MATERIAL_QUARTZ,
	Color.MATERIAL_IRON,
	Color.MATERIAL_NETHERITE,
	Color.MATERIAL_REDSTONE,
	Color.MATERIAL_COPPER,
	Color.MATERIAL_GOLD,
	Color.MATERIAL_EMERALD,
	Color.MATERIAL_DIAMOND,
	Color.MATERIAL_LAPIS,
	Color.MATERIAL_AMETHYST,
	Color.OBFUSCATED,
	Color.BOLD,
	Color.ITALIC,
	Color.RESET,
];
Color.ALL_COLORS = [
	Color.BLACK,
	Color.DARK_BLUE,
	Color.DARK_GREEN,
	Color.DARK_AQUA,
	Color.DARK_RED,
	Color.DARK_PURPLE,
	Color.GOLD,
	Color.GRAY,
	Color.DARK_GRAY,
	Color.BLUE,
	Color.GREEN,
	Color.AQUA,
	Color.RED,
	Color.LIGHT_PURPLE,
	Color.YELLOW,
	Color.WHITE,
	Color.MINECOIN_GOLD,
	Color.MATERIAL_QUARTZ,
	Color.MATERIAL_IRON,
	Color.MATERIAL_NETHERITE,
	Color.MATERIAL_REDSTONE,
	Color.MATERIAL_COPPER,
	Color.MATERIAL_GOLD,
	Color.MATERIAL_EMERALD,
	Color.MATERIAL_DIAMOND,
	Color.MATERIAL_LAPIS,
	Color.MATERIAL_AMETHYST,
];
Color.PREFIX = '\u00A7';

export class JsonFormatter {
	constructor() {
		this.OpenObject = '{';
		this.CloseObject = '}';
		this.OpenArray = '[';
		this.CloseArray = ']';
		this.Comma = ',';
		this.KeyValueSeparator = ':';
		this.StringDelimiter = '"';
		this.KeyDelimiter = '';
		this.Indent = '  ';
		this.NewLine = '\n';
		this.Space = ' ';
		this.InlineThreshold = 60;
		this.MaxDepth = 1;
		this.IncludeClassNames = true;
		this.FunctionValue = '\u0192';
		this.NullValue = 'null';
		this.UndefinedValue = 'undefined';
		this.TrueValue = 'true';
		this.FalseValue = 'false';
		this.CycleValue = '[...cycle...]';
		this.TruncatedObjectValue = '{...}';
		this.OpenCloseObjectColor = Color.YELLOW;
		this.OpenCloseArrayColor = Color.AQUA;
		this.NumberColor = Color.DARK_AQUA;
		this.StringColor = Color.DARK_GREEN;
		this.BooleanColor = Color.GOLD;
		this.NullColor = Color.GOLD;
		this.KeyColor = Color.GRAY;
		this.EscapeColor = Color.GOLD;
		this.FunctionColor = Color.GRAY;
		this.ClassColor = Color.GRAY;
		this.ClassStyle = Color.BOLD;
		this.CycleColor = Color.DARK_RED;
	}

	static createPlain() {
		const formatter = new JsonFormatter();
		formatter.OpenCloseObjectColor = '';
		formatter.OpenCloseArrayColor = '';
		formatter.NumberColor = '';
		formatter.StringColor = '';
		formatter.BooleanColor = '';
		formatter.NullColor = '';
		formatter.KeyColor = '';
		formatter.EscapeColor = '';
		formatter.FunctionColor = '';
		formatter.ClassColor = '';
		formatter.ClassStyle = '';
		formatter.CycleColor = '';
		return formatter;
	}

	stringify(value) {
		return this.stringifyValue(value, {
			indentLevel: 0,
			visited: new WeakSet(),
		});
	}

	stringifyString(value) {
		return (
			this.StringColor +
			this.StringDelimiter +
			this.escapeString(value) +
			this.StringDelimiter +
			Color.RESET
		);
	}

	stringifyNumber(value) {
		return this.NumberColor + value.toString() + Color.RESET;
	}

	stringifyBoolean(value) {
		return (
			this.BooleanColor + (value ? this.TrueValue : this.FalseValue) + Color.RESET
		);
	}

	stringifyFunction() {
		return this.FunctionColor + this.FunctionValue + Color.RESET;
	}

	stringifyNull() {
		return this.NullColor + this.NullValue + Color.RESET;
	}

	stringifyUndefined() {
		return this.NullColor + this.UndefinedValue + Color.RESET;
	}

	stringifyCycle() {
		return this.CycleColor + this.CycleValue + Color.RESET;
	}

	stringifyArray(array, context) {
		const indent = this.Indent.repeat(context.indentLevel);
		if (array.length === 0) {
			return (
				this.OpenCloseArrayColor +
				this.OpenArray +
				this.CloseArray +
				Color.RESET
			);
		}
		let multiLine =
			this.OpenCloseArrayColor + this.OpenArray + Color.RESET + this.NewLine;
		let singleLine = this.OpenCloseArrayColor + this.OpenArray + Color.RESET;

		array.forEach((item, index) => {
			multiLine +=
				indent +
				this.Indent +
				this.stringifyValue(item, this.indent(context));
			multiLine +=
				index < array.length - 1 ? this.Comma + this.NewLine : this.NewLine;
			singleLine += this.stringifyValue(item, this.indent(context));
			singleLine += index < array.length - 1 ? this.Comma + this.Space : '';
		});

		multiLine +=
			indent + this.OpenCloseArrayColor + this.CloseArray + Color.RESET;
		singleLine += this.OpenCloseArrayColor + this.CloseArray + Color.RESET;
		return singleLine.length < this.InlineThreshold ? singleLine : multiLine;
	}

	stringifyTruncatedObject(_object, className, _context) {
		return (
			(this.IncludeClassNames
				? this.ClassColor + '' + this.ClassStyle + className + Color.RESET + this.Space
				: '') + this.TruncatedObjectValue
		);
	}

	stringifyObject(object, className, entries, context) {
		const indent = this.Indent.repeat(context.indentLevel);
		const prefix =
			this.IncludeClassNames && className !== 'Object'
				? this.ClassColor + '' + this.ClassStyle + className + Color.RESET + this.Space
				: '';
		if (entries.length === 0) {
			return (
				prefix +
				this.OpenCloseObjectColor +
				this.OpenObject +
				this.CloseObject +
				Color.RESET
			);
		}
		let multiLine =
			prefix +
			this.OpenCloseObjectColor +
			this.OpenObject +
			Color.RESET +
			this.NewLine;
		let singleLine = prefix + this.OpenCloseObjectColor + this.OpenObject + Color.RESET;

		entries.forEach(([key, value], index) => {
			const renderedValue = this.stringifyValue(value, this.indent(context));
			multiLine +=
				indent +
				this.Indent +
				this.KeyColor +
				this.KeyDelimiter +
				key +
				this.KeyDelimiter +
				Color.RESET +
				this.KeyValueSeparator +
				this.Space +
				renderedValue;
			multiLine +=
				index < entries.length - 1 ? this.Comma + this.NewLine : this.NewLine;
			singleLine +=
				this.KeyColor +
				key +
				Color.RESET +
				this.KeyValueSeparator +
				this.Space +
				renderedValue;
			singleLine += index < entries.length - 1 ? this.Comma + this.Space : '';
		});

		multiLine += indent + this.OpenCloseObjectColor + this.CloseObject + Color.RESET;
		singleLine += this.OpenCloseObjectColor + this.CloseObject + Color.RESET;
		return singleLine.length < this.InlineThreshold ? singleLine : multiLine;
	}

	shouldTruncateObject(_object, className, context) {
		return !(
			className === 'Object' ||
			context.indentLevel <= this.MaxDepth ||
			this.MaxDepth <= 0
		);
	}

	stringifyValue(value, context) {
		if (value === null) return this.stringifyNull();
		if (value === undefined) return this.stringifyUndefined();
		if (typeof value === 'number') return this.stringifyNumber(value);
		if (typeof value === 'string') return this.stringifyString(value);
		if (typeof value === 'boolean') return this.stringifyBoolean(value);
		if (typeof value === 'function') return this.stringifyFunction(value);
		if (this.isCycle(value, context)) return this.stringifyCycle();

		this.markCycle(value, context);
		if (Array.isArray(value)) {
			const result = this.stringifyArray(
				value,
				context.indentLevel ? this.indent(context) : context,
			);
			this.clearCycle(value, context);
			return result;
		}
		if (typeof value === 'object') {
			const className = value.constructor.name;
			if (this.shouldTruncateObject(value, className, context)) {
				const result = this.stringifyTruncatedObject(value, className, context);
				this.clearCycle(value, context);
				return result;
			} else {
				const keys = new Set();
				let prototype = Object.getPrototypeOf(value);
				let prototypeKeys = Object.keys(prototype);
				while (prototypeKeys.length > 0) {
					prototypeKeys.forEach((key) => keys.add(key));
					prototype = Object.getPrototypeOf(prototype);
					prototypeKeys = Object.keys(prototype);
				}
				Object.keys(value).forEach((key) => keys.add(key));
				keys.delete('__cycleDetection__');

				const entries = [...keys]
					.sort()
					.map((key) => {
						try {
							return [key, value[key] ?? undefined];
						} catch {
							return [key, undefined];
						}
					})
					.filter(([, keyValue]) => typeof keyValue !== 'function' && keyValue !== undefined);

				const result = this.stringifyObject(value, className, entries, context);
				this.clearCycle(value, context);
				return result;
			}
		}
		this.clearCycle(value, context);
		return Color.RESET + value.toString();
	}

	escapeString(value) {
		return value
			.replace(/\\/g, this.EscapeColor + '\\\\' + this.StringColor)
			.replace(/"/g, this.EscapeColor + '\\"' + this.StringColor)
			.replace(/\n/g, this.EscapeColor + '\\n' + this.StringColor)
			.replace(/\r/g, this.EscapeColor + '\\r' + this.StringColor)
			.replace(/\t/g, this.EscapeColor + '\\t' + this.StringColor);
	}

	markCycle(value, context) {
		context.visited.add(value);
	}

	isCycle(value, context) {
		return context.visited.has(value);
	}

	clearCycle(value, context) {
		context.visited.delete(value);
	}

	indent(context) {
		return { ...context, indentLevel: context.indentLevel + 1 };
	}
}

JsonFormatter.DEFAULT = new JsonFormatter();
JsonFormatter.PLAIN = JsonFormatter.createPlain();

let globalSourceMap = undefined;
try {
	globalSourceMap = globalSourceMapping;
} catch {

}

export class LogLevel {
	constructor(level, name, color = Color.RESET) {
		this.level = level;
		this.name = name;
		this.color = color;
	}

	toString() {
		return this.color + this.name.toUpperCase() + Color.RESET;
	}

	static parse(value) {
		value = value.toLowerCase();
		for (const level of LogLevel.values) {
			if (level.name === value) return level;
		}
		const numeric = parseInt(value);
		if (!isNaN(numeric)) {
			for (const level of LogLevel.values) {
				if (level.level === numeric) return level;
			}
		}
	}
}

LogLevel.All = new LogLevel(-2, 'all');
LogLevel.Trace = new LogLevel(-2, 'trace', Color.DARK_AQUA);
LogLevel.Debug = new LogLevel(-1, 'debug', Color.AQUA);
LogLevel.Info = new LogLevel(0, 'info', Color.GREEN);
LogLevel.Warn = new LogLevel(1, 'warn', Color.GOLD);
LogLevel.Error = new LogLevel(2, 'error', Color.RED);
LogLevel.Fatal = new LogLevel(3, 'fatal', Color.DARK_RED);
LogLevel.Off = new LogLevel(100, 'off');
LogLevel.values = [
	LogLevel.All,
	LogLevel.Trace,
	LogLevel.Debug,
	LogLevel.Info,
	LogLevel.Warn,
	LogLevel.Error,
	LogLevel.Fatal,
	LogLevel.Off,
];

const loggerConfig = {
	level: LogLevel.Info,
	filter: ['*'],
	outputTags: false,
	timestampFormatter: () => '',
	formatFunction: (name, level, message, scope, scopeStack = undefined) => {
		const stackText =
			scopeStack !== undefined
				? `\u00A77${scopeStack.map((tag) => `[${tag}]`).join('')}\u00A7r`
				: '';
		return `${scope ? `[${scope}]` : ''}[${name}][${Color.MATERIAL_EMERALD}${level.name}${Color.RESET}]${stackText} ${message}`;
	},
	messagesJoinFunction: (messages) => messages.join(' '),
	jsonFormatter: JsonFormatter.DEFAULT,
	outputConfig: {
		[LogLevel.Trace.level]: [0, 1],
		[LogLevel.Debug.level]: [0, 1],
		[LogLevel.Info.level]: [0, 1],
		[LogLevel.Warn.level]: [0, 1, 2],
		[LogLevel.Error.level]: [0, 1, 3],
		[LogLevel.Fatal.level]: [0, 1, 3],
	},
};

export class Logger {
	constructor(name, tags = []) {
		this.name = name;
		this.tags = tags;
	}

	static init() {}

	static setLevel(level) {
		loggerConfig.level = level;
	}

	static setFilter(filter) {
		loggerConfig.filter = filter;
	}

	static setFormatFunction(formatFunction) {
		loggerConfig.formatFunction = formatFunction;
	}

	static setMessagesJoinFunction(joinFunction) {
		loggerConfig.messagesJoinFunction = joinFunction;
	}

	static setTagsOutputVisibility(visible) {
		loggerConfig.outputTags = visible;
	}

	static setTimestampFormatter(formatter) {
		loggerConfig.timestampFormatter = formatter;
	}

	static setBasicTimestampFormatter() {
		loggerConfig.timestampFormatter = (date) => {
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			const seconds = date.getSeconds().toString().padStart(2, '0');
			const centiseconds = Math.floor(date.getMilliseconds() / 10)
				.toString()
				.padStart(2, '0');
			return `${hours}:${minutes}:${seconds}.${centiseconds}`;
		};
	}

	static setJsonFormatter(formatter) {
		loggerConfig.jsonFormatter = formatter;
	}

	static getOutputConfig() {
		return loggerConfig.outputConfig;
	}

	static getLogger(name, ...tags) {
		return new Logger(name, tags);
	}

	log(_level, ..._messages) {}

	stringifyError(error) {
		let stack = error.stack ?? '';
		if (globalSourceMap) {
			const stackFramePattern = /\(([^)]+\.js):(\d+)(?::(\d+))?\)/;
			stack = stack
				.split('\n')
				.map((line) => {
					const match = stackFramePattern.exec(line);
					if (match) {
						const filePath = match[1];
						const lineNumber = parseInt(match[2], 10) - globalSourceMap.metadata.offset;
						if (filePath.includes(globalSourceMap.metadata.filePath)) {
							const mapped = globalSourceMapping[lineNumber];
							if (mapped) {
								const replaced = `(${mapped.source}:${mapped.originalLine})`;
								return line.replace(stackFramePattern, replaced);
							}
						}
					}
					return line;
				})
				.join('\n');
		}
		return `${Color.DARK_RED}${Color.BOLD}${error.message}\n${Color.RESET}${Color.GRAY}${Color.ITALIC}${stack}${Color.RESET}`;
	}

	logRaw(_level, ..._messages) {}

	trace(..._messages) {}

	debug(..._messages) {}

	info(..._messages) {}

	warn(..._messages) {}

	error(..._messages) {}

	fatal(..._messages) {}
}

Logger.initialized = false;

export class Timings {
	static begin(operation) {
		Timings.end();
		Timings.lastTime = new Date().getTime();
		Timings.lastOperation = operation;
	}

	static end() {
		const now = new Date().getTime();
		if (Timings.lastTime > 0) {
			Timings.log.debug(
				`Operation ${Timings.lastOperation} took ${now - Timings.lastTime}ms`,
			);
		}
		Timings.lastTime = -1;
	}
}

Timings.log = Logger.getLogger('Timings', 'timings');
Timings.lastTime = -1;
Timings.lastOperation = '';
