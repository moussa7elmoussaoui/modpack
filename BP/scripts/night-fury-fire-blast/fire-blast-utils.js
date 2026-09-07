import { system, Player } from "@minecraft/server";
import { PLAYER_DATA_MAP } from "./fire-blast-runtime.js";
import { morphEntityTypes } from "../data/morphs";

export const DAMAGE_TIERS = {
    MEDIUM: 14.5,
    MEDIUM_PLUS: 17.0,
    HEAVY: 19.4
};

const NIGHT_FURY = "dark7mc:night_fury";

export function isNightFury(target) {
    return target instanceof Player && morphEntityTypes[target.getProperty("dark7mc:entity")] === NIGHT_FURY;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function wrapDegrees(degrees) {
    return ((degrees + 180) % 360 + 360) % 360 - 180;
}

export function getNightFuryAimDirection(player) {
    const viewDirection = player.getViewDirection();
    const bodyRotation = player.getRotation();
    const horizontalLength = Math.hypot(viewDirection.x, viewDirection.z);
    const viewPitch = Math.atan2(-viewDirection.y, horizontalLength) / DEGREES_TO_RADIANS;
    const viewYaw = Math.atan2(-viewDirection.x, viewDirection.z) / DEGREES_TO_RADIANS;
    const relativeYaw = wrapDegrees(viewYaw - bodyRotation.y);
    const pitch = player.isGliding ? 0 : clamp(viewPitch, -45, 45);
    const yaw = bodyRotation.y + clamp(relativeYaw, -50, 50);
    const pitchRadians = pitch * DEGREES_TO_RADIANS;
    const yawRadians = yaw * DEGREES_TO_RADIANS;
    const horizontal = Math.cos(pitchRadians);

    return {
        x: -Math.sin(yawRadians) * horizontal,
        y: -Math.sin(pitchRadians),
        z: Math.cos(yawRadians) * horizontal
    };
}

export const hostileTargetTypes = new Set([
    "minecraft:zombie",
    "minecraft:skeleton",
    "minecraft:spider",
    "minecraft:cave_spider",
    "minecraft:creeper",
    "minecraft:enderman",
    "minecraft:witch",
    "minecraft:husk",
    "minecraft:stray",
    "minecraft:zombified_piglin",
    "minecraft:blaze",
    "minecraft:ghast",
    "minecraft:magma_cube",
    "minecraft:slime",
    "minecraft:phantom",
    "minecraft:drowned",
    "minecraft:guardian",
    "minecraft:elder_guardian",
    "minecraft:shulker",
    "minecraft:ender_dragon",
    "minecraft:wither",
    "minecraft:evoker",
    "minecraft:evocation_illager",
    "minecraft:vindicator",
    "minecraft:vex",
    "minecraft:pillager",
    "minecraft:ravager",
    "minecraft:hoglin",
    "minecraft:piglin",
    "minecraft:strider",
    "minecraft:zoglin",
    "minecraft:zombie_villager",
    "minecraft:zombie_villager_v2",
    "minecraft:zombie_horse",
    "minecraft:skeleton_horse",
    "minecraft:wither_skeleton",
    "minecraft:endermite",
    "minecraft:illusioner",
    "minecraft:piglin_brute"
]);

export const passiveTargetTypes = new Set([
    "minecraft:cow",
    "minecraft:mooshroom",
    "minecraft:pig",
    "minecraft:sheep",
    "minecraft:chicken",
    "minecraft:horse",
    "minecraft:donkey",
    "minecraft:wolf",
    "minecraft:ocelot",
    "minecraft:parrot",
    "minecraft:rabbit",
    "minecraft:fox",
    "minecraft:polar_bear",
    "minecraft:bee",
    "minecraft:cat",
    "minecraft:cod",
    "minecraft:salmon",
    "minecraft:tropical_fish",
    "minecraft:pufferfish",
    "minecraft:squid",
    "minecraft:bat",
    "minecraft:axolotl",
    "minecraft:glow_squid",
    "minecraft:goat",
    "minecraft:wandering_trader",
    "minecraft:panda",
    "minecraft:trader_llama",
    "minecraft:llama",
    "minecraft:snowball"
]);

export function delayedFunc(player, func, tickDelay = 1) {
    system.runTimeout(() => {
        try {
            func(player);
        } catch (error) {
            console.warn(`Error in delayed function: ${error}`);
        }
    }, tickDelay);
};

export function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
};

