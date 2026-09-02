import { system, world, Player, MolangVariableMap } from "@minecraft/server";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "./fire-blast-runtime.js";
import { DAMAGE_TIERS } from "./fire-blast-damage.js";

export const autoSmeltItems = {
    "minecraft:cod": "minecraft:cooked_cod",
    "minecraft:beef": "minecraft:cooked_beef",
    "minecraft:chicken": "minecraft:cooked_chicken",
    "minecraft:porkchop": "minecraft:cooked_porkchop",
    "minecraft:rabbit": "minecraft:cooked_rabbit",
    "minecraft:mutton": "minecraft:cooked_mutton",
    "minecraft:salmon": "minecraft:cooked_salmon",
	"minecraft:raw_copper": "minecraft:copper_ingot",
	"minecraft:raw_iron": "minecraft:iron_ingot",
	"minecraft:raw_gold": "minecraft:gold_ingot",
	"minecraft:iron_ore": "minecraft:raw_iron",
    "minecraft:gold_ore": "minecraft:raw_gold",
    "minecraft:diamond_ore": "minecraft:diamond",
    "minecraft:emerald_ore": "minecraft:emerald",
	"minecraft:copper_ore": "minecraft:raw_copper",
    "minecraft:quartz_ore": "minecraft:quartz",
	"minecraft:nether_gold_ore": "minecraft:gold_nugget",
    "minecraft:coal_ore": "minecraft:coal",
    "minecraft:lapis_ore": "minecraft:lapis_lazuli",
    "minecraft:redstone_ore": "minecraft:redstone",
	"minecraft:deepslate_coal_ore": "minecraft:coal",
    "minecraft:deepslate_iron_ore": "minecraft:raw_iron",
    "minecraft:deepslate_gold_ore": "minecraft:raw_gold",
    "minecraft:deepslate_diamond_ore": "minecraft:diamond",
    "minecraft:deepslate_lapis_ore": "minecraft:lapis_lazuli",
    "minecraft:deepslate_redstone_ore": "minecraft:redstone",
    "minecraft:deepslate_emerald_ore": "minecraft:emerald",
	"minecraft:deepslate_copper_ore": "minecraft:raw_copper",
    "minecraft:stick": "torch"
}

export const groundBlocks = new Set([
    "minecraft:grass",
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:short_dry_grass",
    "minecraft:tall_dry_grass",
	"minecraft:dirt",
	"minecraft:grass_block",
    "minecraft:podzol",
	"minecraft:mycelium",
	"minecraft:grass_path",
	"minecraft:gravel",
	"minecraft:sandstone",
    "minecraft:red_sandstone",
	"minecraft:stone",
    "minecraft:granite",
    "minecraft:polished_granite",
    "minecraft:diorite",
    "minecraft:polished_diorite",
    "minecraft:andesite",
    "minecraft:polished_andesite",
	"minecraft:sand",
	"minecraft:obsidian",
	"minecraft:blackstone",
	"minecraft:mud",
	"minecraft:packed_mud",
	"minecraft:end_stone",
	"minecraft:netherrack",
	"minecraft:deepslate",
    "minecraft:cobble",
    "minecraft:cobblestone",
	"minecraft:cobbled_deepslate",
    "minecraft:cobbled_deepslate_double_slab",
    "minecraft:mossy_cobblestone",
	"minecraft:farmland",
	"minecraft:clay",
	"minecraft:crimson_nylium",
	"minecraft:warped_nylium",
	"minecraft:crying_obsidian",
    "minecraft:hardened_clay",
    "minecraft:stained_hardened_clay",
    "minecraft:black_glazed_terracotta",
    "minecraft:blue_glazed_terracotta",
    "minecraft:brown_glazed_terracotta",
    "minecraft:cyan_glazed_terracotta",
    "minecraft:gray_glazed_terracotta",
    "minecraft:green_glazed_terracotta",
    "minecraft:light_blue_glazed_terracotta",
    "minecraft:lime_glazed_terracotta",
    "minecraft:magenta_glazed_terracotta",
    "minecraft:orange_glazed_terracotta",
    "minecraft:pink_glazed_terracotta",
    "minecraft:purple_glazed_terracotta",
    "minecraft:red_glazed_terracotta",
    "minecraft:silver_glazed_terracotta",
    "minecraft:white_glazed_terracotta",
    "minecraft:yellow_glazed_terracotta",
    "minecraft:farmland",
    "minecraft:basalt",
    "minecraft:polished_basalt",
    "minecraft:smooth_basalt",
    "minecraft:soul_sand",
    "minecraft:soul_soil",
    "minecraft:nether_brick",
    "minecraft:calcite",
    "minecraft:moss_block",
    "minecraft:mud",
    "minecraft:tuff",
    "minecraft:dripstone_block",
    "minecraft:red_sand",
    "minecraft:gravel",
    "minecraft:suspicious_sand",
    "minecraft:suspicious_gravel",
    "minecraft:packed_mud",
    "minecraft:mud_bricks",
    "minecraft:cracked_deepslate_bricks",
    "minecraft:cracked_deepslate_tiles",
    "minecraft:deepslate_tiles",
    "minecraft:cracked_nether_bricks",
    "minecraft:cracked_polished_blackstone_bricks",
    "minecraft:tuff_bricks",
    "minecraft:deepslate_bricks",
    "minecraft:stonebrick",
    "minecraft:chiseled_tuff_bricks",
    "minecraft:amethyst_block",
]);

