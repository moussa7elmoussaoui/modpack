import { Logger } from '../vendor/logger.js';

export class RuleMatcher {
	static log = Logger.getLogger('RuleMatcher');

	static matches(value, rule) {
		const isNegatedRule = rule.startsWith('!');
		const actualRule = isNegatedRule ? rule.substring(1) : rule;

		const positiveMatchFound =
			actualRule === value ||
			(!actualRule.includes(':') && value.includes(actualRule));

		return isNegatedRule ? !positiveMatchFound : positiveMatchFound;
	}

	static listMatches(value, rules, options) {
		if (!rules || rules.length === 0) return false;

		let hasPositive = false;

		for (const rule of rules) {
			if (RuleMatcher.matches(value, rule)) {
				if (rule.startsWith('!')) {
					options?.onNegatedMatch?.();
					return false;
				}
				hasPositive = true;
			}
		}

		return hasPositive;
	}
}