export function normalizeVector (vector,s) {
    let l = Math.hypot(vector.x,vector.y,vector.z)
    return {
        x: s * (vector.x/l),
        y: s * (vector.y/l),
        z: s * (vector.z/l)
    }
}

export function calcVectorOffset (player, xf, yf, zf, d = player.getViewDirection(), l = player.location) {
    let m = Math.hypot(d.x, d.z);
    let xx = normalizeVector({
        x: d.z,
        y: 0,
        z: -d.x
    }, xf);
    let yy = normalizeVector({
        x: (d.x / m) * -d.y,
        y: m,
        z: (d.z / m) * -d.y
    }, yf);
    let zz = normalizeVector(d, zf);

    return {
        x: l.x + xx.x + yy.x + zz.x,
        y: l.y + xx.y + yy.y + zz.y,
        z: l.z + xx.z + yy.z + zz.z
    };
}

export function calculateDistance(posA, posB) {
    let direction = {
        x: posA.x - posB.x,
        y: posA.y - posB.y,
        z: posA.z - posB.z
    };
    return magnitude(direction);
}

export function calculateKnockbackVector(entityPosition, pusherPosition, forceMagnitude) {
    let direction = {
        x: entityPosition.x - pusherPosition.x,
        y: entityPosition.y - pusherPosition.y,
        z: entityPosition.z - pusherPosition.z
    };

    let distance = magnitude(direction);

    if (!forceMagnitude) forceMagnitude = distance;
  
    direction = {
        x: direction.x / distance,
        y: direction.y / distance,
        z: direction.z / distance
    };
  
    let knockback = {
        x: direction.x * forceMagnitude,
        y: direction.y * forceMagnitude,
        z: direction.z * forceMagnitude
    };
  
    return knockback;
}

export const getArmorDamageResistance = (entity) => {
    try {
        const armorSlots = ["Head", "Chest", "Legs", "Feet"]
        let total = 0;
        for (const slotName of armorSlots) {
            const item = entity.getComponent('minecraft:equippable').getEquipment(slotName);

            if (item) {
                const enchantable = item.getComponent('minecraft:enchantable');
                if (!enchantable) continue;
                const projectileProtection = enchantable.getEnchantment('minecraft:projectile_protection');
                if (!projectileProtection) continue;

                total += projectileProtection.level;
            }
        }

        return (total / 16) * 0.45;
    } catch (error) {
        return 0;
    }
}

export const getProtectionCounterMultiplier = (entity) => {
    try {
        const equippable = entity.getComponent('minecraft:equippable');
        if (!equippable) return 1;

        const armorSlots = ["Head", "Chest", "Legs", "Feet"];
        let totalEPF = 0;
        for (const slotName of armorSlots) {
            const item = equippable.getEquipment(slotName);
            if (!item) continue;

            const enchantable = item.getComponent('minecraft:enchantable');
            if (!enchantable) continue;

            const protection = enchantable.getEnchantment('minecraft:protection');
            if (!protection) continue;

            totalEPF += protection.level;
        }

        totalEPF = Math.min(20, totalEPF);
        if (totalEPF <= 0) return 1;

        const reductionFactor = totalEPF / 25;
        return 1 / (1 - reductionFactor);
    } catch (error) {
        return 1;
    }
}

export const isRayClear = (player, start, end) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    if (!PLAYER_DATA) return false;

    const viewDir = {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z
    };

    const magnitude = Math.sqrt(viewDir.x ** 2 + viewDir.y ** 2 + viewDir.z ** 2);

    const block = PLAYER_DATA.dimension.getBlockFromRay(start, viewDir, { maxDistance: magnitude, includePassableBlocks: false, includeLiquidBlocks: false });
    return !block;
}

const damageBypass = [
    "minecraft:warden",
    "minecraft:item",
    "minecraft:xp_orb",
    "minecraft:painting",
    "minecraft:leash_knot",
    "minecraft:armor_stand",
    "minecraft:arrow"
];

