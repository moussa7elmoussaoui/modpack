import creakingHeart from "./blocks/creaking-heart";
import effectNearbyPlayers from "./items/effect-nearby-players";
import infiniteProjectile from "./items/infinite-projectile";
import morphMenu from "./items/morph-menu";
import omnitrix from "./items/omnitrix";
import morphStorage from "./items/morph-storage";
import singleMorphStorage from "./items/single-morph-storage";
import nightFuryFireBlast from "./items/night-fury-fire-blast";
import sonicBoom from "./items/sonic-boom";
import summonFangsOnUse from "./items/summon-fangs-on-use";
import teleportOnUse from "./items/teleport-on-use";

export default {
  blocks: [ creakingHeart ],
  items: [
    effectNearbyPlayers,
    infiniteProjectile,
    morphMenu,
    nightFuryFireBlast,
    omnitrix,
    morphStorage,
    singleMorphStorage,
    sonicBoom,
    summonFangsOnUse,
    teleportOnUse
  ]
};
