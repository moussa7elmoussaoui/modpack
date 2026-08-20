import convertBlock from "./blocks/convert-block";
import creakingHeart from "./blocks/creaking-heart";
import durabilityDamageOnHit from "./items/durability-damage-on-hit";
import effectNearbyPlayers from "./items/effect-nearby-players";
import infiniteProjectile from "./items/infinite-projectile";
import morphingBracelet from "./items/morphing-bracelet";
import morphStorage from "./items/morph-storage";
import sonicBoom from "./items/sonic-boom";
import summonFangsOnUse from "./items/summon-fangs-on-use";
import teleportOnUse from "./items/teleport-on-use";

export default {
  blocks: [ convertBlock, creakingHeart ],
  items: [
    durabilityDamageOnHit,
    effectNearbyPlayers,
    infiniteProjectile,
    morphingBracelet,
    morphStorage,
    sonicBoom,
    summonFangsOnUse,
    teleportOnUse
  ]
};