export function applyFireBlastDamage(player, target, damage, knockback, bypass = false, setOnFire = false) {
    if (isNightFury(target)) return false;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    const LEVEL_SCALING_FLOOR = 0.5;
    if (!bypass) damage *= LEVEL_SCALING_FLOOR + (1 - LEVEL_SCALING_FLOOR) * PLAYER_DATA.levelFactor;

    const damageCause = "magic";

    const playerViewDir = PLAYER_DATA.viewDir;

    if (target instanceof Player) {
        const TARGET_DATA = PLAYER_DATA_MAP[target.id] ?? {
            dimension: target.dimension,
            viewDir: target.getViewDirection()
        };
        PLAYER_DATA_MAP[target.id] ??= TARGET_DATA;

        if (!bypass) {
            const resistance = 1 - getArmorDamageResistance(target);
            damage *= resistance;
        }
    } else {
        damage *= 2.5;
    }

    const clearLineOfSight = isRayClear(player, player.location, target.location) || isRayClear(player, player.getHeadLocation(), target.location);
    const wasDamageable = !damageBypass.includes(target.typeId) && clearLineOfSight;

    if (wasDamageable) {
        const protectionCounter = getProtectionCounterMultiplier(target);
        target.applyDamage(damage * protectionCounter, { cause: damageCause, damagingEntity: player });
    }
    if (setOnFire) target.setOnFire(5, true);

    if (knockback === 0) return wasDamageable;
    if (!clearLineOfSight) return false;

    try {
        target.applyKnockback(playerViewDir.x, playerViewDir.z, knockback, knockback * 0.15);
    } catch (error) {
        try {
            target.applyImpulse({ x: playerViewDir.x * 0.01 * knockback, y: 0.01 * knockback, z: playerViewDir.z * 0.01 * knockback });
        } catch (error) {}
    }
};

export const getEntitiesNearViewDirection = (player, rayDistance = 100, upper = 3, scaleFactor = 0, viewDirection) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const viewDir = viewDirection ?? PLAYER_DATA.viewDir;
    const riderIds = getRiderIds(player);

    const totalEntities = [];
    for (let i = 0; i < rayDistance; i++) {
        const pos = calcVectorOffset(player, 0, 0, i, viewDir);

        const sigmoidFalloff = 1 + upper / (1 + 2**(-i+5)) + scaleFactor;

        const entities = player.dimension.getEntities({ location: pos, maxDistance: sigmoidFalloff, excludeNames: [player.name] });
        if (entities.length > 0) {
            for (const entity of entities) {
                if (!riderIds.has(entity.id) && !totalEntities.find(e => e.id === entity.id)) totalEntities.push(entity);
            }
        }
    }

    return totalEntities;
}

const getRiderIds = (player) => {
    const riders = player.getComponent("minecraft:rideable")?.getRiders() ?? [];
    return new Set(riders.map(rider => rider.id));
};

export const excludeRiders = (player, entities) => {
    const riderIds = getRiderIds(player);
    return entities.filter(entity => entity.id !== player.id && !riderIds.has(entity.id));
};

export const findDesireableTarget = (entities) => {
    if (entities.length === 0) return undefined;

    let target = entities.find(entity => entity instanceof Player);
    if (target) return target;

    target = entities.find(entity => hostileTargetTypes.has(entity.typeId));
    if (target) return target;

    target = entities.find(entity => passiveTargetTypes.has(entity.typeId));
    if (target) return target;

    return undefined;
};

export function createShockwave(player, location, strength, range, knockback = 1, setOnFire = false, hitTracker = null, bypass = false) {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const entities = excludeRiders(player, PLAYER_DATA.dimension.getEntities({ location: location, maxDistance: range, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"] }));

    entities.forEach(entity => {
        if (hitTracker) {
            if (hitTracker.has(entity.id)) return;
            hitTracker.add(entity.id);
        }

        const kbIntensity = knockback / (1 + Math.exp(-5 * (Math.ceil(calculateDistance(entity.location, location)) - 0.5)));
        const kbVector = calculateKnockbackVector(entity.location, location, kbIntensity/2);

        const appliedDamage = applyFireBlastDamage(player, entity, strength, 0, bypass, setOnFire);
        if (!appliedDamage) return;

        try {
            entity.applyKnockback(kbVector.x, kbVector.z, kbIntensity * 0.25, kbIntensity * 0.05);
        } catch (error) {
            const kbItem = normalizeVector(kbVector, kbIntensity * 0.3);
            try { entity.applyImpulse(kbItem); } catch (error) {}
        }
    });
};

export function traceLine(player, startPoint, endPoint, numOfPoints, particle) {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
	for (let i = 1; i <= numOfPoints; i++) {
        const position = {x: ((startPoint.x - endPoint.x) / numOfPoints) * i + endPoint.x, y: ((startPoint.y - endPoint.y) / numOfPoints) * i + endPoint.y, z: ((startPoint.z - endPoint.z) / numOfPoints) * i + endPoint.z};
        
        try { PLAYER_DATA.dimension.spawnParticle(particle, position); } catch (error) {};
	}
}