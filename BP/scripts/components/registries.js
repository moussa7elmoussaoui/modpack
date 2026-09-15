import convertBlock from "./blocks/convert-block";
import creakingHeart from "./blocks/creaking-heart";
import durabilityDamageOnHit from "./items/durability-damage-on-hit";
import effectNearbyPlayers from "./items/effect-nearby-players";
import infiniteProjectile from "./items/infinite-projectile";
import omnitrix from "./items/omnitrix";
import morphStorage from "./items/morph-storage";
import nightFuryFireBlast from "./items/night-fury-fire-blast";
import sonicBoom from "./items/sonic-boom";
import summonFangsOnUse from "./items/summon-fangs-on-use";
import teleportOnUse from "./items/teleport-on-use";

export default {
  blocks: [ convertBlock, creakingHeart ],
  items: [
    durabilityDamageOnHit,
    effectNearbyPlayers,
    infiniteProjectile,
    nightFuryFireBlast,
    omnitrix,
    morphStorage,
    sonicBoom,
    summonFangsOnUse,
    teleportOnUse
  ]
};
