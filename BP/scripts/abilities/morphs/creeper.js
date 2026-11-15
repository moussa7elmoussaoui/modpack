import { EntityDamageCause, system, world } from "@minecraft/server";
import { morphEntityTypes } from "../../data/morphs";
import { morphEvents } from "../../morph/events";

const ENTITY_TYPE = "minecraft:creeper";
const FUSE_DURATION = 30;
const fuseData = new Map();

function isCreeper(player) {
  return morphEntityTypes[player.getProperty("dark7mc:entity")] === ENTITY_TYPE;
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (!player.isValid || !isCreeper(player)) continue;
    const duration = fuseData.get(player.id) ?? 0;

    if (!player.isSneaking) {
      fuseData.set(player.id, Math.max(0, Math.abs(duration) - 1));
    } else if (duration < 0) {
      fuseData.set(player.id, Math.min(-1, duration + 1));
    } else if (duration < FUSE_DURATION) {
      fuseData.set(player.id, duration + 1);
      if (duration === 0) player.dimension.playSound("random.fuse", player.location, { pitch: 0.5 });
    } else {
      fuseData.set(player.id, -duration);
      player.dimension.createExplosion(player.location, player.hasComponent("minecraft:is_charged") ? 6 : 3, {
        breaksBlocks: world.gameRules.mobGriefing,
        source: player
      });
      player.addEffect("invisibility", 20, { showParticles: false });
      system.run(() => {
        if (player.isValid && isCreeper(player) && (player.getComponent("minecraft:health")?.currentValue ?? 0) > 0) {
          player.applyDamage(Number.MAX_SAFE_INTEGER, { cause: EntityDamageCause.entityExplosion });
        }
      });
    }
  }
}, 1);

morphEvents.afterMorph.subscribe(({ player }) => fuseData.delete(player.id));
world.afterEvents.playerLeave.subscribe(({ playerId }) => fuseData.delete(playerId));
world.afterEvents.entityDie.subscribe(({ deadEntity }) => fuseData.delete(deadEntity.id));
