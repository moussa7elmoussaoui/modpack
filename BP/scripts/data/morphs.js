// The order of the mobs in the object determines the numerical value of the 'morphing_bracelet:entity' property.

const morphs = {
  "minecraft:player": {},
  "minecraft:zombie": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:cow": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      climate: [
        { value: "temperate", condition: { property: "minecraft:climate_variant", method: "get", value: "temperate" } },
        { value: "warm", condition: { property: "minecraft:climate_variant", method: "get", value: "warm" } },
        { value: "cold", condition: { property: "minecraft:climate_variant", method: "get", value: "cold" } }
      ]
    }
  },
  "minecraft:skeleton": {
    items: [{ id: "minecraft:bow" }]
  },
  "minecraft:chicken": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      climate: [
        { value: "temperate", condition: { property: "minecraft:climate_variant", method: "get", value: "temperate" } },
        { value: "warm", condition: { property: "minecraft:climate_variant", method: "get", value: "warm" } },
        { value: "cold", condition: { property: "minecraft:climate_variant", method: "get", value: "cold" } }
      ]
    }
  },
  "minecraft:creeper": {
    properties: {
      charged: [
        { value: "false", condition: { component: "minecraft:is_charged", method: "has", operator: "!=" } },
        { value: "true", condition: { component: "minecraft:is_charged", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:sheep": {
    properties: {
      age: [
        {
          value: "wooly_adult",
          condition: {
            and: [
              { component: "minecraft:is_baby", method: "has", operator: "!=" },
              { component: "minecraft:is_sheared", method: "has", operator: "!=" }
            ]
          }
        },
        {
          value: "sheared_adult",
          condition: {
            and: [
              { component: "minecraft:is_baby", method: "has", operator: "!=" },
              { component: "minecraft:is_sheared", method: "has", operator: "==" }
            ]
          }
        },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      color: [
        {
          value: "white",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 0 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                {
                  or: [
                    { component: "minecraft:color", method: "has", operator: "!=" },
                    { component: "minecraft:color", method: "get", value: 0 }
                  ]
                }
              ]
            }
          }
        },
        {
          value: "orange",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 1 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 1 }
              ]
            }
          }
        },
        {
          value: "magenta",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 2 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 2 }
              ]
            }
          }
        },
        {
          value: "light_blue",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 3 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 3 }
              ]
            }
          }
        },
        {
          value: "yellow",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 4 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 4 }
              ]
            }
          }
        },
        {
          value: "lime",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 5 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 5 }
              ]
            }
          }
        },
        {
          value: "pink",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 6 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 6 }
              ]
            }
          }
        },
        {
          value: "gray",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 7 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 7 }
              ]
            }
          }
        },
        {
          value: "light_gray",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 8 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 8 }
              ]
            }
          }
        },
        {
          value: "cyan",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 9 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 9 }
              ]
            }
          }
        },
        {
          value: "purple",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 10 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 10 }
              ]
            }
          }
        },
        {
          value: "blue",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 11 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 11 }
              ]
            }
          }
        },
        {
          value: "brown",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 12 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 12 }
              ]
            }
          }
        },
        {
          value: "green",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 13 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 13 }
              ]
            }
          }
        },
        {
          value: "red",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 14 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 14 }
              ]
            }
          }
        },
        {
          value: "black",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 15 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "jeb_", operator: "!=" },
                { component: "minecraft:color", method: "get", value: 15 }
              ]
            }
          }
        },
        {
          value: "jeb_",
          condition: {
            isPlayer: { component: "minecraft:variant", method: "get", value: 1 },
            isMob: { nameTag: "jeb_", operator: "==" }
          }
        }
      ]
    }
  },
  "minecraft:spider": {},
  "minecraft:pig": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      climate: [
        { value: "temperate", condition: { property: "minecraft:climate_variant", method: "get", value: "temperate" } },
        { value: "warm", condition: { property: "minecraft:climate_variant", method: "get", value: "warm" } },
        { value: "cold", condition: { property: "minecraft:climate_variant", method: "get", value: "cold" } }
      ]
    }
  },
  "minecraft:enderman": {
    items: [{ id: "morphing_bracelet:teleporter" }]
  },
  "minecraft:bat": {},
  "minecraft:zombie_pigman": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    },
    items: [{ id: "minecraft:golden_sword" }]
  },
  "minecraft:fox": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      variant: [
        {
          value: "red",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "arctic", condition: { component: "minecraft:variant", method: "get", value: 1 } }
      ]
    }
  },
  "minecraft:drowned": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:villager_v2": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      biome: [
        {
          value: "plains",
          condition: {
            or: [
              { component: "minecraft:mark_variant", method: "has", operator: "!=" },
              { component: "minecraft:mark_variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "desert", condition: { component: "minecraft:mark_variant", method: "get", value: 1 } },
        { value: "jungle", condition: { component: "minecraft:mark_variant", method: "get", value: 2 } },
        { value: "savanna", condition: { component: "minecraft:mark_variant", method: "get", value: 3 } },
        { value: "snow", condition: { component: "minecraft:mark_variant", method: "get", value: 4 } },
        { value: "swamp", condition: { component: "minecraft:mark_variant", method: "get", value: 5 } },
        { value: "taiga", condition: { component: "minecraft:mark_variant", method: "get", value: 6 } }
      ]
    }
  },
  "minecraft:wither_skeleton": {
    items: [{ id: "minecraft:stone_sword" }]
  },
  "minecraft:snow_golem": {
    properties: {
      sheared: [
        { value: "false", condition: { component: "minecraft:is_sheared", method: "has", operator: "!=" } },
        { value: "true", condition: { component: "minecraft:is_sheared", method: "has", operator: "==" } }
      ]
    },
    items: [{ id: "morphing_bracelet:snowball" }]
  },
  "minecraft:blaze": {
    items: [{ id: "morphing_bracelet:small_fireball" }]
  },
  "minecraft:cat": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      tame: [
        { value: "false", condition: { component: "minecraft:is_tamed", method: "has", operator: "!=" } },
        { value: "true", condition: { component: "minecraft:is_tamed", method: "has", operator: "==" } }
      ],
      breed: [
        {
          value: "white",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "tuxedo", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "red", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "siamese", condition: { component: "minecraft:variant", method: "get", value: 3 } },
        { value: "british", condition: { component: "minecraft:variant", method: "get", value: 4 } },
        { value: "calico", condition: { component: "minecraft:variant", method: "get", value: 5 } },
        { value: "persian", condition: { component: "minecraft:variant", method: "get", value: 6 } },
        { value: "ragdoll", condition: { component: "minecraft:variant", method: "get", value: 7 } },
        { value: "tabby", condition: { component: "minecraft:variant", method: "get", value: 8 } },
        { value: "black", condition: { component: "minecraft:variant", method: "get", value: 9 } },
        { value: "jellie", condition: { component: "minecraft:variant", method: "get", value: 10 } }
      ]
    }
  },
  "minecraft:husk": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:wolf": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      tame: [
        { value: "false", condition: { component: "minecraft:is_tamed", method: "has", operator: "!=" } },
        { value: "true", condition: { component: "minecraft:is_tamed", method: "has", operator: "==" } }
      ],
      breed: [
        {
          value: "pale",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "ashen", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "black", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "chestnut", condition: { component: "minecraft:variant", method: "get", value: 3 } },
        { value: "rusty", condition: { component: "minecraft:variant", method: "get", value: 4 } },
        { value: "snowy", condition: { component: "minecraft:variant", method: "get", value: 5 } },
        { value: "spotted", condition: { component: "minecraft:variant", method: "get", value: 6 } },
        { value: "striped", condition: { component: "minecraft:variant", method: "get", value: 7 } },
        { value: "woods", condition: { component: "minecraft:variant", method: "get", value: 8 } }
      ]
    }
  },
  "minecraft:piglin": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    },
    items: [
      { id: "minecraft:golden_sword", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } }
    ]
  },
  "minecraft:salmon": {
    properties: {
      size: [
        {
          value: "medium",
          condition: {
            or: [
              { component: "minecraft:scale", method: "has", operator: "!=" },
              { component: "minecraft:scale", method: "get", value: 1.0 }
            ]
          }
        },
        { value: "small", condition: { component: "minecraft:scale", method: "get", value: 0.5 } },
        { value: "large", condition: { component: "minecraft:scale", method: "get", value: 1.5 } }
      ]
    }
  },
  "minecraft:iron_golem": {},
  "minecraft:axolotl": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      variant: [
        {
          value: "lucy",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "cyan", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "gold", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "wild", condition: { component: "minecraft:variant", method: "get", value: 3 } },
        { value: "blue", condition: { component: "minecraft:variant", method: "get", value: 4 } }
      ]
    }
  },
  "minecraft:stray": {
    items: [{ id: "minecraft:bow" }]
  },
  "minecraft:ocelot": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:vindicator": {
    items: [{ id: "minecraft:iron_axe" }]
  },
  "minecraft:cod": {},
  "minecraft:hoglin": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:squid": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:piglin_brute": {
    items: [{ id: "minecraft:golden_axe" }]
  },
  "minecraft:llama": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      breed: [
        {
          value: "creamy",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "white", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "brown", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "gray", condition: { component: "minecraft:variant", method: "get", value: 3 } }
      ]
    },
    items: [{ id: "morphing_bracelet:llama_spit" }]
  },
  "minecraft:cave_spider": {},
  "minecraft:mooshroom": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      mushroom: [
        {
          value: "red",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "brown", condition: { component: "minecraft:variant", method: "get", value: 1 } }
      ]
    }
  },
  "minecraft:zombie_villager_v2": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      biome: [
        {
          value: "plains",
          condition: {
            or: [
              { component: "minecraft:mark_variant", method: "has", operator: "!=" },
              { component: "minecraft:mark_variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "desert", condition: { component: "minecraft:mark_variant", method: "get", value: 1 } },
        { value: "jungle", condition: { component: "minecraft:mark_variant", method: "get", value: 2 } },
        { value: "savanna", condition: { component: "minecraft:mark_variant", method: "get", value: 3 } },
        { value: "snow", condition: { component: "minecraft:mark_variant", method: "get", value: 4 } },
        { value: "swamp", condition: { component: "minecraft:mark_variant", method: "get", value: 5 } },
        { value: "taiga", condition: { component: "minecraft:mark_variant", method: "get", value: 6 } }
      ]
    }
  },
  "minecraft:goat": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      variant: [
        {
          value: "normal",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "screamer", condition: { component: "minecraft:variant", method: "get", value: 1 } }
      ]
    }
  },
  "minecraft:wither": {
    items: [
      { id: "morphing_bracelet:wither_skull" },
      { id: "morphing_bracelet:blue_wither_skull" }
    ]
  },
  "minecraft:dolphin": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:zoglin": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:bee": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:pillager": {
    items: [{ id: "minecraft:crossbow" }]
  },
  "minecraft:parrot": {
    properties: {
      breed: [
        {
          value: "red",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "blue", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "green", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "cyan", condition: { component: "minecraft:variant", method: "get", value: 3 } },
        { value: "silver", condition: { component: "minecraft:variant", method: "get", value: 4 } }
      ]
    }
  },
  "minecraft:slime": {
    properties: {
      size: [
        {
          value: "small",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 1 }
            ]
          }
        },
        { value: "medium", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "large", condition: { component: "minecraft:variant", method: "get", value: 4 } }
      ]
    }
  },
  "minecraft:strider": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:vex": {
    items: [{ id: "minecraft:iron_sword" }]
  },
  "minecraft:turtle": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:witch": {},
  "minecraft:rabbit": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      breed: [
        {
          value: "brown",
          condition: {
            isPlayer: {
              or: [
                { component: "minecraft:variant", method: "has", operator: "!=" },
                { component: "minecraft:variant", method: "get", value: 0 }
              ]
            },
            isMob: {
              and: [
                { nameTag: "Toast", operator: "!=" },
                {
                  or: [
                    { component: "minecraft:variant", method: "has", operator: "!=" },
                    { component: "minecraft:variant", method: "get", value: 0 }
                  ]
                }
              ]
            }
          }
        },
        {
          value: "white",
          condition: {
            isPlayer: { component: "minecraft:variant", method: "get", value: 1 },
            isMob: {
              and: [
                { nameTag: "Toast", operator: "!=" },
                { component: "minecraft:variant", method: "get", value: 1 }
              ]
            }
          }
        },
        {
          value: "black",
          condition: {
            isPlayer: { component: "minecraft:variant", method: "get", value: 2 },
            isMob: {
              and: [
                { nameTag: "Toast", operator: "!=" },
                { component: "minecraft:variant", method: "get", value: 2 }
              ]
            }
          }
        },
        {
          value: "splotched",
          condition: {
            isPlayer: { component: "minecraft:variant", method: "get", value: 3 },
            isMob: {
              and: [
                { nameTag: "Toast", operator: "!=" },
                { component: "minecraft:variant", method: "get", value: 3 }
              ]
            }
          }
        },
        {
          value: "desert",
          condition: {
            isPlayer: { component: "minecraft:variant", method: "get", value: 4 },
            isMob: {
              and: [
                { nameTag: "Toast", operator: "!=" },
                { component: "minecraft:variant", method: "get", value: 4 }
              ]
            }
          }
        },
        {
          value: "salt",
          condition: {
            isPlayer: { component: "minecraft:variant", method: "get", value: 5 },
            isMob: {
              and: [
                { nameTag: "Toast", operator: "!=" },
                { component: "minecraft:variant", method: "get", value: 5 }
              ]
            }
          }
        },
        {
          value: "toast",
          condition: {
            isPlayer: { component: "minecraft:variant", method: "get", value: 6 },
            isMob: { nameTag: "Toast", operator: "==" }
          }
        }
      ]
    }
  },
  "minecraft:ghast": {
    items: [{ id: "morphing_bracelet:fireball" }]
  },
  "minecraft:glow_squid": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:phantom": {},
  "minecraft:polar_bear": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:magma_cube": {
    properties: {
      size: [
        {
          value: "small",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 1 }
            ]
          }
        },
        { value: "medium", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "large", condition: { component: "minecraft:variant", method: "get", value: 4 } }
      ]
    }
  },
  "minecraft:allay": {},
  "minecraft:ravager": {},
  "minecraft:frog": {
    properties: {
      climate: [
        {
          value: "temperate",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "cold", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "warm", condition: { component: "minecraft:variant", method: "get", value: 2 } }
      ]
    }
  },
  "minecraft:evocation_illager": {
    items: [{ id: "morphing_bracelet:evoker_fangs" }]
  },
  "minecraft:tadpole": {},
  "minecraft:endermite": {},
  "minecraft:wandering_trader": {},
  "minecraft:silverfish": {},
  "minecraft:trader_llama": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      breed: [
        {
          value: "creamy",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "white", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "brown", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "gray", condition: { component: "minecraft:variant", method: "get", value: 3 } }
      ]
    },
    items: [{ id: "morphing_bracelet:llama_spit" }]
  },
  "minecraft:guardian": {},
  "minecraft:panda": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      personality: [
        {
          value: "normal",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "lazy", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "worried", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "playful", condition: { component: "minecraft:variant", method: "get", value: 3 } },
        { value: "brown", condition: { component: "minecraft:variant", method: "get", value: 4 } },
        { value: "weak", condition: { component: "minecraft:variant", method: "get", value: 5 } },
        { value: "aggressive", condition: { component: "minecraft:variant", method: "get", value: 6 } }
      ]
    }
  },
  "minecraft:elder_guardian": {
    items: [{ id: "morphing_bracelet:guardian_curse" }]
  },
  "minecraft:tropicalfish": {
    properties: {
      species: [
        {
          value: "anemone",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { property: "morphing_bracelet:color", method: "get", value: 1 },
                { property: "morphing_bracelet:color2", method: "get", value: 7 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { component: "minecraft:color", method: "get", value: 1 },
                { component: "minecraft:color2", method: "get", value: 7 }
              ]
            }
          }
        },
        {
          value: "black_tang",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 7 },
                { property: "morphing_bracelet:color2", method: "get", value: 7 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 0 },
                { component: "minecraft:color", method: "get", value: 7 },
                { component: "minecraft:color2", method: "get", value: 7 }
              ]
            }
          }
        },
        {
          value: "blue_dory",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { property: "morphing_bracelet:color", method: "get", value: 7 },
                { property: "morphing_bracelet:color2", method: "get", value: 3 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { component: "minecraft:color", method: "get", value: 7 },
                { component: "minecraft:color2", method: "get", value: 3 }
              ]
            }
          }
        },
        {
          value: "butterfly_fish",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 4 },
                { property: "morphing_bracelet:color", method: "get", value: 0 },
                { property: "morphing_bracelet:color2", method: "get", value: 7 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 4 },
                { component: "minecraft:color", method: "get", value: 0 },
                { component: "minecraft:color2", method: "get", value: 7 }
              ]
            }
          }
        },
        {
          value: "cichlid",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { property: "morphing_bracelet:color", method: "get", value: 11 },
                { property: "morphing_bracelet:color2", method: "get", value: 7 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { component: "minecraft:color", method: "get", value: 11 },
                { component: "minecraft:color2", method: "get", value: 7 }
              ]
            }
          }
        },
        {
          value: "clownfish",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 1 },
                { property: "morphing_bracelet:color2", method: "get", value: 0 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 0 },
                { component: "minecraft:color", method: "get", value: 1 },
                { component: "minecraft:color2", method: "get", value: 0 }
              ]
            }
          }
        },
        {
          value: "cotton_candy_betta",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { property: "morphing_bracelet:color", method: "get", value: 6 },
                { property: "morphing_bracelet:color2", method: "get", value: 3 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { component: "minecraft:color", method: "get", value: 6 },
                { component: "minecraft:color2", method: "get", value: 3 }
              ]
            }
          }
        },
        {
          value: "dottyback",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { property: "morphing_bracelet:color", method: "get", value: 10 },
                { property: "morphing_bracelet:color2", method: "get", value: 4 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { component: "minecraft:color", method: "get", value: 10 },
                { component: "minecraft:color2", method: "get", value: 4 }
              ]
            }
          }
        },
        {
          value: "emperor_red_snapper",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { property: "morphing_bracelet:color", method: "get", value: 0 },
                { property: "morphing_bracelet:color2", method: "get", value: 14 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { component: "minecraft:color", method: "get", value: 0 },
                { component: "minecraft:color2", method: "get", value: 14 }
              ]
            }
          }
        },
        {
          value: "goatfish",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { property: "morphing_bracelet:color", method: "get", value: 0 },
                { property: "morphing_bracelet:color2", method: "get", value: 4 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { component: "minecraft:color", method: "get", value: 0 },
                { component: "minecraft:color2", method: "get", value: 4 }
              ]
            }
          }
        },
        {
          value: "moorish_idol",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 2 },
                { property: "morphing_bracelet:color", method: "get", value: 0 },
                { property: "morphing_bracelet:color2", method: "get", value: 7 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 2 },
                { component: "minecraft:color", method: "get", value: 0 },
                { component: "minecraft:color2", method: "get", value: 7 }
              ]
            }
          }
        },
        {
          value: "ornate_butterfly",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { property: "morphing_bracelet:color", method: "get", value: 0 },
                { property: "morphing_bracelet:color2", method: "get", value: 1 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 5 },
                { component: "minecraft:color", method: "get", value: 0 },
                { component: "minecraft:color2", method: "get", value: 1 }
              ]
            }
          }
        },
        {
          value: "parrotfish",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { property: "morphing_bracelet:color", method: "get", value: 9 },
                { property: "morphing_bracelet:color2", method: "get", value: 6 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { component: "minecraft:color", method: "get", value: 9 },
                { component: "minecraft:color2", method: "get", value: 6 }
              ]
            }
          }
        },
        {
          value: "queen_angel_fish",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 4 },
                { property: "morphing_bracelet:color", method: "get", value: 5 },
                { property: "morphing_bracelet:color2", method: "get", value: 3 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 4 },
                { component: "minecraft:color", method: "get", value: 5 },
                { component: "minecraft:color2", method: "get", value: 3 }
              ]
            }
          }
        },
        {
          value: "red_cichlid",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 4 },
                { property: "morphing_bracelet:color", method: "get", value: 14 },
                { property: "morphing_bracelet:color2", method: "get", value: 0 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 4 },
                { component: "minecraft:color", method: "get", value: 14 },
                { component: "minecraft:color2", method: "get", value: 0 }
              ]
            }
          }
        },
        {
          value: "red_lipped_blenny",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 2 },
                { property: "morphing_bracelet:color", method: "get", value: 7 },
                { property: "morphing_bracelet:color2", method: "get", value: 14 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 2 },
                { component: "minecraft:color", method: "get", value: 7 },
                { component: "minecraft:color2", method: "get", value: 14 }
              ]
            }
          }
        },
        {
          value: "red_snapper",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { property: "morphing_bracelet:color", method: "get", value: 14 },
                { property: "morphing_bracelet:color2", method: "get", value: 0 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { component: "minecraft:color", method: "get", value: 14 },
                { component: "minecraft:color2", method: "get", value: 0 }
              ]
            }
          }
        },
        {
          value: "threadfin",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 0 },
                { property: "morphing_bracelet:color", method: "get", value: 0 },
                { property: "morphing_bracelet:color2", method: "get", value: 4 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 0 },
                { component: "minecraft:color", method: "get", value: 0 },
                { component: "minecraft:color2", method: "get", value: 4 }
              ]
            }
          }
        },
        {
          value: "tomato_clown",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { property: "morphing_bracelet:color", method: "get", value: 14 },
                { property: "morphing_bracelet:color2", method: "get", value: 0 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { component: "minecraft:color", method: "get", value: 14 },
                { component: "minecraft:color2", method: "get", value: 0 }
              ]
            }
          }
        },
        {
          value: "triggerfish",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { property: "morphing_bracelet:color", method: "get", value: 7 },
                { property: "morphing_bracelet:color2", method: "get", value: 0 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { component: "minecraft:color", method: "get", value: 7 },
                { component: "minecraft:color2", method: "get", value: 0 }
              ]
            }
          }
        },
        {
          value: "yellow_tang",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { property: "morphing_bracelet:color", method: "get", value: 4 },
                { property: "morphing_bracelet:color2", method: "get", value: 4 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 1 },
                { component: "minecraft:mark_variant", method: "get", value: 1 },
                { component: "minecraft:color", method: "get", value: 4 },
                { component: "minecraft:color2", method: "get", value: 4 }
              ]
            }
          }
        },
        {
          value: "yellowtail_parrot",
          condition: {
            isPlayer: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { property: "morphing_bracelet:color", method: "get", value: 9 },
                { property: "morphing_bracelet:color2", method: "get", value: 4 }
              ]
            },
            isMob: {
              and: [
                { component: "minecraft:variant", method: "get", value: 0 },
                { component: "minecraft:mark_variant", method: "get", value: 3 },
                { component: "minecraft:color", method: "get", value: 9 },
                { component: "minecraft:color2", method: "get", value: 4 }
              ]
            }
          }
        }
      ]
    }
  },
  "minecraft:shulker": {
    properties: {
      color: [
        {
          value: "black",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "red", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "green", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "brown", condition: { component: "minecraft:variant", method: "get", value: 3 } },
        { value: "blue", condition: { component: "minecraft:variant", method: "get", value: 4 } },
        { value: "purple", condition: { component: "minecraft:variant", method: "get", value: 5 } },
        { value: "cyan", condition: { component: "minecraft:variant", method: "get", value: 6 } },
        { value: "light_gray", condition: { component: "minecraft:variant", method: "get", value: 7 } },
        { value: "gray", condition: { component: "minecraft:variant", method: "get", value: 8 } },
        { value: "pink", condition: { component: "minecraft:variant", method: "get", value: 9 } },
        { value: "lime", condition: { component: "minecraft:variant", method: "get", value: 10 } },
        { value: "yellow", condition: { component: "minecraft:variant", method: "get", value: 11 } },
        { value: "light_blue", condition: { component: "minecraft:variant", method: "get", value: 12 } },
        { value: "magenta", condition: { component: "minecraft:variant", method: "get", value: 13 } },
        { value: "orange", condition: { component: "minecraft:variant", method: "get", value: 14 } },
        { value: "white", condition: { component: "minecraft:variant", method: "get", value: 15 } },
        { value: "default", condition: { component: "minecraft:variant", method: "get", value: 16 } }
      ]
    }
  },
  "minecraft:sniffer": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:warden": {
    items: [{ id: "morphing_bracelet:sonic_boom" }]
  },
  "minecraft:pufferfish": {},
  "minecraft:horse": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ],
      base: [
        {
          value: "white",
          condition: {
            or: [
              { component: "minecraft:variant", method: "has", operator: "!=" },
              { component: "minecraft:variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "creamy", condition: { component: "minecraft:variant", method: "get", value: 1 } },
        { value: "chestnut", condition: { component: "minecraft:variant", method: "get", value: 2 } },
        { value: "brown", condition: { component: "minecraft:variant", method: "get", value: 3 } },
        { value: "black", condition: { component: "minecraft:variant", method: "get", value: 4 } },
        { value: "gray", condition: { component: "minecraft:variant", method: "get", value: 5 } },
        { value: "dark_brown", condition: { component: "minecraft:variant", method: "get", value: 6 } }
      ],
      markings: [
        {
          value: "none",
          condition: {
            or: [
              { component: "minecraft:mark_variant", method: "has", operator: "!=" },
              { component: "minecraft:mark_variant", method: "get", value: 0 }
            ]
          }
        },
        { value: "white_details", condition: { component: "minecraft:mark_variant", method: "get", value: 1 } },
        { value: "white_fields", condition: { component: "minecraft:mark_variant", method: "get", value: 2 } },
        { value: "white_dots", condition: { component: "minecraft:mark_variant", method: "get", value: 3 } },
        { value: "black_dots", condition: { component: "minecraft:mark_variant", method: "get", value: 4 } }
      ]
    }
  },
  "minecraft:donkey": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:mule": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:skeleton_horse": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:zombie_horse": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:camel": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:ender_dragon": {
    items: [{ id: "morphing_bracelet:dragon_fireball" }]
  },
  "minecraft:armadillo": {
    properties: {
      age: [
        { value: "adult", condition: { component: "minecraft:is_baby", method: "has", operator: "!=" } },
        { value: "baby", condition: { component: "minecraft:is_baby", method: "has", operator: "==" } }
      ]
    }
  },
  "minecraft:bogged": {
    properties: {
      sheared: [
        { value: "false", condition: { component: "minecraft:is_sheared", method: "has", operator: "!=" } },
        { value: "true", condition: { component: "minecraft:is_sheared", method: "has", operator: "==" } }
      ]
    },
    items: [{ id: "minecraft:bow" }]
  },
  "minecraft:breeze": {
    items: [{ id: "morphing_bracelet:wind_charge" }]
  },
  "minecraft:night_fury": {
    items: [{ id: "morphing_bracelet:night_fury_fireball" }]
  }
};

export default morphs;
export const morphEntityTypes = Object.keys(morphs);
export const allMorphIds = Object.entries(morphs).flatMap(([entityType, { properties = {} }]) => 
  Object.entries(properties)
    .reduce((accumulatedResult, [key, values]) => {
      const result = [];

      for (const element of accumulatedResult) {
        for (const { value } of values) {
          result.push({ ...element, [key]: value });
        }
      }

      return result;
    }, [{}])
    .map(propertyObject => {
      const propertyString = Object.entries(propertyObject)
        .map(([key, value]) => `${key}=${value}`)
        .join(",");
      return `${entityType}[${propertyString}]`;
    })
);
