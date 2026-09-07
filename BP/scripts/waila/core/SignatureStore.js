const PROPERTY_SIGNATURE = 'dark7mc:waila_old_log';

export class SignatureStore {

	isDuplicate(player, signature) {
		const previous = player.getDynamicProperty(PROPERTY_SIGNATURE);
		if (previous === signature) return true;

		player.setDynamicProperty(PROPERTY_SIGNATURE, signature);
		return false;
	}

	clear(player) {
		player.setDynamicProperty(PROPERTY_SIGNATURE, undefined);
	}
}
