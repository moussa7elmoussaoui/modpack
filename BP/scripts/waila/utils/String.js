String.prototype.toTitle = function () {
	return this.replace(/(^|\s)\S/g, function (char) {
		return char.toUpperCase();
	});
};

String.prototype.abrevCaps = function (threshold = 4) {
	const IGNORED_WORDS = [
		'and',
		'the',
		'of',
		'in',
		'on',
		'at',
		'to',
		'for',
		'with',
		'as',
		'by',
		'an',
		'a',
		'or',
		'but',
		'nor',
		'yet',
		'so',
	];
	return this.split(' ')
		.map((word) =>
			word.length < threshold && !IGNORED_WORDS.includes(word.toLowerCase())
				? word.toUpperCase()
				: word,
		)
		.join(' ');
};

export function formatNamespace(identifier) {
	const namespace = identifier.split(':', 1)[0];
	if (namespace === 'dark7mc') return 'DARK7MC';
	if (namespace.length < 3) return namespace.toUpperCase();

	return namespace.replace(/_/g, ' ').toTitle().abrevCaps();
}