export const mobTypes = new Set([
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
    "minecraft:vindicator",
    "minecraft:vex",
    "minecraft:illager_beast",
    "minecraft:pillager",
    "minecraft:ravager",
    "minecraft:hoglin",
    "minecraft:piglin",
    "minecraft:strider",
    "minecraft:zoglin",
    "minecraft:strider",
    "minecraft:zombie_villager",
    "minecraft:zombie_horse",
    "minecraft:skeleton_horse",
    "minecraft:husk",
    "minecraft:drowned",
    "minecraft:phantom",
    "minecraft:wither_skeleton",
    "minecraft:endermite",
    "minecraft:guardian",
    "minecraft:elder_guardian",
    "minecraft:shulker",
    "minecraft:illusioner",
    "minecraft:zombie_villager_v2",
    "minecraft:evocation_illager",
    "minecraft:vindicator_v2",
    "minecraft:illusioner",
    "minecraft:piglin_brute"
]);

export const animalTypes = new Set([
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
    "minecraft:moobloom",
    "minecraft:wandering_trader",
    "minecraft:panda",
    "minecraft:trader_llama",
    "minecraft:llama",
    "minecraft:snowball",
]);

export const conductiveBlocks = new Set([
    "minecraft:iron_block",
    "minecraft:gold_block",
    "minecraft:copper_block",
    "minecraft:netherite_block",
    "minecraft:water",
    "minecraft:iron_bars",
    "minecraft:anvil",
    "minecraft:chipped_anvil",
    "minecraft:damaged_anvil",
    "minecraft:chain",
    "minecraft:hopper",
    "minecraft:dispenser",
    "minecraft:dropper",
    "minecraft:blast_furnace",
    "minecraft:furnace",
    "minecraft:cauldron",
    "minecraft:lightning_rod",
    "minecraft:iron_door",
    "minecraft:iron_trapdoor",
    "minecraft:iron_rail",
    "minecraft:detector_rail",
    "minecraft:activator_rail",
    "minecraft:heavy_weighted_pressure_plate",
    "minecraft:bell"
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

export function isNearWaterSource(player, radius = 4) {
    try {
        const loc = player.location;
        const dimension = player.dimension;
        for (let x = -radius; x <= radius; x += 2) {
            for (let y = -2; y <= 2; y++) {
                for (let z = -radius; z <= radius; z += 2) {
                    const block = dimension.getBlock({ x: Math.floor(loc.x + x), y: Math.floor(loc.y + y), z: Math.floor(loc.z + z) });
                    if (block && (block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water" || block.typeId === "minecraft:bubble_column")) return true;
                }
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}

export function tryAutoSipWater(player) {
    try {
        const container = player.getComponent("inventory")?.container;
        if (!container) return false;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item || item.typeId !== "a:water_cup") continue;

            if (item.amount > 1) {
                item.amount -= 1;
                container.setItem(i, item);
            } else {
                container.setItem(i, undefined);
            }

            const emptyCup = new ItemStack("a:empty_cup");
            if (container.emptySlotsCount > 0) {
                container.addItem(emptyCup);
            } else {
                player.dimension.spawnItem(emptyCup, player.location);
            }

            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
}

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

export const getBendingResistance = (entity) => {
    try {
        const armorSlots = ["Head", "Chest", "Legs", "Feet"]
        let total = 0;
        for (const slotName of armorSlots) {
            const item = entity.getComponent('minecraft:equippable').getEquipment(slotName);

            if (item) {
                const enchantable = item.getComponent('minecraft:enchantable');
                if (!enchantable) continue;
                const bending_resistance = enchantable.getEnchantment('minecraft:projectile_protection');
                if (!bending_resistance) continue;

                total += bending_resistance.level;
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

export const isWieldingDensityOrBreachWeapon = (player) => {
    try {
        const item = player.getComponent('minecraft:equippable')?.getEquipment('Mainhand');
        if (!item) return false;
        const enchantable = item.getComponent('minecraft:enchantable');
        if (!enchantable) return false;
        return !!(enchantable.getEnchantment('minecraft:density') || enchantable.getEnchantment('minecraft:breach'));
    } catch (error) {
        return false;
    }
}

export const toRomanNumeral = (num) => {
    var lookup = {M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1}, roman = '', i;
    for ( i in lookup ) {
        while ( num >= lookup[i] ) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
}

export function formatBlockName(block) {
    if (block === undefined) return "Air";

    const parts = block.toString().split(':');
    const name = parts[1];
  
    const formattedName = name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  
    return formattedName;
}

export const enterCombatMode = (player, target) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const TARGET_DATA = PLAYER_DATA_MAP[target.id];

    if (!PLAYER_DATA.combatTimer) {
        PLAYER_DATA.combatTimer = 600;
        player.sendMessage([{ text: '§c' }, { translate: 'status_message.combat_timer_down' }]);
    } else {
        PLAYER_DATA.combatTimer = 600;
    }

    if (!TARGET_DATA.combatTimer) {
        TARGET_DATA.combatTimer = 600;
        target.sendMessage([{ text: '§c' }, { translate: 'status_message.combat_timer_down' }]);
    } else {
        TARGET_DATA.combatTimer = 600;
    }

    player.setDynamicProperty("combat_timer", PLAYER_DATA.combatTimer);
    target.setDynamicProperty("combat_timer", TARGET_DATA.combatTimer);
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

const DEBUG_CATEGORY_COLORS = {
    DMG: '§c',
    BLOCK: '§e',
    ARMOR: '§6',
    'RES+': '§a',
    CHI: '§b'
};

export const formatMoveName = (move) => {
    const key = move?.name?.translate ?? move?.translate;
    if (!key) return "Unknown Move";

    const parts = key.split('.');
    const raw = parts[parts.length - 2] ?? parts[parts.length - 1];
    return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const sendDebug = (player, category, message) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    if (!PLAYER_DATA?.settings?.showDamageDebug) return;

    const color = DEBUG_CATEGORY_COLORS[category] ?? '§7';
    player.sendMessage([{ text: `§8[§dDBG§8:${color}${category}§8]§r §7${message}` }]);
}

export function applyBendingDamage(player, target, damage, knockback, bypass = false, setOnFire = false, noCombo = false, ignoreReflect = false) {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    const isUltraMove = damage === DAMAGE_TIERS.ULTRA;

    const LEVEL_SCALING_FLOOR = 0.5;
    if (!bypass) damage *= LEVEL_SCALING_FLOOR + (1 - LEVEL_SCALING_FLOOR) * PLAYER_DATA.levelFactor;

    let trueDamage = damage;

    if (player.hasTag("as_on") && !isUltraMove) {
        damage += 2;
        trueDamage += 2;
    }

    const damageCause = "magic";

    const playerViewDir = PLAYER_DATA.viewDir;
    if (target.hasTag("bending_dmg_off")) {
        sendDebug(player, 'DMG', `${target.name ?? "target"} has bending_dmg_off - hit ignored`);
        return false;
    }

    if (target instanceof Player) {
        const TARGET_DATA = PLAYER_DATA_MAP[target.id] ?? {
            dimension: target.dimension,
            viewDir: target.getViewDirection(),
            skills: [],
            elementMap: [],
            settings: { showStatusMessages: false, showDamageDebug: false },
            chi: 100,
            combo: 0,
            lastHit: Date.now(),
            overflow: 0,
            sneakTimer: 0,
            blockSpamCount: 0,
            lastChatMsg: Date.now(),
            reflectDamage: false,
            invincible: false
        };
        PLAYER_DATA_MAP[target.id] ??= TARGET_DATA;

        if (PLAYER_DATA.teamId && TARGET_DATA.teamId && TARGET_DATA.teamId === PLAYER_DATA.teamId) {
            const team = world.getDynamicProperty(`team_${PLAYER_DATA.teamId}`);
            const parsedTeam = JSON.parse(team);
            if (parsedTeam && !parsedTeam.settings.friendlyFire) {
                sendDebug(player, 'DMG', `${target.name} is on your team, friendly fire off - hit ignored`);
                return false;
            }
        }

        if (TARGET_DATA.reflectDamage && !ignoreReflect) {
            const reflectProtectionCounter = getProtectionCounterMultiplier(player);
            const reflectDamage = player.applyDamage(damage * 0.5 * reflectProtectionCounter, { cause: damageCause, damagingEntity: target });
            if (reflectDamage) {
                target.sendMessage([{ text: '§7' }, { translate: 'elements.nonbender.message.boomerang_success' }]);
                sendDebug(player, 'DMG', `${target.name} reflected your hit (Boomerang/Earth Shield) - you took ${(damage * 0.5).toFixed(1)}`);
                return false;
            }
        }

        if (TARGET_DATA.invincible) {
            sendDebug(player, 'DMG', `${target.name} is invincible - hit ignored`);
            return false;
        }

        if (target.hasTag("bendingShield")) {
            if (TARGET_DATA.settings?.showStatusMessages) {
                target.sendMessage([{ text: '§a' }, { translate: 'status_message.earth_shield.blocked' }]);
            }
            if (PLAYER_DATA.settings?.showStatusMessages) {
                player.sendMessage([{ text: '§c' }, { translate: 'status_message.earth_shield.attacker' }]);
            }
            sendDebug(player, 'DMG', `${target.name} is behind an Earth Shield - hit ignored`);
            return false;
        }

        const target_skills = TARGET_DATA.skills;

        const t = TARGET_DATA.sneakTimer ?? 0;
        const now = Date.now();
        const offCooldown = (!TARGET_DATA.block_cooldown || TARGET_DATA.block_cooldown < now);

        const perfectMin = WORLD_SETTINGS.block_perfect_window_min ?? 1;
        const perfectMax = WORLD_SETTINGS.block_perfect_window_max ?? 5;
        const goodMin    = WORLD_SETTINGS.block_good_window_min    ?? 1;
        const goodMax    = WORLD_SETTINGS.block_good_window_max    ?? 10;
        const perfectCd  = WORLD_SETTINGS.block_perfect_cd         ?? 3000;
        const goodCd     = WORLD_SETTINGS.block_good_cd            ?? 0;

        const isPerfect = t >= perfectMin && t <= perfectMax;
        const isGood    = t >= goodMin    && t <= goodMax;

        let facingAttacker = false;
        if (isPerfect || isGood) {
            const defViewDir = TARGET_DATA.viewDir ?? target.getViewDirection?.() ?? { x: 0, y: 0, z: 1 };
            const dx = player.location.x - target.location.x;
            const dz = player.location.z - target.location.z;
            const len = Math.sqrt(dx * dx + dz * dz) || 1;
            const toAttackerX = dx / len;
            const toAttackerZ = dz / len;
            const dot = defViewDir.x * toAttackerX + defViewDir.z * toAttackerZ;
            facingAttacker = dot > 0.0;
        }

        if ((isPerfect || isGood) && offCooldown && facingAttacker) {
            sendDebug(player, 'BLOCK', `${target.name} landed a ${isPerfect ? "§bPERFECT" : "§eGOOD"}§7 block on tick ${t}`);

            const spam = Math.min(TARGET_DATA.blockSpamCount ?? 0, 4);
            const spamPenalty = spam * 0.15;

            const viewDir = TARGET_DATA.viewDir ?? target.getViewDirection?.() ?? { x: 0, y: 0, z: 1 };
            const directedMap = new MolangVariableMap();
            directedMap.setVector3("variable.plane", viewDir);

            const particleId = isPerfect ? "a:block_indicator" : "a:block_indicator";
            const soundId    = isPerfect ? "night_fury_fire_blast.perfect_block" : "night_fury_fire_blast.block";

            TARGET_DATA.block_cooldown = now + (isPerfect ? perfectCd : goodCd);

            TARGET_DATA.dimension.spawnParticle(
                particleId,
                calcVectorOffset(target, 0, 0, 0.7, viewDir, target.getHeadLocation()),
                directedMap
            );
            TARGET_DATA.dimension.playSound(soundId, target.location, { volume: 3, pitch: isPerfect ? 1 : 0.9 });
            target.playAnimation("animation.air.push");

            if (TARGET_DATA.settings?.showStatusMessages) {
                if (isPerfect) {
                    target.sendMessage([{ text: '§7' }, { translate: 'status_message.block_perfect.blocker' }]);
                } else {
                    target.sendMessage([{ text: '§7' }, { text: 'Good Block!' }]);
                }
            }
            if (PLAYER_DATA.settings?.showStatusMessages) {
                if (isPerfect) {
                    player.sendMessage([{ text: '§7' }, { translate: 'status_message.block.perfect.blocked' }]);
                } else {
                    player.sendMessage([{ text: '§7' }, { text: 'Your move was blocked!' }]);
                }
            }

            if (isPerfect) {
                const resDur  = Math.round(60  * (1 - spamPenalty));
                const regDur  = Math.round(60  * (1 - spamPenalty));
                const spdDur  = Math.round(10  * (1 - spamPenalty));
                target.addEffect("resistance",   resDur, { amplifier: 4, showParticles: true });
                target.addEffect("regeneration", regDur, { amplifier: 3, showParticles: true });
                target.addEffect("speed",        spdDur, { amplifier: 2, showParticles: false });

                if (target_skills.includes('redirection')) {
                    const now2 = Date.now();
                    const redirectionCd = WORLD_SETTINGS.redirection_cooldown ?? 5000;
                    const redirectionReady = !TARGET_DATA.redirectionCooldown || TARGET_DATA.redirectionCooldown < now2;

                    if (redirectionReady) {
                        TARGET_DATA.redirectionCooldown = now2 + redirectionCd;

                        const reflectAmount = 1;
                        player.applyDamage(reflectAmount, { cause: "override", damagingEntity: target });
                        if (PLAYER_DATA.settings?.showStatusMessages) {
                            player.sendMessage([{ text: '§c' }, { translate: 'status_message.redirection.attacker' }]);
                        }
                        if (TARGET_DATA.settings?.showStatusMessages) {
                            target.sendMessage([{ text: '§a' }, { translate: 'status_message.redirection.blocker' }]);
                        }
                    }
                }

                if (target_skills.includes('neutral_jing')) {
                    TARGET_DATA.chi = Math.min(100, TARGET_DATA.chi + 15);
                }

                TARGET_DATA.blockState = "a:block_5";
                delayedFunc(player, () => { TARGET_DATA.blockState = "a:block_6" }, 5);
                delayedFunc(player, () => { TARGET_DATA.blockState = "a:block_0" }, 15);
                delayedFunc(player, () => { TARGET_DATA.blockState = "a:block_hide" }, 35);

            } else {
                const resDur = Math.round(40 * (1 - spamPenalty));
                const regDur = Math.round(20 * (1 - spamPenalty));
                const spdDur = Math.round(8  * (1 - spamPenalty));
                target.addEffect("resistance",   resDur, { amplifier: 2, showParticles: true });
                target.addEffect("regeneration", regDur, { amplifier: 1, showParticles: true });
                target.addEffect("speed",        spdDur, { amplifier: 1, showParticles: false });

                if (knockback !== 0) {
                    try {
                        target.applyKnockback(playerViewDir.x, playerViewDir.z, knockback, knockback * 0.15);
                    } catch (error) {
                        try {
                            target.applyImpulse({ x: playerViewDir.x * 0.01 * knockback, y: 0.01 * knockback, z: playerViewDir.z * 0.01 * knockback });
                        } catch (error) {}
                    }
                }

                TARGET_DATA.blockState = "a:block_0";
                delayedFunc(player, () => { TARGET_DATA.blockState = "a:block_hide" }, 35);
            }

            return false;
        }

        TARGET_DATA.blockState = "a:block_0";
        delayedFunc(player, () => { TARGET_DATA.blockState = "a:block_hide" }, 35);


        if (!bypass) {
            if (target_skills.includes('bending_resistance') || target_skills.includes('bending_resistance_plus')) {
                damage *= 0.75;
                trueDamage *= 0.75;
            }

            if (target_skills.includes('bending_resistance_plus')) {
                const attackerElement = PLAYER_DATA.lastMoveElement;
                const attackerElementFresh = PLAYER_DATA.lastMoveElementTime && (Date.now() - PLAYER_DATA.lastMoveElementTime < 4000);
                const defenderElements = TARGET_DATA.elementMap ?? [];
                const sameElementMatch = attackerElement && attackerElementFresh && defenderElements.includes(attackerElement);

                if (sameElementMatch) {
                    damage = Math.max(0, damage - 1);
                    trueDamage = Math.max(0, trueDamage - 1);
                }

                sendDebug(player, 'RES+', `element: ${attackerElement ?? "none"} | fresh: ${Boolean(attackerElementFresh)} | defender has it: ${defenderElements.includes(attackerElement)} -> ${sameElementMatch ? "§a-1 dmg" : "§7no bonus"}`);
            }

            const resistance = (1 - getBendingResistance(target));
            damage *= resistance;
            trueDamage *= resistance;
        }

        enterCombatMode(player, target);
    } else {
        damage = damage * 2.5;
    }

    const clearLineOfSight = isRayClear(player, player.location, target.location) || isRayClear(player, player.getHeadLocation(), target.location);
    const wasDamageable = !damageBypass.includes(target.typeId) && clearLineOfSight;

    if (wasDamageable && !noCombo) {
        if (PLAYER_DATA.overflow === 0 && PLAYER_DATA.lastHit < Date.now() + 1300) {
            PLAYER_DATA.combo += Math.min(3, Math.max(1, trueDamage / 10));
            if (PLAYER_DATA.combo > 8) PLAYER_DATA.combo = 8;

            PLAYER_DATA.lastHit = Date.now() + 1500;   
        }

        if (PLAYER_DATA.combo > 7 && PLAYER_DATA.overflow === 0 && !player.hasTag("as_on")) {
            PLAYER_DATA.combo = 8.5;
            PLAYER_DATA.overflow = 125;
            if (PLAYER_DATA.settings.showStatusMessages) player.sendMessage([{ text: '§7' }, { translate: 'status_message.chi_overflow_enter' }]);

            player.addEffect("speed", 125, { amplifier: 2, showParticles: false });
            player.addEffect("resistance", 125, { amplifier: 1, showParticles: false });
            player.runCommand("camerashake add @s 0.05 6 positional");
        } else if (PLAYER_DATA.overflow > 0) {
            damage *= 2.0;
            trueDamage *= 2.0;
        }

        const skills = PLAYER_DATA.skills;
        if (skills.includes('warriors_spirit_plus')) {
            damage *= 1.15;
            trueDamage *= 1.15;
        }
    }

    if (PLAYER_DATA.settings.showDamageDebug && Date.now() > PLAYER_DATA.lastChatMsg) {
        PLAYER_DATA.lastChatMsg = Date.now() + 50;

        const moveName = formatMoveName(PLAYER_DATA.lastMoveUsed);
        const losText = wasDamageable ? "§aclear" : "§cBLOCKED";
        const overflowText = PLAYER_DATA.overflow > 0 ? " §d[overflow x2]" : "";

        sendDebug(player, 'DMG', `${moveName} -> ${target.name ?? target.typeId}: §f${damage.toFixed(1)}§7 dmg (true §f${trueDamage.toFixed(1)}§7) | LoS: ${losText}${overflowText}`);
    }

    if (wasDamageable && target instanceof Player) {
        const TARGET_DATA_KILL = PLAYER_DATA_MAP[target.id];
        if (TARGET_DATA_KILL) {
            TARGET_DATA_KILL.lastBendingAttacker = {
                name: player.name,
                move: PLAYER_DATA.lastMoveUsed ?? null,
                time: Date.now()
            };
        }
    }

    if (wasDamageable) {
        const protectionCounter = getProtectionCounterMultiplier(target);
        target.applyDamage(damage * protectionCounter, { cause: damageCause, damagingEntity: player});
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

export const getEntitiesNearViewDirection = (player, rayDistance = 100, upper = 3, scaleFactor = 0) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const viewDir = PLAYER_DATA.viewDir;

    const totalEntities = [];
    for (let i = 0; i < rayDistance; i++) {
        const pos = calcVectorOffset(player, 0, 0, i, viewDir);

        const sigmoidFalloff = 1 + upper / (1 + 2**(-i+5)) + scaleFactor;

        const entities = player.dimension.getEntities({ location: pos, maxDistance: sigmoidFalloff, excludeNames: [player.name], excludeTags: ["bending_dmg_off"] });
        if (entities.length > 0) {
            for (const entity of entities) {
                if (!totalEntities.find(e => e.id === entity.id)) totalEntities.push(entity);
            }
        }
    }

    return totalEntities;
}

export const findDesireableTarget = (entities) => {
    if (entities.length === 0) return undefined;

    let target = entities.find(entity => entity instanceof Player);
    if (target) return target;

    target = entities.find(entity => mobTypes.has(entity.typeId));
    if (target) return target;

    target = entities.find(entity => animalTypes.has(entity.typeId));
    if (target) return target;

    return undefined;
};

export const findMultipleDesireableTargets = (entities, length, excludeItems = false) => {
    if (entities.length === 0) return undefined;

    let targets = entities.filter(entity => entity instanceof Player);
    if (targets.length >= length) return targets.slice(0, length);

    targets = entities.filter(entity => mobTypes.has(entity.typeId));
    if (targets.length >= length) return targets.slice(0, length);

    targets = entities.filter(entity => animalTypes.has(entity.typeId));
    if (targets.length >= length) return targets.slice(0, length);

    if (excludeItems) entities = entities.filter(entity => !damageBypass.includes(entity.typeId));

    return entities.slice(0, length);
};

export function createShockwave(player, location, strength, range, knockback = 1, setOnFire = false, hitTracker = null, ignoreReflect = false, bypass = false) {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const entities = PLAYER_DATA.dimension.getEntities({ location: location, maxDistance: range, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"], excludeTypes: ["item", "a:dirt_block_small"] });

    entities.forEach(entity => {
        if (hitTracker) {
            if (hitTracker.has(entity.id)) return;
            hitTracker.add(entity.id);
        }

        const kbIntensity = knockback / (1 + Math.exp(-5 * (Math.ceil(calculateDistance(entity.location, location)) - 0.5)));
        const kbVector = calculateKnockbackVector(entity.location, location, kbIntensity/2);

        const appliedDamage = applyBendingDamage(player, entity, strength, 0, bypass, setOnFire, false, ignoreReflect);
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

function minifiedTraceLine(entity, startPoint, endPoint, numOfPoints, particle) {
    for (let i = 1; i <= numOfPoints; i++) {
        const position = {x: ((startPoint.x - endPoint.x) / numOfPoints) * i + endPoint.x, y: ((startPoint.y - endPoint.y) / numOfPoints) * i + endPoint.y, z: ((startPoint.z - endPoint.z) / numOfPoints) * i + endPoint.z};
        try { entity.dimension.spawnParticle(particle, position); } catch (error) {};
    }
}

export const spawnTrail = (entity, time) => {
    let currentTick = 0;
    let lastEntityPos = entity.location;
    const sched_ID = system.runInterval(function tick() {
        if (currentTick > time) return system.clearRun(sched_ID);
        currentTick++;

        if (!entity.isValid()) return system.clearRun(sched_ID);

        const playerPos = entity.location;
        minifiedTraceLine(entity, lastEntityPos, playerPos, 3, "a:air_flutter")
        minifiedTraceLine(entity, lastEntityPos, playerPos, 10, "a:air_blast_tiny")
        lastEntityPos = playerPos;
    }, 1);
}

export const getNeighbors = (block) => {
    const neighbors = [];
    const directions = ['north', 'south', 'east', 'west', 'above', 'below'];

    for (const direction of directions) {
        const neighbor = block[direction]();
        if (neighbor) {
            neighbors.push(neighbor);
        }
    }

    return neighbors;
}

export const depthFirstSearch = (startBlock, blockset = conductiveBlocks) =>{
    const stack = [startBlock];
    const visited = new Set();
    const connectedBlocks = [];

    while (stack.length > 0) {
        if (connectedBlocks.length > 96) {
            break;
        }
        const currentBlock = stack.pop();
        const key = `${currentBlock.location.x},${currentBlock.location.y},${currentBlock.location.z}`;

        if (visited.has(key)) {
            continue;
        }

        visited.add(key);

        if (blockset.has(currentBlock.typeId)) {
            connectedBlocks.push(currentBlock);
            const neighbors = getNeighbors(currentBlock);
            for (const neighbor of neighbors) {
                stack.push(neighbor);
            }
        }
    }

    return connectedBlocks;
}

export const parseMenu = (source, menuData, returnFunc = ()=>{}, sidebar = false) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[source.id];
    PLAYER_DATA.inMenu = true;

	if (menuData.type === "modal") {
		const modalForm = new ModalFormData();
		modalForm.title({ rawtext: [
			{ text: '§m§f' },
			menuData.title,
		]});

		menuData.content.forEach(({ title, type, data, update }) => {
			switch (type) {
				case "toggle":
					modalForm.toggle({ rawtext: [
						title,
					]}, data.condition);
					break;
				case "slider":
					modalForm.slider({ rawtext: [
						title,
						{ text: `\n§7` },
						data.description,
						{ text: ` ` },
						data.valuePrefix
					]}, data.min, data.max, data.step, data.value);
					break;
				case "dropdown":
					modalForm.dropdown({ rawtext: [
						title,
					]}, data.options, data.selected);
					break;
			}
		});

		modalForm.show(source).then((modalFormResponse) => {
			const { formValues } = modalFormResponse;
			if (!formValues) {
                source.sendMessage({
                    rawtext: [
                        { text: '§c' },
                        { translate: "scroll.settings.quick.cancel" }
                    ]
                });
                PLAYER_DATA.inMenu = false;
                return returnFunc(source);
            }

            PLAYER_DATA.inMenu = false;
			menuData.content.forEach(({ title, type, data, update }, i) => {
				const value = formValues[i];
				update(value);
			});
		});
	} else if (menuData.type === "action") {
		const actionForm = new ActionFormData();
		actionForm.title({ rawtext: [
			{ text: '§d§f' },
			menuData.title,
		]});
		actionForm.body(menuData.body);

        if (sidebar) {
            actionForm.button('', 'textures/ui/night_fury/fire_blast');
            actionForm.button('', 'textures/ui/night_fury/fire_blast');
            actionForm.button('', 'textures/ui/night_fury/fire_blast');
            actionForm.button('', 'textures/ui/night_fury/fire_blast');
            actionForm.button('', 'textures/ui/night_fury/fire_blast');
            actionForm.button('§p', 'textures/ui/settings_glyph_color_2x');
        } else {
            actionForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/night_fury/fire_blast');
            for (let i = 0; i < 5; i++) actionForm.button('');
        }

		menuData.content.forEach(({ title, icon, action }) => {
			actionForm.button({ rawtext: [
				{ text: '§f' },
				title,
			]}, icon);
		});

		actionForm.show(source).then((actionFormResponse) => {
			const { selection } = actionFormResponse;
			if (selection === undefined) {
                source.sendMessage({
                    rawtext: [
                        { text: '§c' },
                        { translate: "scroll.admin.cancel" }
                    ]
                });
                PLAYER_DATA.inMenu = false;
                return returnFunc(source);
            }

            PLAYER_DATA.inMenu = false;
            if (!sidebar && selection === 0) {
                if (menuData.back) return menuData.back(source);
                return returnFunc(source);
            }

            if (sidebar) {
                const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, questsMenu, statsInfoMenu, chooseSettingsMenu];
                if (menuActions[selection]) return menuActions[selection](source);
            }

            if (!menuData.content[selection - 6]) return returnFunc(source);
			menuData.content[selection - 6].action();
		});
	}
}


export const updatePlayerMoveUsage = (player, move) => {
    const rawUsage = player.getDynamicProperty("moveUsage");
    const usageMap = rawUsage ? JSON.parse(rawUsage) : {};

    if (usageMap[move]) {
        usageMap[move]++;
    } else {
        usageMap[move] = 1;
    }

    player.setDynamicProperty("moveUsage", JSON.stringify(usageMap));
}

export const updateSubLevel = (player, chiCost) => {
    const rawSubLevel = player.getDynamicProperty("subLevel");
    const subLevel = rawSubLevel ? parseFloat(rawSubLevel) : 0;

    const chiCostFactor = chiCost / 100;
    const newSubLevel = subLevel + chiCostFactor;
    player.setDynamicProperty("subLevel", newSubLevel);

    levelUpCheck(player, newSubLevel);
}

const levelUpCheck = (player, subLevel) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const level = PLAYER_DATA.level;

    const levelFunction = 0.05 * Math.pow(level, 2) + 0.8 * level + 2 * 1/(0.01 + WORLD_SETTINGS.lvlspd * 10);

    if (level < 12) subLevel *= 6;

    if (subLevel > levelFunction) {
        PLAYER_DATA.level++;
        PLAYER_DATA.levelFactor = PLAYER_DATA.level / 100;
        player.setDynamicProperty("level", PLAYER_DATA.level);
        player.setDynamicProperty("subLevel", 0);

const allowedMoves = [];
const elements = PLAYER_DATA.elements;
let moveIndex = 0;
for (const element of elements) {
    if (element.type === 'night_fury' || element.type === 'dark_night_fury') continue;

    for (const move of element.moves) {
        moveIndex++;
        if ((moveIndex > level + 1) && !move.skill_required) continue;
        if (move.skill_required && !PLAYER_DATA.skills.includes(move.skill_required)) continue;

        allowedMoves.push(move);
    }
}



        PLAYER_DATA.dimension.spawnParticle(`a:level_up`, player.location);
        PLAYER_DATA.dimension.playSound("random.levelup", player.location, { pitch: 1, volume: 2 });

        player.addExperience(20);
        player.addLevels(1);

        if (allowedMoves.length <= level || allowedMoves[level].skill_required) {
            player.sendMessage({
                rawtext: [
                    { text: '§f---------------------\n§e' },
                    { translate: 'scroll.level_up', with: [`${PLAYER_DATA.level}`] },
                    { text: '\n§f---------------------' }
                ]
            });

            return;
        }

        player.sendMessage({
            rawtext: [
                { text: '§f---------------------\n§e' },
                { translate: 'scroll.level_up', with: [`${PLAYER_DATA.level}`] },
                { text: '\n\n §e' },
                allowedMoves[level].name,
                { text: ' §r\n- ' },
                allowedMoves[level].description,
                { text: '\n§f---------------------' }
            ]
        });
    }
};