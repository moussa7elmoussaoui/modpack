export default [
  {
    hurt: [
      {
        conditions: "damageSource.cause != 'drowning' && damageSource.cause != 'fire' && damageSource.cause != 'fireTick' && damageSource.cause != 'freezing'",
        sound: "game.player.hurt"
      },
      {
        conditions: "damageSource.cause == 'drowning'",
        sound: "mob.player.hurt_drown",
        pitch: 1.0
      },
      {
        conditions: "damageSource.cause == 'fire' || damageSource.cause == 'fireTick'",
        sound: "mob.player.hurt_on_fire",
        pitch: 1.0
      },
      {
        conditions: "damageSource.cause == 'freezing'",
        sound: "mob.player.hurt_freeze",
        pitch: 1.0
      }
    ],
    death: "game.player.die",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.zombie.hurt",
    death: "mob.zombie.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.cow.hurt",
    death: {
      sound: "mob.cow.hurt",
      volume: 0.50,
      pitch: 0.90
    },
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: {
      sound: "mob.skeleton.hurt",
      volume: 0.70
    },
    death: "mob.skeleton.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.chicken.hurt"
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_chicken.hurt",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    death: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.chicken.hurt",
        volume: 0.50,
        pitch: 0.90
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_chicken.death",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: "mob.creeper.say",
    death: "mob.creeper.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.sheep.say",
    death: "mob.sheep.say",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.spider.say",
    death: "mob.spider.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.pig.say"
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_pig.hurt",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    death: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.pig.death",
        volume: 0.50,
        pitch: 0.90
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_pig.death",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: "mob.endermen.hit",
    death: "mob.endermen.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.bat.hurt",
    death: "mob.bat.death",
    volume: 0.10,
    pitch: [ 0.76, 1.14 ]
  },
  {
    hurt: "mob.zombiepig.zpighurt",
    death: "mob.zombiepig.zpigdeath",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.fox.hurt",
    death: "mob.fox.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.drowned.hurt",
    death: "mob.drowned.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.villager.hit",
    death: "mob.villager.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "entity.wither_skeleton.hurt",
    death: "entity.wither_skeleton.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.snowgolem.hurt",
    death: "mob.snowgolem.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.blaze.hit",
    death: "mob.blaze.death",
    volume: 2.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.cat.hit",
        volume: 0.450
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_cat.hurt",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    death: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.cat.hit",
        volume: 0.50,
        pitch: 0.90
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_cat.death",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: "mob.husk.hurt",
    death: "mob.husk.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.wolf.hurt"
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_wolf.hurt"
      }
    ],
    death: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.wolf.death"
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_wolf.death",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: "mob.piglin.hurt",
    death: "mob.piglin.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.fish.hurt",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.irongolem.hit",
    death: "mob.irongolem.death",
    volume: 1.0,
    pitch: [ 0.80, 1.0 ]
  },
  {
    hurt: "mob.axolotl.hurt",
    death: "mob.axolotl.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.stray.hurt",
    death: "mob.stray.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: {
      sound: "mob.cat.hit",
      volume: 0.45
    },
    death: "mob.ocelot.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.vindicator.hurt",
    death: "mob.vindicator.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.fish.hurt",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.hoglin.hurt",
    death: "mob.hoglin.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.squid.hurt",
    death: "mob.squid.death",
    volume: 0.40,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.piglin_brute.hurt",
    death: "mob.piglin_brute.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.llama.hurt",
    death: "mob.llama.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.spider.say",
    death: "mob.spider.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.cow.hurt",
    death: "mob.cow.hurt",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.zombie_villager.hurt",
    death: "mob.zombie_villager.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "this.getComponent('minecraft:variant').value == 0",
        sound: "mob.goat.hurt"
      },
      {
        conditions: "this.getComponent('minecraft:variant').value == 1",
        sound: "mob.goat.hurt.screamer"
      }
    ],
    death: [
      {
        conditions: "this.getComponent('minecraft:variant').value == 0",
        sound: "mob.goat.death"
      },
      {
        conditions: "this.getComponent('minecraft:variant').value == 1",
        sound: "mob.goat.death.screamer"
      }
    ],
    volume: 1,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.wither.hurt",
    death: "mob.wither.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.dolphin.hurt",
    death: "mob.dolphin.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.zoglin.hurt",
    death: "mob.zoglin.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: {
      sound: "mob.bee.hurt",
      volume: 0.60,
      pitch: [ 0.90, 1.10 ]
    },
    death: {
      sound: "mob.bee.death",
      volume: 0.60,
      pitch: [ 0.90, 1.10 ]
    },
    volume: 0.60,
    pitch: 1.0
  },
  {
    hurt: "mob.pillager.hurt",
    death: "mob.pillager.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: {
      sound: "mob.parrot.hurt",
      volume: 1.0,
      pitch: [ 0.80, 1.0 ]
    },
    death: {
      sound: "mob.parrot.death",
      volume: 1.0,
      pitch: [ 0.80, 1.0 ]
    },
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.slime.small",
    death: "mob.slime.small",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.strider.hurt",
    death: "mob.strider.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.vex.hurt",
    death: "mob.vex.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.turtle.hurt"
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.turtle_baby.hurt"
      }
    ],
    death: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.turtle.death"
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.turtle_baby.death"
      }
    ],
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.witch.hurt",
    death: "mob.witch.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.rabbit.hurt",
    death: "mob.rabbit.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.ghast.scream",
    death: "mob.ghast.death",
    volume: 5.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.glow_squid.hurt",
    death: "mob.glow_squid.death",
    volume: 0.40,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.phantom.hurt",
    death: "mob.phantom.death",
    volume: 10.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: {
      sound: "mob.polarbear.hurt",
      volume: 0.70
    },
    death: "mob.polarbear.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.magmacube.small",
    death: "mob.magmacube.small",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.allay.hurt",
    death: "mob.allay.death",
    volume: 1,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.ravager.hurt",
    death: "mob.ravager.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.frog.hurt",
    death: "mob.frog.death",
    volume: 1,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.evocation_illager.hurt",
    death: "mob.evocation_illager.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.tadpole.hurt",
    death: "mob.tadpole.death",
    volume: 1,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.endermite.hit",
    death: "mob.endermite.kill",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.wanderingtrader.hurt",
    death: "mob.wanderingtrader.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.silverfish.hit",
    death: "mob.silverfish.kill",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.llama.hurt",
    death: "mob.llama.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.isInWater",
        sound: "mob.guardian.land_hit"
      },
      {
        conditions: "this.isInWater",
        sound: "mob.guardian.hit"
      }
    ],
    death: [
      {
        conditions: "!this.isInWater",
        sound: "mob.guardian.land_death"
      },
      {
        conditions: "this.isInWater",
        sound: "mob.guardian.death"
      }
    ],
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.panda.hurt",
    death: "mob.panda.death",
    volume: 0.820,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.isInWater",
        sound: "mob.guardian.land_hit"
      },
      {
        conditions: "this.isInWater",
        sound: "mob.elderguardian.hit"
      }
    ],
    death: "mob.elderguardian.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.fish.hurt",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.shulker.hurt",
    death: "mob.shulker.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.sniffer.hurt",
    death: "mob.sniffer.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.warden.hurt",
    death: "mob.warden.death",
    volume: 1.0,
    pitch: [ 0.80, 1.0 ]
  },
  {
    hurt: "mob.fish.hurt",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.horse.hit",
        volume: 0.450
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_horse.hurt",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    death: [
      {
        conditions: "!this.hasComponent('minecraft:is_baby')",
        sound: "mob.horse.death",
        volume: 0.50,
        pitch: 0.90
      },
      {
        conditions: "this.hasComponent('minecraft:is_baby')",
        sound: "mob.baby_horse.death",
        volume: 1.0,
        pitch: 0.50
      }
    ],
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: "mob.horse.donkey.hit",
    death: "mob.horse.donkey.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.horse.donkey.hit",
    death: "mob.horse.donkey.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.horse.skeleton.hit",
    death: "mob.horse.skeleton.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.horse.zombie.hit",
    death: "mob.horse.zombie.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.camel.hurt",
    death: "mob.camel.death",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: "mob.enderdragon.hit",
    death: "mob.enderdragon.death",
    volume: 80.0,
    pitch: [ 0.80, 1.20 ]
  },
  {
    hurt: [
      {
        conditions: "this.getProperty('minecraft:armadillo_state') == 'unrolled'",
        sound: "mob.armadillo.hurt"
      },
      {
        conditions: "this.getProperty('minecraft:armadillo_state') == 'rolled_up'",
        sound: "mob.armadillo.hurt_reduced"
      }
    ],
    death: "mob.armadillo.death",
    volume: 1.0,
    pitch: [ 0.8, 1.2 ]
  },
  {
    hurt: "mob.bogged.hurt",
    death: "mob.bogged.death",
    volume: 1.0,
    pitch: [ 0.8, 1.2 ]
  },
  {
    hurt: "mob.breeze.hurt",
    death: "mob.breeze.death",
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: {
      sound: "mob.polarbear.hurt",
      volume: 0.50
    },
    death: "mob.polarbear.death",
    volume: 0.80,
    pitch: [ 0.80, 1.20 ]
  },
  {
    death: "",
    volume: 1.0,
    pitch: 1.0
  },
  {
    hurt: [
      {
        conditions: "damageSource.cause != 'drowning' && damageSource.cause != 'fire' && damageSource.cause != 'fireTick' && damageSource.cause != 'freezing'",
        sound: "game.player.hurt"
      },
      {
        conditions: "damageSource.cause == 'drowning'",
        sound: "mob.player.hurt_drown",
        pitch: 1.0
      },
      {
        conditions: "damageSource.cause == 'fire' || damageSource.cause == 'fireTick'",
        sound: "mob.player.hurt_on_fire",
        pitch: 1.0
      },
      {
        conditions: "damageSource.cause == 'freezing'",
        sound: "mob.player.hurt_freeze",
        pitch: 1.0
      }
    ],
    death: "game.player.die",
    volume: 1.0,
    pitch: [ 0.80, 1.20 ]
  }
];