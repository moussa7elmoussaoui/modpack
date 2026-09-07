import * as e from "@minecraft/server";
import * as a from "@minecraft/server-ui";
var n = {
    243: (e, a, r) => {
      function t(e) {
        return `§0${e}`;
      }
      function n(e) {
        return `§1${e}`;
      }
      function i(e) {
        return `§2${e}`;
      }
      function o(e) {
        return `§3${e}`;
      }
      function c(e) {
        return `§4${e}`;
      }
      function s(e) {
        return `§5${e}`;
      }
      function l(e) {
        return `§6${e}`;
      }
      function m(e) {
        return `§7${e}`;
      }
      function d(e) {
        return `§8${e}`;
      }
      function _(e) {
        return `§9${e}`;
      }
      function f(e) {
        return `§a${e}`;
      }
      function p(e) {
        return `§b${e}`;
      }
      function u(e) {
        return `§c${e}`;
      }
      function g(e) {
        return `§d${e}`;
      }
      function h(e) {
        return `§e${e}`;
      }
      function b(e) {
        return `§f${e}`;
      }
      function k(e) {
        return `§g${e}`;
      }
      function w(e) {
        return `§h${e}`;
      }
      function S(e) {
        return `§i${e}`;
      }
      function y(e) {
        return `§j${e}`;
      }
      function C(e) {
        return `§m${e}`;
      }
      function x(e) {
        return `§n${e}`;
      }
      function B(e) {
        return `§p${e}`;
      }
      function P(e) {
        return `§q${e}`;
      }
      function E(e) {
        return `§s${e}`;
      }
      function v(e) {
        return `§t${e}`;
      }
      function D(e) {
        return `§u${e}`;
      }
      function W(e) {
        return `§k${e}`;
      }
      function O(e) {
        return `§l${e}`;
      }
      function T(e) {
        return `§o${e}`;
      }
      function M(e) {
        return `§r${e}§r`;
      }
      (r.r(a),
        r.d(a, {
          MinecraftColor: () => z,
          aqua: () => p,
          black: () => t,
          blue: () => _,
          bold: () => O,
          darkAqua: () => o,
          darkBlue: () => n,
          darkGray: () => d,
          darkGreen: () => i,
          darkPurple: () => s,
          darkRed: () => c,
          gold: () => l,
          gray: () => m,
          green: () => f,
          italic: () => T,
          lightPurple: () => g,
          materialAmethyst: () => D,
          materialCopper: () => x,
          materialDiamond: () => E,
          materialEmerald: () => P,
          materialGold: () => B,
          materialIron: () => S,
          materialLapis: () => v,
          materialNetherite: () => y,
          materialQuartz: () => w,
          materialRedstone: () => C,
          minecoinGold: () => k,
          obfuscated: () => W,
          red: () => u,
          reset: () => M,
          white: () => b,
          yellow: () => h,
        }));
      class z {}
      ((z.black = "§0"),
        (z.darkBlue = "§1"),
        (z.darkGreen = "§2"),
        (z.darkAqua = "§3"),
        (z.darkRed = "§4"),
        (z.darkPurple = "§5"),
        (z.gold = "§6"),
        (z.gray = "§7"),
        (z.darkGray = "§8"),
        (z.blue = "§9"),
        (z.green = "§a"),
        (z.aqua = "§b"),
        (z.red = "§c"),
        (z.lightPurple = "§d"),
        (z.yellow = "§e"),
        (z.white = "§f"),
        (z.minecoinGold = "§g"),
        (z.materialQuartz = "§h"),
        (z.materialIron = "§i"),
        (z.materialNetherite = "§j"),
        (z.materialRedstone = "§m"),
        (z.materialCopper = "§n"),
        (z.materialGold = "§p"),
        (z.materialEmerald = "§q"),
        (z.materialDiamond = "§s"),
        (z.materialLapis = "§t"),
        (z.materialAmethyst = "§u"),
        (z.obfuscated = "§k"),
        (z.bold = "§l"),
        (z.italic = "§o"),
        (z.reset = "§r"));
    },
    247: function (e) {
      e.exports = (function () {
        return function (a) {
          if (/number|string|boolean/.test(typeof a)) return a;
          if (a instanceof Date) return new Date(a.getTime());
          var r = a instanceof Array ? [] : {};
          return (
            (function a(r, t) {
              for (var n in r) {
                var i = r[n];
                i instanceof Date
                  ? e(t, n, new Date(i.getTime()))
                  : i instanceof Function
                    ? e(t, n, i)
                    : i instanceof Array
                      ? a(i, e(t, n, []))
                      : i instanceof Object
                        ? a(i, e(t, n, {}))
                        : e(t, n, i);
              }
            })(a, r),
            r
          );
        };
        function e(e, a, r) {
          return e instanceof Array
            ? (e.push(r), e[e.length - 1])
            : e instanceof Object
              ? ((e[a] = r), e[a])
              : void 0;
        }
      })();
    },
    821: (e, a, r) => {
      (r.r(a),
        r.d(a, {
          MinecraftBiomeTypes: () => u,
          MinecraftBlockTypes: () => g,
          MinecraftCameraPresetsTypes: () => h,
          MinecraftCooldownCategoryTypes: () => b,
          MinecraftDimensionTypes: () => k,
          MinecraftEffectTypes: () => w,
          MinecraftEnchantmentTypes: () => S,
          MinecraftEntityTypes: () => y,
          MinecraftFeatureTypes: () => C,
          MinecraftItemTypes: () => x,
          MinecraftPotionDeliveryTypes: () => B,
          MinecraftPotionEffectTypes: () => P,
        }));
      var t,
        n,
        i,
        o,
        c,
        s,
        l,
        m,
        d,
        _,
        f,
        p,
        u =
          (((t = u || {}).BambooJungle = "minecraft:bamboo_jungle"),
          (t.BambooJungleHills = "minecraft:bamboo_jungle_hills"),
          (t.BasaltDeltas = "minecraft:basalt_deltas"),
          (t.Beach = "minecraft:beach"),
          (t.BirchForest = "minecraft:birch_forest"),
          (t.BirchForestHills = "minecraft:birch_forest_hills"),
          (t.BirchForestHillsMutated = "minecraft:birch_forest_hills_mutated"),
          (t.BirchForestMutated = "minecraft:birch_forest_mutated"),
          (t.CherryGrove = "minecraft:cherry_grove"),
          (t.ColdBeach = "minecraft:cold_beach"),
          (t.ColdOcean = "minecraft:cold_ocean"),
          (t.ColdTaiga = "minecraft:cold_taiga"),
          (t.ColdTaigaHills = "minecraft:cold_taiga_hills"),
          (t.ColdTaigaMutated = "minecraft:cold_taiga_mutated"),
          (t.CrimsonForest = "minecraft:crimson_forest"),
          (t.DeepColdOcean = "minecraft:deep_cold_ocean"),
          (t.DeepDark = "minecraft:deep_dark"),
          (t.DeepFrozenOcean = "minecraft:deep_frozen_ocean"),
          (t.DeepLukewarmOcean = "minecraft:deep_lukewarm_ocean"),
          (t.DeepOcean = "minecraft:deep_ocean"),
          (t.DeepWarmOcean = "minecraft:deep_warm_ocean"),
          (t.Desert = "minecraft:desert"),
          (t.DesertHills = "minecraft:desert_hills"),
          (t.DesertMutated = "minecraft:desert_mutated"),
          (t.DripstoneCaves = "minecraft:dripstone_caves"),
          (t.ExtremeHills = "minecraft:extreme_hills"),
          (t.ExtremeHillsEdge = "minecraft:extreme_hills_edge"),
          (t.ExtremeHillsMutated = "minecraft:extreme_hills_mutated"),
          (t.ExtremeHillsPlusTrees = "minecraft:extreme_hills_plus_trees"),
          (t.ExtremeHillsPlusTreesMutated =
            "minecraft:extreme_hills_plus_trees_mutated"),
          (t.FlowerForest = "minecraft:flower_forest"),
          (t.Forest = "minecraft:forest"),
          (t.ForestHills = "minecraft:forest_hills"),
          (t.FrozenOcean = "minecraft:frozen_ocean"),
          (t.FrozenPeaks = "minecraft:frozen_peaks"),
          (t.FrozenRiver = "minecraft:frozen_river"),
          (t.Grove = "minecraft:grove"),
          (t.Hell = "minecraft:hell"),
          (t.IceMountains = "minecraft:ice_mountains"),
          (t.IcePlains = "minecraft:ice_plains"),
          (t.IcePlainsSpikes = "minecraft:ice_plains_spikes"),
          (t.JaggedPeaks = "minecraft:jagged_peaks"),
          (t.Jungle = "minecraft:jungle"),
          (t.JungleEdge = "minecraft:jungle_edge"),
          (t.JungleEdgeMutated = "minecraft:jungle_edge_mutated"),
          (t.JungleHills = "minecraft:jungle_hills"),
          (t.JungleMutated = "minecraft:jungle_mutated"),
          (t.LegacyFrozenOcean = "minecraft:legacy_frozen_ocean"),
          (t.LukewarmOcean = "minecraft:lukewarm_ocean"),
          (t.LushCaves = "minecraft:lush_caves"),
          (t.MangroveSwamp = "minecraft:mangrove_swamp"),
          (t.Meadow = "minecraft:meadow"),
          (t.MegaTaiga = "minecraft:mega_taiga"),
          (t.MegaTaigaHills = "minecraft:mega_taiga_hills"),
          (t.Mesa = "minecraft:mesa"),
          (t.MesaBryce = "minecraft:mesa_bryce"),
          (t.MesaPlateau = "minecraft:mesa_plateau"),
          (t.MesaPlateauMutated = "minecraft:mesa_plateau_mutated"),
          (t.MesaPlateauStone = "minecraft:mesa_plateau_stone"),
          (t.MesaPlateauStoneMutated = "minecraft:mesa_plateau_stone_mutated"),
          (t.MushroomIsland = "minecraft:mushroom_island"),
          (t.MushroomIslandShore = "minecraft:mushroom_island_shore"),
          (t.Ocean = "minecraft:ocean"),
          (t.PaleGarden = "minecraft:pale_garden"),
          (t.Plains = "minecraft:plains"),
          (t.RedwoodTaigaHillsMutated =
            "minecraft:redwood_taiga_hills_mutated"),
          (t.RedwoodTaigaMutated = "minecraft:redwood_taiga_mutated"),
          (t.River = "minecraft:river"),
          (t.RoofedForest = "minecraft:roofed_forest"),
          (t.RoofedForestMutated = "minecraft:roofed_forest_mutated"),
          (t.Savanna = "minecraft:savanna"),
          (t.SavannaMutated = "minecraft:savanna_mutated"),
          (t.SavannaPlateau = "minecraft:savanna_plateau"),
          (t.SavannaPlateauMutated = "minecraft:savanna_plateau_mutated"),
          (t.SnowySlopes = "minecraft:snowy_slopes"),
          (t.SoulsandValley = "minecraft:soulsand_valley"),
          (t.StoneBeach = "minecraft:stone_beach"),
          (t.StonyPeaks = "minecraft:stony_peaks"),
          (t.SunflowerPlains = "minecraft:sunflower_plains"),
          (t.Swampland = "minecraft:swampland"),
          (t.SwamplandMutated = "minecraft:swampland_mutated"),
          (t.Taiga = "minecraft:taiga"),
          (t.TaigaHills = "minecraft:taiga_hills"),
          (t.TaigaMutated = "minecraft:taiga_mutated"),
          (t.TheEnd = "minecraft:the_end"),
          (t.WarmOcean = "minecraft:warm_ocean"),
          (t.WarpedForest = "minecraft:warped_forest"),
          t),
        g =
          (((n = g || {}).AcaciaButton = "minecraft:acacia_button"),
          (n.AcaciaDoor = "minecraft:acacia_door"),
          (n.AcaciaDoubleSlab = "minecraft:acacia_double_slab"),
          (n.AcaciaFence = "minecraft:acacia_fence"),
          (n.AcaciaFenceGate = "minecraft:acacia_fence_gate"),
          (n.AcaciaHangingSign = "minecraft:acacia_hanging_sign"),
          (n.AcaciaLeaves = "minecraft:acacia_leaves"),
          (n.AcaciaLog = "minecraft:acacia_log"),
          (n.AcaciaPlanks = "minecraft:acacia_planks"),
          (n.AcaciaPressurePlate = "minecraft:acacia_pressure_plate"),
          (n.AcaciaSapling = "minecraft:acacia_sapling"),
          (n.AcaciaShelf = "minecraft:acacia_shelf"),
          (n.AcaciaSlab = "minecraft:acacia_slab"),
          (n.AcaciaStairs = "minecraft:acacia_stairs"),
          (n.AcaciaStandingSign = "minecraft:acacia_standing_sign"),
          (n.AcaciaTrapdoor = "minecraft:acacia_trapdoor"),
          (n.AcaciaWallSign = "minecraft:acacia_wall_sign"),
          (n.AcaciaWood = "minecraft:acacia_wood"),
          (n.ActivatorRail = "minecraft:activator_rail"),
          (n.Air = "minecraft:air"),
          (n.Allium = "minecraft:allium"),
          (n.Allow = "minecraft:allow"),
          (n.AmethystBlock = "minecraft:amethyst_block"),
          (n.AmethystCluster = "minecraft:amethyst_cluster"),
          (n.AncientDebris = "minecraft:ancient_debris"),
          (n.Andesite = "minecraft:andesite"),
          (n.AndesiteDoubleSlab = "minecraft:andesite_double_slab"),
          (n.AndesiteSlab = "minecraft:andesite_slab"),
          (n.AndesiteStairs = "minecraft:andesite_stairs"),
          (n.AndesiteWall = "minecraft:andesite_wall"),
          (n.Anvil = "minecraft:anvil"),
          (n.Azalea = "minecraft:azalea"),
          (n.AzaleaLeaves = "minecraft:azalea_leaves"),
          (n.AzaleaLeavesFlowered = "minecraft:azalea_leaves_flowered"),
          (n.AzureBluet = "minecraft:azure_bluet"),
          (n.Bamboo = "minecraft:bamboo"),
          (n.BambooBlock = "minecraft:bamboo_block"),
          (n.BambooButton = "minecraft:bamboo_button"),
          (n.BambooDoor = "minecraft:bamboo_door"),
          (n.BambooDoubleSlab = "minecraft:bamboo_double_slab"),
          (n.BambooFence = "minecraft:bamboo_fence"),
          (n.BambooFenceGate = "minecraft:bamboo_fence_gate"),
          (n.BambooHangingSign = "minecraft:bamboo_hanging_sign"),
          (n.BambooMosaic = "minecraft:bamboo_mosaic"),
          (n.BambooMosaicDoubleSlab = "minecraft:bamboo_mosaic_double_slab"),
          (n.BambooMosaicSlab = "minecraft:bamboo_mosaic_slab"),
          (n.BambooMosaicStairs = "minecraft:bamboo_mosaic_stairs"),
          (n.BambooPlanks = "minecraft:bamboo_planks"),
          (n.BambooPressurePlate = "minecraft:bamboo_pressure_plate"),
          (n.BambooSapling = "minecraft:bamboo_sapling"),
          (n.BambooShelf = "minecraft:bamboo_shelf"),
          (n.BambooSlab = "minecraft:bamboo_slab"),
          (n.BambooStairs = "minecraft:bamboo_stairs"),
          (n.BambooStandingSign = "minecraft:bamboo_standing_sign"),
          (n.BambooTrapdoor = "minecraft:bamboo_trapdoor"),
          (n.BambooWallSign = "minecraft:bamboo_wall_sign"),
          (n.Barrel = "minecraft:barrel"),
          (n.Barrier = "minecraft:barrier"),
          (n.Basalt = "minecraft:basalt"),
          (n.Beacon = "minecraft:beacon"),
          (n.Bed = "minecraft:bed"),
          (n.Bedrock = "minecraft:bedrock"),
          (n.BeeNest = "minecraft:bee_nest"),
          (n.Beehive = "minecraft:beehive"),
          (n.Beetroot = "minecraft:beetroot"),
          (n.Bell = "minecraft:bell"),
          (n.BigDripleaf = "minecraft:big_dripleaf"),
          (n.BirchButton = "minecraft:birch_button"),
          (n.BirchDoor = "minecraft:birch_door"),
          (n.BirchDoubleSlab = "minecraft:birch_double_slab"),
          (n.BirchFence = "minecraft:birch_fence"),
          (n.BirchFenceGate = "minecraft:birch_fence_gate"),
          (n.BirchHangingSign = "minecraft:birch_hanging_sign"),
          (n.BirchLeaves = "minecraft:birch_leaves"),
          (n.BirchLog = "minecraft:birch_log"),
          (n.BirchPlanks = "minecraft:birch_planks"),
          (n.BirchPressurePlate = "minecraft:birch_pressure_plate"),
          (n.BirchSapling = "minecraft:birch_sapling"),
          (n.BirchShelf = "minecraft:birch_shelf"),
          (n.BirchSlab = "minecraft:birch_slab"),
          (n.BirchStairs = "minecraft:birch_stairs"),
          (n.BirchStandingSign = "minecraft:birch_standing_sign"),
          (n.BirchTrapdoor = "minecraft:birch_trapdoor"),
          (n.BirchWallSign = "minecraft:birch_wall_sign"),
          (n.BirchWood = "minecraft:birch_wood"),
          (n.BlackCandle = "minecraft:black_candle"),
          (n.BlackCandleCake = "minecraft:black_candle_cake"),
          (n.BlackCarpet = "minecraft:black_carpet"),
          (n.BlackConcrete = "minecraft:black_concrete"),
          (n.BlackConcretePowder = "minecraft:black_concrete_powder"),
          (n.BlackGlazedTerracotta = "minecraft:black_glazed_terracotta"),
          (n.BlackShulkerBox = "minecraft:black_shulker_box"),
          (n.BlackStainedGlass = "minecraft:black_stained_glass"),
          (n.BlackStainedGlassPane = "minecraft:black_stained_glass_pane"),
          (n.BlackTerracotta = "minecraft:black_terracotta"),
          (n.BlackWool = "minecraft:black_wool"),
          (n.Blackstone = "minecraft:blackstone"),
          (n.BlackstoneDoubleSlab = "minecraft:blackstone_double_slab"),
          (n.BlackstoneSlab = "minecraft:blackstone_slab"),
          (n.BlackstoneStairs = "minecraft:blackstone_stairs"),
          (n.BlackstoneWall = "minecraft:blackstone_wall"),
          (n.BlastFurnace = "minecraft:blast_furnace"),
          (n.BlueCandle = "minecraft:blue_candle"),
          (n.BlueCandleCake = "minecraft:blue_candle_cake"),
          (n.BlueCarpet = "minecraft:blue_carpet"),
          (n.BlueConcrete = "minecraft:blue_concrete"),
          (n.BlueConcretePowder = "minecraft:blue_concrete_powder"),
          (n.BlueGlazedTerracotta = "minecraft:blue_glazed_terracotta"),
          (n.BlueIce = "minecraft:blue_ice"),
          (n.BlueOrchid = "minecraft:blue_orchid"),
          (n.BlueShulkerBox = "minecraft:blue_shulker_box"),
          (n.BlueStainedGlass = "minecraft:blue_stained_glass"),
          (n.BlueStainedGlassPane = "minecraft:blue_stained_glass_pane"),
          (n.BlueTerracotta = "minecraft:blue_terracotta"),
          (n.BlueWool = "minecraft:blue_wool"),
          (n.BoneBlock = "minecraft:bone_block"),
          (n.Bookshelf = "minecraft:bookshelf"),
          (n.BorderBlock = "minecraft:border_block"),
          (n.BrainCoral = "minecraft:brain_coral"),
          (n.BrainCoralBlock = "minecraft:brain_coral_block"),
          (n.BrainCoralFan = "minecraft:brain_coral_fan"),
          (n.BrainCoralWallFan = "minecraft:brain_coral_wall_fan"),
          (n.BrewingStand = "minecraft:brewing_stand"),
          (n.BrickBlock = "minecraft:brick_block"),
          (n.BrickDoubleSlab = "minecraft:brick_double_slab"),
          (n.BrickSlab = "minecraft:brick_slab"),
          (n.BrickStairs = "minecraft:brick_stairs"),
          (n.BrickWall = "minecraft:brick_wall"),
          (n.BrownCandle = "minecraft:brown_candle"),
          (n.BrownCandleCake = "minecraft:brown_candle_cake"),
          (n.BrownCarpet = "minecraft:brown_carpet"),
          (n.BrownConcrete = "minecraft:brown_concrete"),
          (n.BrownConcretePowder = "minecraft:brown_concrete_powder"),
          (n.BrownGlazedTerracotta = "minecraft:brown_glazed_terracotta"),
          (n.BrownMushroom = "minecraft:brown_mushroom"),
          (n.BrownMushroomBlock = "minecraft:brown_mushroom_block"),
          (n.BrownShulkerBox = "minecraft:brown_shulker_box"),
          (n.BrownStainedGlass = "minecraft:brown_stained_glass"),
          (n.BrownStainedGlassPane = "minecraft:brown_stained_glass_pane"),
          (n.BrownTerracotta = "minecraft:brown_terracotta"),
          (n.BrownWool = "minecraft:brown_wool"),
          (n.BubbleColumn = "minecraft:bubble_column"),
          (n.BubbleCoral = "minecraft:bubble_coral"),
          (n.BubbleCoralBlock = "minecraft:bubble_coral_block"),
          (n.BubbleCoralFan = "minecraft:bubble_coral_fan"),
          (n.BubbleCoralWallFan = "minecraft:bubble_coral_wall_fan"),
          (n.BuddingAmethyst = "minecraft:budding_amethyst"),
          (n.Bush = "minecraft:bush"),
          (n.Cactus = "minecraft:cactus"),
          (n.CactusFlower = "minecraft:cactus_flower"),
          (n.Cake = "minecraft:cake"),
          (n.Calcite = "minecraft:calcite"),
          (n.CalibratedSculkSensor = "minecraft:calibrated_sculk_sensor"),
          (n.Camera = "minecraft:camera"),
          (n.Campfire = "minecraft:campfire"),
          (n.Candle = "minecraft:candle"),
          (n.CandleCake = "minecraft:candle_cake"),
          (n.Carrots = "minecraft:carrots"),
          (n.CartographyTable = "minecraft:cartography_table"),
          (n.CarvedPumpkin = "minecraft:carved_pumpkin"),
          (n.Cauldron = "minecraft:cauldron"),
          (n.CaveVines = "minecraft:cave_vines"),
          (n.CaveVinesBodyWithBerries =
            "minecraft:cave_vines_body_with_berries"),
          (n.CaveVinesHeadWithBerries =
            "minecraft:cave_vines_head_with_berries"),
          (n.ChainCommandBlock = "minecraft:chain_command_block"),
          (n.ChemicalHeat = "minecraft:chemical_heat"),
          (n.CherryButton = "minecraft:cherry_button"),
          (n.CherryDoor = "minecraft:cherry_door"),
          (n.CherryDoubleSlab = "minecraft:cherry_double_slab"),
          (n.CherryFence = "minecraft:cherry_fence"),
          (n.CherryFenceGate = "minecraft:cherry_fence_gate"),
          (n.CherryHangingSign = "minecraft:cherry_hanging_sign"),
          (n.CherryLeaves = "minecraft:cherry_leaves"),
          (n.CherryLog = "minecraft:cherry_log"),
          (n.CherryPlanks = "minecraft:cherry_planks"),
          (n.CherryPressurePlate = "minecraft:cherry_pressure_plate"),
          (n.CherrySapling = "minecraft:cherry_sapling"),
          (n.CherryShelf = "minecraft:cherry_shelf"),
          (n.CherrySlab = "minecraft:cherry_slab"),
          (n.CherryStairs = "minecraft:cherry_stairs"),
          (n.CherryStandingSign = "minecraft:cherry_standing_sign"),
          (n.CherryTrapdoor = "minecraft:cherry_trapdoor"),
          (n.CherryWallSign = "minecraft:cherry_wall_sign"),
          (n.CherryWood = "minecraft:cherry_wood"),
          (n.Chest = "minecraft:chest"),
          (n.ChippedAnvil = "minecraft:chipped_anvil"),
          (n.ChiseledBookshelf = "minecraft:chiseled_bookshelf"),
          (n.ChiseledCopper = "minecraft:chiseled_copper"),
          (n.ChiseledDeepslate = "minecraft:chiseled_deepslate"),
          (n.ChiseledNetherBricks = "minecraft:chiseled_nether_bricks"),
          (n.ChiseledPolishedBlackstone =
            "minecraft:chiseled_polished_blackstone"),
          (n.ChiseledQuartzBlock = "minecraft:chiseled_quartz_block"),
          (n.ChiseledRedSandstone = "minecraft:chiseled_red_sandstone"),
          (n.ChiseledResinBricks = "minecraft:chiseled_resin_bricks"),
          (n.ChiseledSandstone = "minecraft:chiseled_sandstone"),
          (n.ChiseledStoneBricks = "minecraft:chiseled_stone_bricks"),
          (n.ChiseledTuff = "minecraft:chiseled_tuff"),
          (n.ChiseledTuffBricks = "minecraft:chiseled_tuff_bricks"),
          (n.ChorusFlower = "minecraft:chorus_flower"),
          (n.ChorusPlant = "minecraft:chorus_plant"),
          (n.Clay = "minecraft:clay"),
          (n.ClosedEyeblossom = "minecraft:closed_eyeblossom"),
          (n.CoalBlock = "minecraft:coal_block"),
          (n.CoalOre = "minecraft:coal_ore"),
          (n.CoarseDirt = "minecraft:coarse_dirt"),
          (n.CobbledDeepslate = "minecraft:cobbled_deepslate"),
          (n.CobbledDeepslateDoubleSlab =
            "minecraft:cobbled_deepslate_double_slab"),
          (n.CobbledDeepslateSlab = "minecraft:cobbled_deepslate_slab"),
          (n.CobbledDeepslateStairs = "minecraft:cobbled_deepslate_stairs"),
          (n.CobbledDeepslateWall = "minecraft:cobbled_deepslate_wall"),
          (n.Cobblestone = "minecraft:cobblestone"),
          (n.CobblestoneDoubleSlab = "minecraft:cobblestone_double_slab"),
          (n.CobblestoneSlab = "minecraft:cobblestone_slab"),
          (n.CobblestoneWall = "minecraft:cobblestone_wall"),
          (n.Cocoa = "minecraft:cocoa"),
          (n.ColoredTorchBlue = "minecraft:colored_torch_blue"),
          (n.ColoredTorchGreen = "minecraft:colored_torch_green"),
          (n.ColoredTorchPurple = "minecraft:colored_torch_purple"),
          (n.ColoredTorchRed = "minecraft:colored_torch_red"),
          (n.CommandBlock = "minecraft:command_block"),
          (n.Composter = "minecraft:composter"),
          (n.CompoundCreator = "minecraft:compound_creator"),
          (n.Conduit = "minecraft:conduit"),
          (n.CopperBars = "minecraft:copper_bars"),
          (n.CopperBlock = "minecraft:copper_block"),
          (n.CopperBulb = "minecraft:copper_bulb"),
          (n.CopperChain = "minecraft:copper_chain"),
          (n.CopperChest = "minecraft:copper_chest"),
          (n.CopperDoor = "minecraft:copper_door"),
          (n.CopperGolemStatue = "minecraft:copper_golem_statue"),
          (n.CopperGrate = "minecraft:copper_grate"),
          (n.CopperLantern = "minecraft:copper_lantern"),
          (n.CopperOre = "minecraft:copper_ore"),
          (n.CopperTorch = "minecraft:copper_torch"),
          (n.CopperTrapdoor = "minecraft:copper_trapdoor"),
          (n.Cornflower = "minecraft:cornflower"),
          (n.CrackedDeepslateBricks = "minecraft:cracked_deepslate_bricks"),
          (n.CrackedDeepslateTiles = "minecraft:cracked_deepslate_tiles"),
          (n.CrackedNetherBricks = "minecraft:cracked_nether_bricks"),
          (n.CrackedPolishedBlackstoneBricks =
            "minecraft:cracked_polished_blackstone_bricks"),
          (n.CrackedStoneBricks = "minecraft:cracked_stone_bricks"),
          (n.Crafter = "minecraft:crafter"),
          (n.CraftingTable = "minecraft:crafting_table"),
          (n.CreakingHeart = "minecraft:creaking_heart"),
          (n.CreeperHead = "minecraft:creeper_head"),
          (n.CrimsonButton = "minecraft:crimson_button"),
          (n.CrimsonDoor = "minecraft:crimson_door"),
          (n.CrimsonDoubleSlab = "minecraft:crimson_double_slab"),
          (n.CrimsonFence = "minecraft:crimson_fence"),
          (n.CrimsonFenceGate = "minecraft:crimson_fence_gate"),
          (n.CrimsonFungus = "minecraft:crimson_fungus"),
          (n.CrimsonHangingSign = "minecraft:crimson_hanging_sign"),
          (n.CrimsonHyphae = "minecraft:crimson_hyphae"),
          (n.CrimsonNylium = "minecraft:crimson_nylium"),
          (n.CrimsonPlanks = "minecraft:crimson_planks"),
          (n.CrimsonPressurePlate = "minecraft:crimson_pressure_plate"),
          (n.CrimsonRoots = "minecraft:crimson_roots"),
          (n.CrimsonShelf = "minecraft:crimson_shelf"),
          (n.CrimsonSlab = "minecraft:crimson_slab"),
          (n.CrimsonStairs = "minecraft:crimson_stairs"),
          (n.CrimsonStandingSign = "minecraft:crimson_standing_sign"),
          (n.CrimsonStem = "minecraft:crimson_stem"),
          (n.CrimsonTrapdoor = "minecraft:crimson_trapdoor"),
          (n.CrimsonWallSign = "minecraft:crimson_wall_sign"),
          (n.CryingObsidian = "minecraft:crying_obsidian"),
          (n.CutCopper = "minecraft:cut_copper"),
          (n.CutCopperSlab = "minecraft:cut_copper_slab"),
          (n.CutCopperStairs = "minecraft:cut_copper_stairs"),
          (n.CutRedSandstone = "minecraft:cut_red_sandstone"),
          (n.CutRedSandstoneDoubleSlab =
            "minecraft:cut_red_sandstone_double_slab"),
          (n.CutRedSandstoneSlab = "minecraft:cut_red_sandstone_slab"),
          (n.CutSandstone = "minecraft:cut_sandstone"),
          (n.CutSandstoneDoubleSlab = "minecraft:cut_sandstone_double_slab"),
          (n.CutSandstoneSlab = "minecraft:cut_sandstone_slab"),
          (n.CyanCandle = "minecraft:cyan_candle"),
          (n.CyanCandleCake = "minecraft:cyan_candle_cake"),
          (n.CyanCarpet = "minecraft:cyan_carpet"),
          (n.CyanConcrete = "minecraft:cyan_concrete"),
          (n.CyanConcretePowder = "minecraft:cyan_concrete_powder"),
          (n.CyanGlazedTerracotta = "minecraft:cyan_glazed_terracotta"),
          (n.CyanShulkerBox = "minecraft:cyan_shulker_box"),
          (n.CyanStainedGlass = "minecraft:cyan_stained_glass"),
          (n.CyanStainedGlassPane = "minecraft:cyan_stained_glass_pane"),
          (n.CyanTerracotta = "minecraft:cyan_terracotta"),
          (n.CyanWool = "minecraft:cyan_wool"),
          (n.DamagedAnvil = "minecraft:damaged_anvil"),
          (n.Dandelion = "minecraft:dandelion"),
          (n.DarkOakButton = "minecraft:dark_oak_button"),
          (n.DarkOakDoor = "minecraft:dark_oak_door"),
          (n.DarkOakDoubleSlab = "minecraft:dark_oak_double_slab"),
          (n.DarkOakFence = "minecraft:dark_oak_fence"),
          (n.DarkOakFenceGate = "minecraft:dark_oak_fence_gate"),
          (n.DarkOakHangingSign = "minecraft:dark_oak_hanging_sign"),
          (n.DarkOakLeaves = "minecraft:dark_oak_leaves"),
          (n.DarkOakLog = "minecraft:dark_oak_log"),
          (n.DarkOakPlanks = "minecraft:dark_oak_planks"),
          (n.DarkOakPressurePlate = "minecraft:dark_oak_pressure_plate"),
          (n.DarkOakSapling = "minecraft:dark_oak_sapling"),
          (n.DarkOakShelf = "minecraft:dark_oak_shelf"),
          (n.DarkOakSlab = "minecraft:dark_oak_slab"),
          (n.DarkOakStairs = "minecraft:dark_oak_stairs"),
          (n.DarkOakTrapdoor = "minecraft:dark_oak_trapdoor"),
          (n.DarkOakWood = "minecraft:dark_oak_wood"),
          (n.DarkPrismarine = "minecraft:dark_prismarine"),
          (n.DarkPrismarineDoubleSlab =
            "minecraft:dark_prismarine_double_slab"),
          (n.DarkPrismarineSlab = "minecraft:dark_prismarine_slab"),
          (n.DarkPrismarineStairs = "minecraft:dark_prismarine_stairs"),
          (n.DarkoakStandingSign = "minecraft:darkoak_standing_sign"),
          (n.DarkoakWallSign = "minecraft:darkoak_wall_sign"),
          (n.DaylightDetector = "minecraft:daylight_detector"),
          (n.DaylightDetectorInverted = "minecraft:daylight_detector_inverted"),
          (n.DeadBrainCoral = "minecraft:dead_brain_coral"),
          (n.DeadBrainCoralBlock = "minecraft:dead_brain_coral_block"),
          (n.DeadBrainCoralFan = "minecraft:dead_brain_coral_fan"),
          (n.DeadBrainCoralWallFan = "minecraft:dead_brain_coral_wall_fan"),
          (n.DeadBubbleCoral = "minecraft:dead_bubble_coral"),
          (n.DeadBubbleCoralBlock = "minecraft:dead_bubble_coral_block"),
          (n.DeadBubbleCoralFan = "minecraft:dead_bubble_coral_fan"),
          (n.DeadBubbleCoralWallFan = "minecraft:dead_bubble_coral_wall_fan"),
          (n.DeadFireCoral = "minecraft:dead_fire_coral"),
          (n.DeadFireCoralBlock = "minecraft:dead_fire_coral_block"),
          (n.DeadFireCoralFan = "minecraft:dead_fire_coral_fan"),
          (n.DeadFireCoralWallFan = "minecraft:dead_fire_coral_wall_fan"),
          (n.DeadHornCoral = "minecraft:dead_horn_coral"),
          (n.DeadHornCoralBlock = "minecraft:dead_horn_coral_block"),
          (n.DeadHornCoralFan = "minecraft:dead_horn_coral_fan"),
          (n.DeadHornCoralWallFan = "minecraft:dead_horn_coral_wall_fan"),
          (n.DeadTubeCoral = "minecraft:dead_tube_coral"),
          (n.DeadTubeCoralBlock = "minecraft:dead_tube_coral_block"),
          (n.DeadTubeCoralFan = "minecraft:dead_tube_coral_fan"),
          (n.DeadTubeCoralWallFan = "minecraft:dead_tube_coral_wall_fan"),
          (n.Deadbush = "minecraft:deadbush"),
          (n.DecoratedPot = "minecraft:decorated_pot"),
          (n.Deepslate = "minecraft:deepslate"),
          (n.DeepslateBrickDoubleSlab =
            "minecraft:deepslate_brick_double_slab"),
          (n.DeepslateBrickSlab = "minecraft:deepslate_brick_slab"),
          (n.DeepslateBrickStairs = "minecraft:deepslate_brick_stairs"),
          (n.DeepslateBrickWall = "minecraft:deepslate_brick_wall"),
          (n.DeepslateBricks = "minecraft:deepslate_bricks"),
          (n.DeepslateCoalOre = "minecraft:deepslate_coal_ore"),
          (n.DeepslateCopperOre = "minecraft:deepslate_copper_ore"),
          (n.DeepslateDiamondOre = "minecraft:deepslate_diamond_ore"),
          (n.DeepslateEmeraldOre = "minecraft:deepslate_emerald_ore"),
          (n.DeepslateGoldOre = "minecraft:deepslate_gold_ore"),
          (n.DeepslateIronOre = "minecraft:deepslate_iron_ore"),
          (n.DeepslateLapisOre = "minecraft:deepslate_lapis_ore"),
          (n.DeepslateRedstoneOre = "minecraft:deepslate_redstone_ore"),
          (n.DeepslateTileDoubleSlab = "minecraft:deepslate_tile_double_slab"),
          (n.DeepslateTileSlab = "minecraft:deepslate_tile_slab"),
          (n.DeepslateTileStairs = "minecraft:deepslate_tile_stairs"),
          (n.DeepslateTileWall = "minecraft:deepslate_tile_wall"),
          (n.DeepslateTiles = "minecraft:deepslate_tiles"),
          (n.Deny = "minecraft:deny"),
          (n.DetectorRail = "minecraft:detector_rail"),
          (n.DiamondBlock = "minecraft:diamond_block"),
          (n.DiamondOre = "minecraft:diamond_ore"),
          (n.Diorite = "minecraft:diorite"),
          (n.DioriteDoubleSlab = "minecraft:diorite_double_slab"),
          (n.DioriteSlab = "minecraft:diorite_slab"),
          (n.DioriteStairs = "minecraft:diorite_stairs"),
          (n.DioriteWall = "minecraft:diorite_wall"),
          (n.Dirt = "minecraft:dirt"),
          (n.DirtWithRoots = "minecraft:dirt_with_roots"),
          (n.Dispenser = "minecraft:dispenser"),
          (n.DoubleCutCopperSlab = "minecraft:double_cut_copper_slab"),
          (n.DragonEgg = "minecraft:dragon_egg"),
          (n.DragonHead = "minecraft:dragon_head"),
          (n.DriedGhast = "minecraft:dried_ghast"),
          (n.DriedKelpBlock = "minecraft:dried_kelp_block"),
          (n.DripstoneBlock = "minecraft:dripstone_block"),
          (n.Dropper = "minecraft:dropper"),
          (n.Element0 = "minecraft:element_0"),
          (n.Element1 = "minecraft:element_1"),
          (n.Element10 = "minecraft:element_10"),
          (n.Element100 = "minecraft:element_100"),
          (n.Element101 = "minecraft:element_101"),
          (n.Element102 = "minecraft:element_102"),
          (n.Element103 = "minecraft:element_103"),
          (n.Element104 = "minecraft:element_104"),
          (n.Element105 = "minecraft:element_105"),
          (n.Element106 = "minecraft:element_106"),
          (n.Element107 = "minecraft:element_107"),
          (n.Element108 = "minecraft:element_108"),
          (n.Element109 = "minecraft:element_109"),
          (n.Element11 = "minecraft:element_11"),
          (n.Element110 = "minecraft:element_110"),
          (n.Element111 = "minecraft:element_111"),
          (n.Element112 = "minecraft:element_112"),
          (n.Element113 = "minecraft:element_113"),
          (n.Element114 = "minecraft:element_114"),
          (n.Element115 = "minecraft:element_115"),
          (n.Element116 = "minecraft:element_116"),
          (n.Element117 = "minecraft:element_117"),
          (n.Element118 = "minecraft:element_118"),
          (n.Element12 = "minecraft:element_12"),
          (n.Element13 = "minecraft:element_13"),
          (n.Element14 = "minecraft:element_14"),
          (n.Element15 = "minecraft:element_15"),
          (n.Element16 = "minecraft:element_16"),
          (n.Element17 = "minecraft:element_17"),
          (n.Element18 = "minecraft:element_18"),
          (n.Element19 = "minecraft:element_19"),
          (n.Element2 = "minecraft:element_2"),
          (n.Element20 = "minecraft:element_20"),
          (n.Element21 = "minecraft:element_21"),
          (n.Element22 = "minecraft:element_22"),
          (n.Element23 = "minecraft:element_23"),
          (n.Element24 = "minecraft:element_24"),
          (n.Element25 = "minecraft:element_25"),
          (n.Element26 = "minecraft:element_26"),
          (n.Element27 = "minecraft:element_27"),
          (n.Element28 = "minecraft:element_28"),
          (n.Element29 = "minecraft:element_29"),
          (n.Element3 = "minecraft:element_3"),
          (n.Element30 = "minecraft:element_30"),
          (n.Element31 = "minecraft:element_31"),
          (n.Element32 = "minecraft:element_32"),
          (n.Element33 = "minecraft:element_33"),
          (n.Element34 = "minecraft:element_34"),
          (n.Element35 = "minecraft:element_35"),
          (n.Element36 = "minecraft:element_36"),
          (n.Element37 = "minecraft:element_37"),
          (n.Element38 = "minecraft:element_38"),
          (n.Element39 = "minecraft:element_39"),
          (n.Element4 = "minecraft:element_4"),
          (n.Element40 = "minecraft:element_40"),
          (n.Element41 = "minecraft:element_41"),
          (n.Element42 = "minecraft:element_42"),
          (n.Element43 = "minecraft:element_43"),
          (n.Element44 = "minecraft:element_44"),
          (n.Element45 = "minecraft:element_45"),
          (n.Element46 = "minecraft:element_46"),
          (n.Element47 = "minecraft:element_47"),
          (n.Element48 = "minecraft:element_48"),
          (n.Element49 = "minecraft:element_49"),
          (n.Element5 = "minecraft:element_5"),
          (n.Element50 = "minecraft:element_50"),
          (n.Element51 = "minecraft:element_51"),
          (n.Element52 = "minecraft:element_52"),
          (n.Element53 = "minecraft:element_53"),
          (n.Element54 = "minecraft:element_54"),
          (n.Element55 = "minecraft:element_55"),
          (n.Element56 = "minecraft:element_56"),
          (n.Element57 = "minecraft:element_57"),
          (n.Element58 = "minecraft:element_58"),
          (n.Element59 = "minecraft:element_59"),
          (n.Element6 = "minecraft:element_6"),
          (n.Element60 = "minecraft:element_60"),
          (n.Element61 = "minecraft:element_61"),
          (n.Element62 = "minecraft:element_62"),
          (n.Element63 = "minecraft:element_63"),
          (n.Element64 = "minecraft:element_64"),
          (n.Element65 = "minecraft:element_65"),
          (n.Element66 = "minecraft:element_66"),
          (n.Element67 = "minecraft:element_67"),
          (n.Element68 = "minecraft:element_68"),
          (n.Element69 = "minecraft:element_69"),
          (n.Element7 = "minecraft:element_7"),
          (n.Element70 = "minecraft:element_70"),
          (n.Element71 = "minecraft:element_71"),
          (n.Element72 = "minecraft:element_72"),
          (n.Element73 = "minecraft:element_73"),
          (n.Element74 = "minecraft:element_74"),
          (n.Element75 = "minecraft:element_75"),
          (n.Element76 = "minecraft:element_76"),
          (n.Element77 = "minecraft:element_77"),
          (n.Element78 = "minecraft:element_78"),
          (n.Element79 = "minecraft:element_79"),
          (n.Element8 = "minecraft:element_8"),
          (n.Element80 = "minecraft:element_80"),
          (n.Element81 = "minecraft:element_81"),
          (n.Element82 = "minecraft:element_82"),
          (n.Element83 = "minecraft:element_83"),
          (n.Element84 = "minecraft:element_84"),
          (n.Element85 = "minecraft:element_85"),
          (n.Element86 = "minecraft:element_86"),
          (n.Element87 = "minecraft:element_87"),
          (n.Element88 = "minecraft:element_88"),
          (n.Element89 = "minecraft:element_89"),
          (n.Element9 = "minecraft:element_9"),
          (n.Element90 = "minecraft:element_90"),
          (n.Element91 = "minecraft:element_91"),
          (n.Element92 = "minecraft:element_92"),
          (n.Element93 = "minecraft:element_93"),
          (n.Element94 = "minecraft:element_94"),
          (n.Element95 = "minecraft:element_95"),
          (n.Element96 = "minecraft:element_96"),
          (n.Element97 = "minecraft:element_97"),
          (n.Element98 = "minecraft:element_98"),
          (n.Element99 = "minecraft:element_99"),
          (n.ElementConstructor = "minecraft:element_constructor"),
          (n.EmeraldBlock = "minecraft:emerald_block"),
          (n.EmeraldOre = "minecraft:emerald_ore"),
          (n.EnchantingTable = "minecraft:enchanting_table"),
          (n.EndBrickStairs = "minecraft:end_brick_stairs"),
          (n.EndBricks = "minecraft:end_bricks"),
          (n.EndPortal = "minecraft:end_portal"),
          (n.EndPortalFrame = "minecraft:end_portal_frame"),
          (n.EndRod = "minecraft:end_rod"),
          (n.EndStone = "minecraft:end_stone"),
          (n.EndStoneBrickDoubleSlab = "minecraft:end_stone_brick_double_slab"),
          (n.EndStoneBrickSlab = "minecraft:end_stone_brick_slab"),
          (n.EndStoneBrickWall = "minecraft:end_stone_brick_wall"),
          (n.EnderChest = "minecraft:ender_chest"),
          (n.ExposedChiseledCopper = "minecraft:exposed_chiseled_copper"),
          (n.ExposedCopper = "minecraft:exposed_copper"),
          (n.ExposedCopperBars = "minecraft:exposed_copper_bars"),
          (n.ExposedCopperBulb = "minecraft:exposed_copper_bulb"),
          (n.ExposedCopperChain = "minecraft:exposed_copper_chain"),
          (n.ExposedCopperChest = "minecraft:exposed_copper_chest"),
          (n.ExposedCopperDoor = "minecraft:exposed_copper_door"),
          (n.ExposedCopperGolemStatue =
            "minecraft:exposed_copper_golem_statue"),
          (n.ExposedCopperGrate = "minecraft:exposed_copper_grate"),
          (n.ExposedCopperLantern = "minecraft:exposed_copper_lantern"),
          (n.ExposedCopperTrapdoor = "minecraft:exposed_copper_trapdoor"),
          (n.ExposedCutCopper = "minecraft:exposed_cut_copper"),
          (n.ExposedCutCopperSlab = "minecraft:exposed_cut_copper_slab"),
          (n.ExposedCutCopperStairs = "minecraft:exposed_cut_copper_stairs"),
          (n.ExposedDoubleCutCopperSlab =
            "minecraft:exposed_double_cut_copper_slab"),
          (n.ExposedLightningRod = "minecraft:exposed_lightning_rod"),
          (n.Farmland = "minecraft:farmland"),
          (n.FenceGate = "minecraft:fence_gate"),
          (n.Fern = "minecraft:fern"),
          (n.Fire = "minecraft:fire"),
          (n.FireCoral = "minecraft:fire_coral"),
          (n.FireCoralBlock = "minecraft:fire_coral_block"),
          (n.FireCoralFan = "minecraft:fire_coral_fan"),
          (n.FireCoralWallFan = "minecraft:fire_coral_wall_fan"),
          (n.FireflyBush = "minecraft:firefly_bush"),
          (n.FletchingTable = "minecraft:fletching_table"),
          (n.FlowerPot = "minecraft:flower_pot"),
          (n.FloweringAzalea = "minecraft:flowering_azalea"),
          (n.FlowingLava = "minecraft:flowing_lava"),
          (n.FlowingWater = "minecraft:flowing_water"),
          (n.Frame = "minecraft:frame"),
          (n.FrogSpawn = "minecraft:frog_spawn"),
          (n.FrostedIce = "minecraft:frosted_ice"),
          (n.Furnace = "minecraft:furnace"),
          (n.GildedBlackstone = "minecraft:gilded_blackstone"),
          (n.Glass = "minecraft:glass"),
          (n.GlassPane = "minecraft:glass_pane"),
          (n.GlowFrame = "minecraft:glow_frame"),
          (n.GlowLichen = "minecraft:glow_lichen"),
          (n.Glowstone = "minecraft:glowstone"),
          (n.GoldBlock = "minecraft:gold_block"),
          (n.GoldOre = "minecraft:gold_ore"),
          (n.GoldenRail = "minecraft:golden_rail"),
          (n.Granite = "minecraft:granite"),
          (n.GraniteDoubleSlab = "minecraft:granite_double_slab"),
          (n.GraniteSlab = "minecraft:granite_slab"),
          (n.GraniteStairs = "minecraft:granite_stairs"),
          (n.GraniteWall = "minecraft:granite_wall"),
          (n.GrassBlock = "minecraft:grass_block"),
          (n.GrassPath = "minecraft:grass_path"),
          (n.Gravel = "minecraft:gravel"),
          (n.GrayCandle = "minecraft:gray_candle"),
          (n.GrayCandleCake = "minecraft:gray_candle_cake"),
          (n.GrayCarpet = "minecraft:gray_carpet"),
          (n.GrayConcrete = "minecraft:gray_concrete"),
          (n.GrayConcretePowder = "minecraft:gray_concrete_powder"),
          (n.GrayGlazedTerracotta = "minecraft:gray_glazed_terracotta"),
          (n.GrayShulkerBox = "minecraft:gray_shulker_box"),
          (n.GrayStainedGlass = "minecraft:gray_stained_glass"),
          (n.GrayStainedGlassPane = "minecraft:gray_stained_glass_pane"),
          (n.GrayTerracotta = "minecraft:gray_terracotta"),
          (n.GrayWool = "minecraft:gray_wool"),
          (n.GreenCandle = "minecraft:green_candle"),
          (n.GreenCandleCake = "minecraft:green_candle_cake"),
          (n.GreenCarpet = "minecraft:green_carpet"),
          (n.GreenConcrete = "minecraft:green_concrete"),
          (n.GreenConcretePowder = "minecraft:green_concrete_powder"),
          (n.GreenGlazedTerracotta = "minecraft:green_glazed_terracotta"),
          (n.GreenShulkerBox = "minecraft:green_shulker_box"),
          (n.GreenStainedGlass = "minecraft:green_stained_glass"),
          (n.GreenStainedGlassPane = "minecraft:green_stained_glass_pane"),
          (n.GreenTerracotta = "minecraft:green_terracotta"),
          (n.GreenWool = "minecraft:green_wool"),
          (n.Grindstone = "minecraft:grindstone"),
          (n.HangingRoots = "minecraft:hanging_roots"),
          (n.HardBlackStainedGlass = "minecraft:hard_black_stained_glass"),
          (n.HardBlackStainedGlassPane =
            "minecraft:hard_black_stained_glass_pane"),
          (n.HardBlueStainedGlass = "minecraft:hard_blue_stained_glass"),
          (n.HardBlueStainedGlassPane =
            "minecraft:hard_blue_stained_glass_pane"),
          (n.HardBrownStainedGlass = "minecraft:hard_brown_stained_glass"),
          (n.HardBrownStainedGlassPane =
            "minecraft:hard_brown_stained_glass_pane"),
          (n.HardCyanStainedGlass = "minecraft:hard_cyan_stained_glass"),
          (n.HardCyanStainedGlassPane =
            "minecraft:hard_cyan_stained_glass_pane"),
          (n.HardGlass = "minecraft:hard_glass"),
          (n.HardGlassPane = "minecraft:hard_glass_pane"),
          (n.HardGrayStainedGlass = "minecraft:hard_gray_stained_glass"),
          (n.HardGrayStainedGlassPane =
            "minecraft:hard_gray_stained_glass_pane"),
          (n.HardGreenStainedGlass = "minecraft:hard_green_stained_glass"),
          (n.HardGreenStainedGlassPane =
            "minecraft:hard_green_stained_glass_pane"),
          (n.HardLightBlueStainedGlass =
            "minecraft:hard_light_blue_stained_glass"),
          (n.HardLightBlueStainedGlassPane =
            "minecraft:hard_light_blue_stained_glass_pane"),
          (n.HardLightGrayStainedGlass =
            "minecraft:hard_light_gray_stained_glass"),
          (n.HardLightGrayStainedGlassPane =
            "minecraft:hard_light_gray_stained_glass_pane"),
          (n.HardLimeStainedGlass = "minecraft:hard_lime_stained_glass"),
          (n.HardLimeStainedGlassPane =
            "minecraft:hard_lime_stained_glass_pane"),
          (n.HardMagentaStainedGlass = "minecraft:hard_magenta_stained_glass"),
          (n.HardMagentaStainedGlassPane =
            "minecraft:hard_magenta_stained_glass_pane"),
          (n.HardOrangeStainedGlass = "minecraft:hard_orange_stained_glass"),
          (n.HardOrangeStainedGlassPane =
            "minecraft:hard_orange_stained_glass_pane"),
          (n.HardPinkStainedGlass = "minecraft:hard_pink_stained_glass"),
          (n.HardPinkStainedGlassPane =
            "minecraft:hard_pink_stained_glass_pane"),
          (n.HardPurpleStainedGlass = "minecraft:hard_purple_stained_glass"),
          (n.HardPurpleStainedGlassPane =
            "minecraft:hard_purple_stained_glass_pane"),
          (n.HardRedStainedGlass = "minecraft:hard_red_stained_glass"),
          (n.HardRedStainedGlassPane = "minecraft:hard_red_stained_glass_pane"),
          (n.HardWhiteStainedGlass = "minecraft:hard_white_stained_glass"),
          (n.HardWhiteStainedGlassPane =
            "minecraft:hard_white_stained_glass_pane"),
          (n.HardYellowStainedGlass = "minecraft:hard_yellow_stained_glass"),
          (n.HardYellowStainedGlassPane =
            "minecraft:hard_yellow_stained_glass_pane"),
          (n.HardenedClay = "minecraft:hardened_clay"),
          (n.HayBlock = "minecraft:hay_block"),
          (n.HeavyCore = "minecraft:heavy_core"),
          (n.HeavyWeightedPressurePlate =
            "minecraft:heavy_weighted_pressure_plate"),
          (n.HoneyBlock = "minecraft:honey_block"),
          (n.HoneycombBlock = "minecraft:honeycomb_block"),
          (n.Hopper = "minecraft:hopper"),
          (n.HornCoral = "minecraft:horn_coral"),
          (n.HornCoralBlock = "minecraft:horn_coral_block"),
          (n.HornCoralFan = "minecraft:horn_coral_fan"),
          (n.HornCoralWallFan = "minecraft:horn_coral_wall_fan"),
          (n.Ice = "minecraft:ice"),
          (n.InfestedChiseledStoneBricks =
            "minecraft:infested_chiseled_stone_bricks"),
          (n.InfestedCobblestone = "minecraft:infested_cobblestone"),
          (n.InfestedCrackedStoneBricks =
            "minecraft:infested_cracked_stone_bricks"),
          (n.InfestedDeepslate = "minecraft:infested_deepslate"),
          (n.InfestedMossyStoneBricks =
            "minecraft:infested_mossy_stone_bricks"),
          (n.InfestedStone = "minecraft:infested_stone"),
          (n.InfestedStoneBricks = "minecraft:infested_stone_bricks"),
          (n.IronBars = "minecraft:iron_bars"),
          (n.IronBlock = "minecraft:iron_block"),
          (n.IronChain = "minecraft:iron_chain"),
          (n.IronDoor = "minecraft:iron_door"),
          (n.IronOre = "minecraft:iron_ore"),
          (n.IronTrapdoor = "minecraft:iron_trapdoor"),
          (n.Jigsaw = "minecraft:jigsaw"),
          (n.Jukebox = "minecraft:jukebox"),
          (n.JungleButton = "minecraft:jungle_button"),
          (n.JungleDoor = "minecraft:jungle_door"),
          (n.JungleDoubleSlab = "minecraft:jungle_double_slab"),
          (n.JungleFence = "minecraft:jungle_fence"),
          (n.JungleFenceGate = "minecraft:jungle_fence_gate"),
          (n.JungleHangingSign = "minecraft:jungle_hanging_sign"),
          (n.JungleLeaves = "minecraft:jungle_leaves"),
          (n.JungleLog = "minecraft:jungle_log"),
          (n.JunglePlanks = "minecraft:jungle_planks"),
          (n.JunglePressurePlate = "minecraft:jungle_pressure_plate"),
          (n.JungleSapling = "minecraft:jungle_sapling"),
          (n.JungleShelf = "minecraft:jungle_shelf"),
          (n.JungleSlab = "minecraft:jungle_slab"),
          (n.JungleStairs = "minecraft:jungle_stairs"),
          (n.JungleStandingSign = "minecraft:jungle_standing_sign"),
          (n.JungleTrapdoor = "minecraft:jungle_trapdoor"),
          (n.JungleWallSign = "minecraft:jungle_wall_sign"),
          (n.JungleWood = "minecraft:jungle_wood"),
          (n.Kelp = "minecraft:kelp"),
          (n.LabTable = "minecraft:lab_table"),
          (n.Ladder = "minecraft:ladder"),
          (n.Lantern = "minecraft:lantern"),
          (n.LapisBlock = "minecraft:lapis_block"),
          (n.LapisOre = "minecraft:lapis_ore"),
          (n.LargeAmethystBud = "minecraft:large_amethyst_bud"),
          (n.LargeFern = "minecraft:large_fern"),
          (n.Lava = "minecraft:lava"),
          (n.LeafLitter = "minecraft:leaf_litter"),
          (n.Lectern = "minecraft:lectern"),
          (n.Lever = "minecraft:lever"),
          (n.LightBlock0 = "minecraft:light_block_0"),
          (n.LightBlock1 = "minecraft:light_block_1"),
          (n.LightBlock10 = "minecraft:light_block_10"),
          (n.LightBlock11 = "minecraft:light_block_11"),
          (n.LightBlock12 = "minecraft:light_block_12"),
          (n.LightBlock13 = "minecraft:light_block_13"),
          (n.LightBlock14 = "minecraft:light_block_14"),
          (n.LightBlock15 = "minecraft:light_block_15"),
          (n.LightBlock2 = "minecraft:light_block_2"),
          (n.LightBlock3 = "minecraft:light_block_3"),
          (n.LightBlock4 = "minecraft:light_block_4"),
          (n.LightBlock5 = "minecraft:light_block_5"),
          (n.LightBlock6 = "minecraft:light_block_6"),
          (n.LightBlock7 = "minecraft:light_block_7"),
          (n.LightBlock8 = "minecraft:light_block_8"),
          (n.LightBlock9 = "minecraft:light_block_9"),
          (n.LightBlueCandle = "minecraft:light_blue_candle"),
          (n.LightBlueCandleCake = "minecraft:light_blue_candle_cake"),
          (n.LightBlueCarpet = "minecraft:light_blue_carpet"),
          (n.LightBlueConcrete = "minecraft:light_blue_concrete"),
          (n.LightBlueConcretePowder = "minecraft:light_blue_concrete_powder"),
          (n.LightBlueGlazedTerracotta =
            "minecraft:light_blue_glazed_terracotta"),
          (n.LightBlueShulkerBox = "minecraft:light_blue_shulker_box"),
          (n.LightBlueStainedGlass = "minecraft:light_blue_stained_glass"),
          (n.LightBlueStainedGlassPane =
            "minecraft:light_blue_stained_glass_pane"),
          (n.LightBlueTerracotta = "minecraft:light_blue_terracotta"),
          (n.LightBlueWool = "minecraft:light_blue_wool"),
          (n.LightGrayCandle = "minecraft:light_gray_candle"),
          (n.LightGrayCandleCake = "minecraft:light_gray_candle_cake"),
          (n.LightGrayCarpet = "minecraft:light_gray_carpet"),
          (n.LightGrayConcrete = "minecraft:light_gray_concrete"),
          (n.LightGrayConcretePowder = "minecraft:light_gray_concrete_powder"),
          (n.LightGrayShulkerBox = "minecraft:light_gray_shulker_box"),
          (n.LightGrayStainedGlass = "minecraft:light_gray_stained_glass"),
          (n.LightGrayStainedGlassPane =
            "minecraft:light_gray_stained_glass_pane"),
          (n.LightGrayTerracotta = "minecraft:light_gray_terracotta"),
          (n.LightGrayWool = "minecraft:light_gray_wool"),
          (n.LightWeightedPressurePlate =
            "minecraft:light_weighted_pressure_plate"),
          (n.LightningRod = "minecraft:lightning_rod"),
          (n.Lilac = "minecraft:lilac"),
          (n.LilyOfTheValley = "minecraft:lily_of_the_valley"),
          (n.LimeCandle = "minecraft:lime_candle"),
          (n.LimeCandleCake = "minecraft:lime_candle_cake"),
          (n.LimeCarpet = "minecraft:lime_carpet"),
          (n.LimeConcrete = "minecraft:lime_concrete"),
          (n.LimeConcretePowder = "minecraft:lime_concrete_powder"),
          (n.LimeGlazedTerracotta = "minecraft:lime_glazed_terracotta"),
          (n.LimeShulkerBox = "minecraft:lime_shulker_box"),
          (n.LimeStainedGlass = "minecraft:lime_stained_glass"),
          (n.LimeStainedGlassPane = "minecraft:lime_stained_glass_pane"),
          (n.LimeTerracotta = "minecraft:lime_terracotta"),
          (n.LimeWool = "minecraft:lime_wool"),
          (n.LitBlastFurnace = "minecraft:lit_blast_furnace"),
          (n.LitDeepslateRedstoneOre = "minecraft:lit_deepslate_redstone_ore"),
          (n.LitFurnace = "minecraft:lit_furnace"),
          (n.LitPumpkin = "minecraft:lit_pumpkin"),
          (n.LitRedstoneLamp = "minecraft:lit_redstone_lamp"),
          (n.LitRedstoneOre = "minecraft:lit_redstone_ore"),
          (n.LitSmoker = "minecraft:lit_smoker"),
          (n.Lodestone = "minecraft:lodestone"),
          (n.Loom = "minecraft:loom"),
          (n.MagentaCandle = "minecraft:magenta_candle"),
          (n.MagentaCandleCake = "minecraft:magenta_candle_cake"),
          (n.MagentaCarpet = "minecraft:magenta_carpet"),
          (n.MagentaConcrete = "minecraft:magenta_concrete"),
          (n.MagentaConcretePowder = "minecraft:magenta_concrete_powder"),
          (n.MagentaGlazedTerracotta = "minecraft:magenta_glazed_terracotta"),
          (n.MagentaShulkerBox = "minecraft:magenta_shulker_box"),
          (n.MagentaStainedGlass = "minecraft:magenta_stained_glass"),
          (n.MagentaStainedGlassPane = "minecraft:magenta_stained_glass_pane"),
          (n.MagentaTerracotta = "minecraft:magenta_terracotta"),
          (n.MagentaWool = "minecraft:magenta_wool"),
          (n.Magma = "minecraft:magma"),
          (n.MangroveButton = "minecraft:mangrove_button"),
          (n.MangroveDoor = "minecraft:mangrove_door"),
          (n.MangroveDoubleSlab = "minecraft:mangrove_double_slab"),
          (n.MangroveFence = "minecraft:mangrove_fence"),
          (n.MangroveFenceGate = "minecraft:mangrove_fence_gate"),
          (n.MangroveHangingSign = "minecraft:mangrove_hanging_sign"),
          (n.MangroveLeaves = "minecraft:mangrove_leaves"),
          (n.MangroveLog = "minecraft:mangrove_log"),
          (n.MangrovePlanks = "minecraft:mangrove_planks"),
          (n.MangrovePressurePlate = "minecraft:mangrove_pressure_plate"),
          (n.MangrovePropagule = "minecraft:mangrove_propagule"),
          (n.MangroveRoots = "minecraft:mangrove_roots"),
          (n.MangroveShelf = "minecraft:mangrove_shelf"),
          (n.MangroveSlab = "minecraft:mangrove_slab"),
          (n.MangroveStairs = "minecraft:mangrove_stairs"),
          (n.MangroveStandingSign = "minecraft:mangrove_standing_sign"),
          (n.MangroveTrapdoor = "minecraft:mangrove_trapdoor"),
          (n.MangroveWallSign = "minecraft:mangrove_wall_sign"),
          (n.MangroveWood = "minecraft:mangrove_wood"),
          (n.MaterialReducer = "minecraft:material_reducer"),
          (n.MediumAmethystBud = "minecraft:medium_amethyst_bud"),
          (n.MelonBlock = "minecraft:melon_block"),
          (n.MelonStem = "minecraft:melon_stem"),
          (n.MobSpawner = "minecraft:mob_spawner"),
          (n.MossBlock = "minecraft:moss_block"),
          (n.MossCarpet = "minecraft:moss_carpet"),
          (n.MossyCobblestone = "minecraft:mossy_cobblestone"),
          (n.MossyCobblestoneDoubleSlab =
            "minecraft:mossy_cobblestone_double_slab"),
          (n.MossyCobblestoneSlab = "minecraft:mossy_cobblestone_slab"),
          (n.MossyCobblestoneStairs = "minecraft:mossy_cobblestone_stairs"),
          (n.MossyCobblestoneWall = "minecraft:mossy_cobblestone_wall"),
          (n.MossyStoneBrickDoubleSlab =
            "minecraft:mossy_stone_brick_double_slab"),
          (n.MossyStoneBrickSlab = "minecraft:mossy_stone_brick_slab"),
          (n.MossyStoneBrickStairs = "minecraft:mossy_stone_brick_stairs"),
          (n.MossyStoneBrickWall = "minecraft:mossy_stone_brick_wall"),
          (n.MossyStoneBricks = "minecraft:mossy_stone_bricks"),
          (n.Mud = "minecraft:mud"),
          (n.MudBrickDoubleSlab = "minecraft:mud_brick_double_slab"),
          (n.MudBrickSlab = "minecraft:mud_brick_slab"),
          (n.MudBrickStairs = "minecraft:mud_brick_stairs"),
          (n.MudBrickWall = "minecraft:mud_brick_wall"),
          (n.MudBricks = "minecraft:mud_bricks"),
          (n.MuddyMangroveRoots = "minecraft:muddy_mangrove_roots"),
          (n.MushroomStem = "minecraft:mushroom_stem"),
          (n.Mycelium = "minecraft:mycelium"),
          (n.NetherBrick = "minecraft:nether_brick"),
          (n.NetherBrickDoubleSlab = "minecraft:nether_brick_double_slab"),
          (n.NetherBrickFence = "minecraft:nether_brick_fence"),
          (n.NetherBrickSlab = "minecraft:nether_brick_slab"),
          (n.NetherBrickStairs = "minecraft:nether_brick_stairs"),
          (n.NetherBrickWall = "minecraft:nether_brick_wall"),
          (n.NetherGoldOre = "minecraft:nether_gold_ore"),
          (n.NetherSprouts = "minecraft:nether_sprouts"),
          (n.NetherWart = "minecraft:nether_wart"),
          (n.NetherWartBlock = "minecraft:nether_wart_block"),
          (n.NetheriteBlock = "minecraft:netherite_block"),
          (n.Netherrack = "minecraft:netherrack"),
          (n.NormalStoneDoubleSlab = "minecraft:normal_stone_double_slab"),
          (n.NormalStoneSlab = "minecraft:normal_stone_slab"),
          (n.NormalStoneStairs = "minecraft:normal_stone_stairs"),
          (n.Noteblock = "minecraft:noteblock"),
          (n.OakDoubleSlab = "minecraft:oak_double_slab"),
          (n.OakFence = "minecraft:oak_fence"),
          (n.OakHangingSign = "minecraft:oak_hanging_sign"),
          (n.OakLeaves = "minecraft:oak_leaves"),
          (n.OakLog = "minecraft:oak_log"),
          (n.OakPlanks = "minecraft:oak_planks"),
          (n.OakSapling = "minecraft:oak_sapling"),
          (n.OakShelf = "minecraft:oak_shelf"),
          (n.OakSlab = "minecraft:oak_slab"),
          (n.OakStairs = "minecraft:oak_stairs"),
          (n.OakWood = "minecraft:oak_wood"),
          (n.Observer = "minecraft:observer"),
          (n.Obsidian = "minecraft:obsidian"),
          (n.OchreFroglight = "minecraft:ochre_froglight"),
          (n.OpenEyeblossom = "minecraft:open_eyeblossom"),
          (n.OrangeCandle = "minecraft:orange_candle"),
          (n.OrangeCandleCake = "minecraft:orange_candle_cake"),
          (n.OrangeCarpet = "minecraft:orange_carpet"),
          (n.OrangeConcrete = "minecraft:orange_concrete"),
          (n.OrangeConcretePowder = "minecraft:orange_concrete_powder"),
          (n.OrangeGlazedTerracotta = "minecraft:orange_glazed_terracotta"),
          (n.OrangeShulkerBox = "minecraft:orange_shulker_box"),
          (n.OrangeStainedGlass = "minecraft:orange_stained_glass"),
          (n.OrangeStainedGlassPane = "minecraft:orange_stained_glass_pane"),
          (n.OrangeTerracotta = "minecraft:orange_terracotta"),
          (n.OrangeTulip = "minecraft:orange_tulip"),
          (n.OrangeWool = "minecraft:orange_wool"),
          (n.OxeyeDaisy = "minecraft:oxeye_daisy"),
          (n.OxidizedChiseledCopper = "minecraft:oxidized_chiseled_copper"),
          (n.OxidizedCopper = "minecraft:oxidized_copper"),
          (n.OxidizedCopperBars = "minecraft:oxidized_copper_bars"),
          (n.OxidizedCopperBulb = "minecraft:oxidized_copper_bulb"),
          (n.OxidizedCopperChain = "minecraft:oxidized_copper_chain"),
          (n.OxidizedCopperChest = "minecraft:oxidized_copper_chest"),
          (n.OxidizedCopperDoor = "minecraft:oxidized_copper_door"),
          (n.OxidizedCopperGolemStatue =
            "minecraft:oxidized_copper_golem_statue"),
          (n.OxidizedCopperGrate = "minecraft:oxidized_copper_grate"),
          (n.OxidizedCopperLantern = "minecraft:oxidized_copper_lantern"),
          (n.OxidizedCopperTrapdoor = "minecraft:oxidized_copper_trapdoor"),
          (n.OxidizedCutCopper = "minecraft:oxidized_cut_copper"),
          (n.OxidizedCutCopperSlab = "minecraft:oxidized_cut_copper_slab"),
          (n.OxidizedCutCopperStairs = "minecraft:oxidized_cut_copper_stairs"),
          (n.OxidizedDoubleCutCopperSlab =
            "minecraft:oxidized_double_cut_copper_slab"),
          (n.OxidizedLightningRod = "minecraft:oxidized_lightning_rod"),
          (n.PackedIce = "minecraft:packed_ice"),
          (n.PackedMud = "minecraft:packed_mud"),
          (n.PaleHangingMoss = "minecraft:pale_hanging_moss"),
          (n.PaleMossBlock = "minecraft:pale_moss_block"),
          (n.PaleMossCarpet = "minecraft:pale_moss_carpet"),
          (n.PaleOakButton = "minecraft:pale_oak_button"),
          (n.PaleOakDoor = "minecraft:pale_oak_door"),
          (n.PaleOakDoubleSlab = "minecraft:pale_oak_double_slab"),
          (n.PaleOakFence = "minecraft:pale_oak_fence"),
          (n.PaleOakFenceGate = "minecraft:pale_oak_fence_gate"),
          (n.PaleOakHangingSign = "minecraft:pale_oak_hanging_sign"),
          (n.PaleOakLeaves = "minecraft:pale_oak_leaves"),
          (n.PaleOakLog = "minecraft:pale_oak_log"),
          (n.PaleOakPlanks = "minecraft:pale_oak_planks"),
          (n.PaleOakPressurePlate = "minecraft:pale_oak_pressure_plate"),
          (n.PaleOakSapling = "minecraft:pale_oak_sapling"),
          (n.PaleOakShelf = "minecraft:pale_oak_shelf"),
          (n.PaleOakSlab = "minecraft:pale_oak_slab"),
          (n.PaleOakStairs = "minecraft:pale_oak_stairs"),
          (n.PaleOakStandingSign = "minecraft:pale_oak_standing_sign"),
          (n.PaleOakTrapdoor = "minecraft:pale_oak_trapdoor"),
          (n.PaleOakWallSign = "minecraft:pale_oak_wall_sign"),
          (n.PaleOakWood = "minecraft:pale_oak_wood"),
          (n.PearlescentFroglight = "minecraft:pearlescent_froglight"),
          (n.Peony = "minecraft:peony"),
          (n.PetrifiedOakDoubleSlab = "minecraft:petrified_oak_double_slab"),
          (n.PetrifiedOakSlab = "minecraft:petrified_oak_slab"),
          (n.PiglinHead = "minecraft:piglin_head"),
          (n.PinkCandle = "minecraft:pink_candle"),
          (n.PinkCandleCake = "minecraft:pink_candle_cake"),
          (n.PinkCarpet = "minecraft:pink_carpet"),
          (n.PinkConcrete = "minecraft:pink_concrete"),
          (n.PinkConcretePowder = "minecraft:pink_concrete_powder"),
          (n.PinkGlazedTerracotta = "minecraft:pink_glazed_terracotta"),
          (n.PinkPetals = "minecraft:pink_petals"),
          (n.PinkShulkerBox = "minecraft:pink_shulker_box"),
          (n.PinkStainedGlass = "minecraft:pink_stained_glass"),
          (n.PinkStainedGlassPane = "minecraft:pink_stained_glass_pane"),
          (n.PinkTerracotta = "minecraft:pink_terracotta"),
          (n.PinkTulip = "minecraft:pink_tulip"),
          (n.PinkWool = "minecraft:pink_wool"),
          (n.Piston = "minecraft:piston"),
          (n.PistonArmCollision = "minecraft:piston_arm_collision"),
          (n.PitcherCrop = "minecraft:pitcher_crop"),
          (n.PitcherPlant = "minecraft:pitcher_plant"),
          (n.PlayerHead = "minecraft:player_head"),
          (n.Podzol = "minecraft:podzol"),
          (n.PointedDripstone = "minecraft:pointed_dripstone"),
          (n.PolishedAndesite = "minecraft:polished_andesite"),
          (n.PolishedAndesiteDoubleSlab =
            "minecraft:polished_andesite_double_slab"),
          (n.PolishedAndesiteSlab = "minecraft:polished_andesite_slab"),
          (n.PolishedAndesiteStairs = "minecraft:polished_andesite_stairs"),
          (n.PolishedBasalt = "minecraft:polished_basalt"),
          (n.PolishedBlackstone = "minecraft:polished_blackstone"),
          (n.PolishedBlackstoneBrickDoubleSlab =
            "minecraft:polished_blackstone_brick_double_slab"),
          (n.PolishedBlackstoneBrickSlab =
            "minecraft:polished_blackstone_brick_slab"),
          (n.PolishedBlackstoneBrickStairs =
            "minecraft:polished_blackstone_brick_stairs"),
          (n.PolishedBlackstoneBrickWall =
            "minecraft:polished_blackstone_brick_wall"),
          (n.PolishedBlackstoneBricks = "minecraft:polished_blackstone_bricks"),
          (n.PolishedBlackstoneButton = "minecraft:polished_blackstone_button"),
          (n.PolishedBlackstoneDoubleSlab =
            "minecraft:polished_blackstone_double_slab"),
          (n.PolishedBlackstonePressurePlate =
            "minecraft:polished_blackstone_pressure_plate"),
          (n.PolishedBlackstoneSlab = "minecraft:polished_blackstone_slab"),
          (n.PolishedBlackstoneStairs = "minecraft:polished_blackstone_stairs"),
          (n.PolishedBlackstoneWall = "minecraft:polished_blackstone_wall"),
          (n.PolishedDeepslate = "minecraft:polished_deepslate"),
          (n.PolishedDeepslateDoubleSlab =
            "minecraft:polished_deepslate_double_slab"),
          (n.PolishedDeepslateSlab = "minecraft:polished_deepslate_slab"),
          (n.PolishedDeepslateStairs = "minecraft:polished_deepslate_stairs"),
          (n.PolishedDeepslateWall = "minecraft:polished_deepslate_wall"),
          (n.PolishedDiorite = "minecraft:polished_diorite"),
          (n.PolishedDioriteDoubleSlab =
            "minecraft:polished_diorite_double_slab"),
          (n.PolishedDioriteSlab = "minecraft:polished_diorite_slab"),
          (n.PolishedDioriteStairs = "minecraft:polished_diorite_stairs"),
          (n.PolishedGranite = "minecraft:polished_granite"),
          (n.PolishedGraniteDoubleSlab =
            "minecraft:polished_granite_double_slab"),
          (n.PolishedGraniteSlab = "minecraft:polished_granite_slab"),
          (n.PolishedGraniteStairs = "minecraft:polished_granite_stairs"),
          (n.PolishedTuff = "minecraft:polished_tuff"),
          (n.PolishedTuffDoubleSlab = "minecraft:polished_tuff_double_slab"),
          (n.PolishedTuffSlab = "minecraft:polished_tuff_slab"),
          (n.PolishedTuffStairs = "minecraft:polished_tuff_stairs"),
          (n.PolishedTuffWall = "minecraft:polished_tuff_wall"),
          (n.Poppy = "minecraft:poppy"),
          (n.Portal = "minecraft:portal"),
          (n.Potatoes = "minecraft:potatoes"),
          (n.PowderSnow = "minecraft:powder_snow"),
          (n.PoweredComparator = "minecraft:powered_comparator"),
          (n.PoweredRepeater = "minecraft:powered_repeater"),
          (n.Prismarine = "minecraft:prismarine"),
          (n.PrismarineBrickDoubleSlab =
            "minecraft:prismarine_brick_double_slab"),
          (n.PrismarineBrickSlab = "minecraft:prismarine_brick_slab"),
          (n.PrismarineBricks = "minecraft:prismarine_bricks"),
          (n.PrismarineBricksStairs = "minecraft:prismarine_bricks_stairs"),
          (n.PrismarineDoubleSlab = "minecraft:prismarine_double_slab"),
          (n.PrismarineSlab = "minecraft:prismarine_slab"),
          (n.PrismarineStairs = "minecraft:prismarine_stairs"),
          (n.PrismarineWall = "minecraft:prismarine_wall"),
          (n.Pumpkin = "minecraft:pumpkin"),
          (n.PumpkinStem = "minecraft:pumpkin_stem"),
          (n.PurpleCandle = "minecraft:purple_candle"),
          (n.PurpleCandleCake = "minecraft:purple_candle_cake"),
          (n.PurpleCarpet = "minecraft:purple_carpet"),
          (n.PurpleConcrete = "minecraft:purple_concrete"),
          (n.PurpleConcretePowder = "minecraft:purple_concrete_powder"),
          (n.PurpleGlazedTerracotta = "minecraft:purple_glazed_terracotta"),
          (n.PurpleShulkerBox = "minecraft:purple_shulker_box"),
          (n.PurpleStainedGlass = "minecraft:purple_stained_glass"),
          (n.PurpleStainedGlassPane = "minecraft:purple_stained_glass_pane"),
          (n.PurpleTerracotta = "minecraft:purple_terracotta"),
          (n.PurpleWool = "minecraft:purple_wool"),
          (n.PurpurBlock = "minecraft:purpur_block"),
          (n.PurpurDoubleSlab = "minecraft:purpur_double_slab"),
          (n.PurpurPillar = "minecraft:purpur_pillar"),
          (n.PurpurSlab = "minecraft:purpur_slab"),
          (n.PurpurStairs = "minecraft:purpur_stairs"),
          (n.QuartzBlock = "minecraft:quartz_block"),
          (n.QuartzBricks = "minecraft:quartz_bricks"),
          (n.QuartzDoubleSlab = "minecraft:quartz_double_slab"),
          (n.QuartzOre = "minecraft:quartz_ore"),
          (n.QuartzPillar = "minecraft:quartz_pillar"),
          (n.QuartzSlab = "minecraft:quartz_slab"),
          (n.QuartzStairs = "minecraft:quartz_stairs"),
          (n.Rail = "minecraft:rail"),
          (n.RawCopperBlock = "minecraft:raw_copper_block"),
          (n.RawGoldBlock = "minecraft:raw_gold_block"),
          (n.RawIronBlock = "minecraft:raw_iron_block"),
          (n.RedCandle = "minecraft:red_candle"),
          (n.RedCandleCake = "minecraft:red_candle_cake"),
          (n.RedCarpet = "minecraft:red_carpet"),
          (n.RedConcrete = "minecraft:red_concrete"),
          (n.RedConcretePowder = "minecraft:red_concrete_powder"),
          (n.RedGlazedTerracotta = "minecraft:red_glazed_terracotta"),
          (n.RedMushroom = "minecraft:red_mushroom"),
          (n.RedMushroomBlock = "minecraft:red_mushroom_block"),
          (n.RedNetherBrick = "minecraft:red_nether_brick"),
          (n.RedNetherBrickDoubleSlab =
            "minecraft:red_nether_brick_double_slab"),
          (n.RedNetherBrickSlab = "minecraft:red_nether_brick_slab"),
          (n.RedNetherBrickStairs = "minecraft:red_nether_brick_stairs"),
          (n.RedNetherBrickWall = "minecraft:red_nether_brick_wall"),
          (n.RedSand = "minecraft:red_sand"),
          (n.RedSandstone = "minecraft:red_sandstone"),
          (n.RedSandstoneDoubleSlab = "minecraft:red_sandstone_double_slab"),
          (n.RedSandstoneSlab = "minecraft:red_sandstone_slab"),
          (n.RedSandstoneStairs = "minecraft:red_sandstone_stairs"),
          (n.RedSandstoneWall = "minecraft:red_sandstone_wall"),
          (n.RedShulkerBox = "minecraft:red_shulker_box"),
          (n.RedStainedGlass = "minecraft:red_stained_glass"),
          (n.RedStainedGlassPane = "minecraft:red_stained_glass_pane"),
          (n.RedTerracotta = "minecraft:red_terracotta"),
          (n.RedTulip = "minecraft:red_tulip"),
          (n.RedWool = "minecraft:red_wool"),
          (n.RedstoneBlock = "minecraft:redstone_block"),
          (n.RedstoneLamp = "minecraft:redstone_lamp"),
          (n.RedstoneOre = "minecraft:redstone_ore"),
          (n.RedstoneTorch = "minecraft:redstone_torch"),
          (n.RedstoneWire = "minecraft:redstone_wire"),
          (n.Reeds = "minecraft:reeds"),
          (n.ReinforcedDeepslate = "minecraft:reinforced_deepslate"),
          (n.RepeatingCommandBlock = "minecraft:repeating_command_block"),
          (n.ResinBlock = "minecraft:resin_block"),
          (n.ResinBrickDoubleSlab = "minecraft:resin_brick_double_slab"),
          (n.ResinBrickSlab = "minecraft:resin_brick_slab"),
          (n.ResinBrickStairs = "minecraft:resin_brick_stairs"),
          (n.ResinBrickWall = "minecraft:resin_brick_wall"),
          (n.ResinBricks = "minecraft:resin_bricks"),
          (n.ResinClump = "minecraft:resin_clump"),
          (n.RespawnAnchor = "minecraft:respawn_anchor"),
          (n.RoseBush = "minecraft:rose_bush"),
          (n.Sand = "minecraft:sand"),
          (n.Sandstone = "minecraft:sandstone"),
          (n.SandstoneDoubleSlab = "minecraft:sandstone_double_slab"),
          (n.SandstoneSlab = "minecraft:sandstone_slab"),
          (n.SandstoneStairs = "minecraft:sandstone_stairs"),
          (n.SandstoneWall = "minecraft:sandstone_wall"),
          (n.Scaffolding = "minecraft:scaffolding"),
          (n.Sculk = "minecraft:sculk"),
          (n.SculkCatalyst = "minecraft:sculk_catalyst"),
          (n.SculkSensor = "minecraft:sculk_sensor"),
          (n.SculkShrieker = "minecraft:sculk_shrieker"),
          (n.SculkVein = "minecraft:sculk_vein"),
          (n.SeaLantern = "minecraft:sea_lantern"),
          (n.SeaPickle = "minecraft:sea_pickle"),
          (n.Seagrass = "minecraft:seagrass"),
          (n.ShortDryGrass = "minecraft:short_dry_grass"),
          (n.ShortGrass = "minecraft:short_grass"),
          (n.Shroomlight = "minecraft:shroomlight"),
          (n.SilverGlazedTerracotta = "minecraft:silver_glazed_terracotta"),
          (n.SkeletonSkull = "minecraft:skeleton_skull"),
          (n.Slime = "minecraft:slime"),
          (n.SmallAmethystBud = "minecraft:small_amethyst_bud"),
          (n.SmallDripleafBlock = "minecraft:small_dripleaf_block"),
          (n.SmithingTable = "minecraft:smithing_table"),
          (n.Smoker = "minecraft:smoker"),
          (n.SmoothBasalt = "minecraft:smooth_basalt"),
          (n.SmoothQuartz = "minecraft:smooth_quartz"),
          (n.SmoothQuartzDoubleSlab = "minecraft:smooth_quartz_double_slab"),
          (n.SmoothQuartzSlab = "minecraft:smooth_quartz_slab"),
          (n.SmoothQuartzStairs = "minecraft:smooth_quartz_stairs"),
          (n.SmoothRedSandstone = "minecraft:smooth_red_sandstone"),
          (n.SmoothRedSandstoneDoubleSlab =
            "minecraft:smooth_red_sandstone_double_slab"),
          (n.SmoothRedSandstoneSlab = "minecraft:smooth_red_sandstone_slab"),
          (n.SmoothRedSandstoneStairs =
            "minecraft:smooth_red_sandstone_stairs"),
          (n.SmoothSandstone = "minecraft:smooth_sandstone"),
          (n.SmoothSandstoneDoubleSlab =
            "minecraft:smooth_sandstone_double_slab"),
          (n.SmoothSandstoneSlab = "minecraft:smooth_sandstone_slab"),
          (n.SmoothSandstoneStairs = "minecraft:smooth_sandstone_stairs"),
          (n.SmoothStone = "minecraft:smooth_stone"),
          (n.SmoothStoneDoubleSlab = "minecraft:smooth_stone_double_slab"),
          (n.SmoothStoneSlab = "minecraft:smooth_stone_slab"),
          (n.SnifferEgg = "minecraft:sniffer_egg"),
          (n.Snow = "minecraft:snow"),
          (n.SnowLayer = "minecraft:snow_layer"),
          (n.SoulCampfire = "minecraft:soul_campfire"),
          (n.SoulFire = "minecraft:soul_fire"),
          (n.SoulLantern = "minecraft:soul_lantern"),
          (n.SoulSand = "minecraft:soul_sand"),
          (n.SoulSoil = "minecraft:soul_soil"),
          (n.SoulTorch = "minecraft:soul_torch"),
          (n.Sponge = "minecraft:sponge"),
          (n.SporeBlossom = "minecraft:spore_blossom"),
          (n.SpruceButton = "minecraft:spruce_button"),
          (n.SpruceDoor = "minecraft:spruce_door"),
          (n.SpruceDoubleSlab = "minecraft:spruce_double_slab"),
          (n.SpruceFence = "minecraft:spruce_fence"),
          (n.SpruceFenceGate = "minecraft:spruce_fence_gate"),
          (n.SpruceHangingSign = "minecraft:spruce_hanging_sign"),
          (n.SpruceLeaves = "minecraft:spruce_leaves"),
          (n.SpruceLog = "minecraft:spruce_log"),
          (n.SprucePlanks = "minecraft:spruce_planks"),
          (n.SprucePressurePlate = "minecraft:spruce_pressure_plate"),
          (n.SpruceSapling = "minecraft:spruce_sapling"),
          (n.SpruceShelf = "minecraft:spruce_shelf"),
          (n.SpruceSlab = "minecraft:spruce_slab"),
          (n.SpruceStairs = "minecraft:spruce_stairs"),
          (n.SpruceStandingSign = "minecraft:spruce_standing_sign"),
          (n.SpruceTrapdoor = "minecraft:spruce_trapdoor"),
          (n.SpruceWallSign = "minecraft:spruce_wall_sign"),
          (n.SpruceWood = "minecraft:spruce_wood"),
          (n.StandingBanner = "minecraft:standing_banner"),
          (n.StandingSign = "minecraft:standing_sign"),
          (n.StickyPiston = "minecraft:sticky_piston"),
          (n.StickyPistonArmCollision =
            "minecraft:sticky_piston_arm_collision"),
          (n.Stone = "minecraft:stone"),
          (n.StoneBrickDoubleSlab = "minecraft:stone_brick_double_slab"),
          (n.StoneBrickSlab = "minecraft:stone_brick_slab"),
          (n.StoneBrickStairs = "minecraft:stone_brick_stairs"),
          (n.StoneBrickWall = "minecraft:stone_brick_wall"),
          (n.StoneBricks = "minecraft:stone_bricks"),
          (n.StoneButton = "minecraft:stone_button"),
          (n.StonePressurePlate = "minecraft:stone_pressure_plate"),
          (n.StoneStairs = "minecraft:stone_stairs"),
          (n.StonecutterBlock = "minecraft:stonecutter_block"),
          (n.StrippedAcaciaLog = "minecraft:stripped_acacia_log"),
          (n.StrippedAcaciaWood = "minecraft:stripped_acacia_wood"),
          (n.StrippedBambooBlock = "minecraft:stripped_bamboo_block"),
          (n.StrippedBirchLog = "minecraft:stripped_birch_log"),
          (n.StrippedBirchWood = "minecraft:stripped_birch_wood"),
          (n.StrippedCherryLog = "minecraft:stripped_cherry_log"),
          (n.StrippedCherryWood = "minecraft:stripped_cherry_wood"),
          (n.StrippedCrimsonHyphae = "minecraft:stripped_crimson_hyphae"),
          (n.StrippedCrimsonStem = "minecraft:stripped_crimson_stem"),
          (n.StrippedDarkOakLog = "minecraft:stripped_dark_oak_log"),
          (n.StrippedDarkOakWood = "minecraft:stripped_dark_oak_wood"),
          (n.StrippedJungleLog = "minecraft:stripped_jungle_log"),
          (n.StrippedJungleWood = "minecraft:stripped_jungle_wood"),
          (n.StrippedMangroveLog = "minecraft:stripped_mangrove_log"),
          (n.StrippedMangroveWood = "minecraft:stripped_mangrove_wood"),
          (n.StrippedOakLog = "minecraft:stripped_oak_log"),
          (n.StrippedOakWood = "minecraft:stripped_oak_wood"),
          (n.StrippedPaleOakLog = "minecraft:stripped_pale_oak_log"),
          (n.StrippedPaleOakWood = "minecraft:stripped_pale_oak_wood"),
          (n.StrippedSpruceLog = "minecraft:stripped_spruce_log"),
          (n.StrippedSpruceWood = "minecraft:stripped_spruce_wood"),
          (n.StrippedWarpedHyphae = "minecraft:stripped_warped_hyphae"),
          (n.StrippedWarpedStem = "minecraft:stripped_warped_stem"),
          (n.StructureBlock = "minecraft:structure_block"),
          (n.StructureVoid = "minecraft:structure_void"),
          (n.Sunflower = "minecraft:sunflower"),
          (n.SuspiciousGravel = "minecraft:suspicious_gravel"),
          (n.SuspiciousSand = "minecraft:suspicious_sand"),
          (n.SweetBerryBush = "minecraft:sweet_berry_bush"),
          (n.TallDryGrass = "minecraft:tall_dry_grass"),
          (n.TallGrass = "minecraft:tall_grass"),
          (n.Target = "minecraft:target"),
          (n.TintedGlass = "minecraft:tinted_glass"),
          (n.Tnt = "minecraft:tnt"),
          (n.Torch = "minecraft:torch"),
          (n.Torchflower = "minecraft:torchflower"),
          (n.TorchflowerCrop = "minecraft:torchflower_crop"),
          (n.Trapdoor = "minecraft:trapdoor"),
          (n.TrappedChest = "minecraft:trapped_chest"),
          (n.TrialSpawner = "minecraft:trial_spawner"),
          (n.TripWire = "minecraft:trip_wire"),
          (n.TripwireHook = "minecraft:tripwire_hook"),
          (n.TubeCoral = "minecraft:tube_coral"),
          (n.TubeCoralBlock = "minecraft:tube_coral_block"),
          (n.TubeCoralFan = "minecraft:tube_coral_fan"),
          (n.TubeCoralWallFan = "minecraft:tube_coral_wall_fan"),
          (n.Tuff = "minecraft:tuff"),
          (n.TuffBrickDoubleSlab = "minecraft:tuff_brick_double_slab"),
          (n.TuffBrickSlab = "minecraft:tuff_brick_slab"),
          (n.TuffBrickStairs = "minecraft:tuff_brick_stairs"),
          (n.TuffBrickWall = "minecraft:tuff_brick_wall"),
          (n.TuffBricks = "minecraft:tuff_bricks"),
          (n.TuffDoubleSlab = "minecraft:tuff_double_slab"),
          (n.TuffSlab = "minecraft:tuff_slab"),
          (n.TuffStairs = "minecraft:tuff_stairs"),
          (n.TuffWall = "minecraft:tuff_wall"),
          (n.TurtleEgg = "minecraft:turtle_egg"),
          (n.TwistingVines = "minecraft:twisting_vines"),
          (n.UnderwaterTnt = "minecraft:underwater_tnt"),
          (n.UnderwaterTorch = "minecraft:underwater_torch"),
          (n.UndyedShulkerBox = "minecraft:undyed_shulker_box"),
          (n.Unknown = "minecraft:unknown"),
          (n.UnlitRedstoneTorch = "minecraft:unlit_redstone_torch"),
          (n.UnpoweredComparator = "minecraft:unpowered_comparator"),
          (n.UnpoweredRepeater = "minecraft:unpowered_repeater"),
          (n.Vault = "minecraft:vault"),
          (n.VerdantFroglight = "minecraft:verdant_froglight"),
          (n.Vine = "minecraft:vine"),
          (n.WallBanner = "minecraft:wall_banner"),
          (n.WallSign = "minecraft:wall_sign"),
          (n.WarpedButton = "minecraft:warped_button"),
          (n.WarpedDoor = "minecraft:warped_door"),
          (n.WarpedDoubleSlab = "minecraft:warped_double_slab"),
          (n.WarpedFence = "minecraft:warped_fence"),
          (n.WarpedFenceGate = "minecraft:warped_fence_gate"),
          (n.WarpedFungus = "minecraft:warped_fungus"),
          (n.WarpedHangingSign = "minecraft:warped_hanging_sign"),
          (n.WarpedHyphae = "minecraft:warped_hyphae"),
          (n.WarpedNylium = "minecraft:warped_nylium"),
          (n.WarpedPlanks = "minecraft:warped_planks"),
          (n.WarpedPressurePlate = "minecraft:warped_pressure_plate"),
          (n.WarpedRoots = "minecraft:warped_roots"),
          (n.WarpedShelf = "minecraft:warped_shelf"),
          (n.WarpedSlab = "minecraft:warped_slab"),
          (n.WarpedStairs = "minecraft:warped_stairs"),
          (n.WarpedStandingSign = "minecraft:warped_standing_sign"),
          (n.WarpedStem = "minecraft:warped_stem"),
          (n.WarpedTrapdoor = "minecraft:warped_trapdoor"),
          (n.WarpedWallSign = "minecraft:warped_wall_sign"),
          (n.WarpedWartBlock = "minecraft:warped_wart_block"),
          (n.Water = "minecraft:water"),
          (n.Waterlily = "minecraft:waterlily"),
          (n.WaxedChiseledCopper = "minecraft:waxed_chiseled_copper"),
          (n.WaxedCopper = "minecraft:waxed_copper"),
          (n.WaxedCopperBars = "minecraft:waxed_copper_bars"),
          (n.WaxedCopperBulb = "minecraft:waxed_copper_bulb"),
          (n.WaxedCopperChain = "minecraft:waxed_copper_chain"),
          (n.WaxedCopperChest = "minecraft:waxed_copper_chest"),
          (n.WaxedCopperDoor = "minecraft:waxed_copper_door"),
          (n.WaxedCopperGolemStatue = "minecraft:waxed_copper_golem_statue"),
          (n.WaxedCopperGrate = "minecraft:waxed_copper_grate"),
          (n.WaxedCopperLantern = "minecraft:waxed_copper_lantern"),
          (n.WaxedCopperTrapdoor = "minecraft:waxed_copper_trapdoor"),
          (n.WaxedCutCopper = "minecraft:waxed_cut_copper"),
          (n.WaxedCutCopperSlab = "minecraft:waxed_cut_copper_slab"),
          (n.WaxedCutCopperStairs = "minecraft:waxed_cut_copper_stairs"),
          (n.WaxedDoubleCutCopperSlab =
            "minecraft:waxed_double_cut_copper_slab"),
          (n.WaxedExposedChiseledCopper =
            "minecraft:waxed_exposed_chiseled_copper"),
          (n.WaxedExposedCopper = "minecraft:waxed_exposed_copper"),
          (n.WaxedExposedCopperBars = "minecraft:waxed_exposed_copper_bars"),
          (n.WaxedExposedCopperBulb = "minecraft:waxed_exposed_copper_bulb"),
          (n.WaxedExposedCopperChain = "minecraft:waxed_exposed_copper_chain"),
          (n.WaxedExposedCopperChest = "minecraft:waxed_exposed_copper_chest"),
          (n.WaxedExposedCopperDoor = "minecraft:waxed_exposed_copper_door"),
          (n.WaxedExposedCopperGolemStatue =
            "minecraft:waxed_exposed_copper_golem_statue"),
          (n.WaxedExposedCopperGrate = "minecraft:waxed_exposed_copper_grate"),
          (n.WaxedExposedCopperLantern =
            "minecraft:waxed_exposed_copper_lantern"),
          (n.WaxedExposedCopperTrapdoor =
            "minecraft:waxed_exposed_copper_trapdoor"),
          (n.WaxedExposedCutCopper = "minecraft:waxed_exposed_cut_copper"),
          (n.WaxedExposedCutCopperSlab =
            "minecraft:waxed_exposed_cut_copper_slab"),
          (n.WaxedExposedCutCopperStairs =
            "minecraft:waxed_exposed_cut_copper_stairs"),
          (n.WaxedExposedDoubleCutCopperSlab =
            "minecraft:waxed_exposed_double_cut_copper_slab"),
          (n.WaxedExposedLightningRod =
            "minecraft:waxed_exposed_lightning_rod"),
          (n.WaxedLightningRod = "minecraft:waxed_lightning_rod"),
          (n.WaxedOxidizedChiseledCopper =
            "minecraft:waxed_oxidized_chiseled_copper"),
          (n.WaxedOxidizedCopper = "minecraft:waxed_oxidized_copper"),
          (n.WaxedOxidizedCopperBars = "minecraft:waxed_oxidized_copper_bars"),
          (n.WaxedOxidizedCopperBulb = "minecraft:waxed_oxidized_copper_bulb"),
          (n.WaxedOxidizedCopperChain =
            "minecraft:waxed_oxidized_copper_chain"),
          (n.WaxedOxidizedCopperChest =
            "minecraft:waxed_oxidized_copper_chest"),
          (n.WaxedOxidizedCopperDoor = "minecraft:waxed_oxidized_copper_door"),
          (n.WaxedOxidizedCopperGolemStatue =
            "minecraft:waxed_oxidized_copper_golem_statue"),
          (n.WaxedOxidizedCopperGrate =
            "minecraft:waxed_oxidized_copper_grate"),
          (n.WaxedOxidizedCopperLantern =
            "minecraft:waxed_oxidized_copper_lantern"),
          (n.WaxedOxidizedCopperTrapdoor =
            "minecraft:waxed_oxidized_copper_trapdoor"),
          (n.WaxedOxidizedCutCopper = "minecraft:waxed_oxidized_cut_copper"),
          (n.WaxedOxidizedCutCopperSlab =
            "minecraft:waxed_oxidized_cut_copper_slab"),
          (n.WaxedOxidizedCutCopperStairs =
            "minecraft:waxed_oxidized_cut_copper_stairs"),
          (n.WaxedOxidizedDoubleCutCopperSlab =
            "minecraft:waxed_oxidized_double_cut_copper_slab"),
          (n.WaxedOxidizedLightningRod =
            "minecraft:waxed_oxidized_lightning_rod"),
          (n.WaxedWeatheredChiseledCopper =
            "minecraft:waxed_weathered_chiseled_copper"),
          (n.WaxedWeatheredCopper = "minecraft:waxed_weathered_copper"),
          (n.WaxedWeatheredCopperBars =
            "minecraft:waxed_weathered_copper_bars"),
          (n.WaxedWeatheredCopperBulb =
            "minecraft:waxed_weathered_copper_bulb"),
          (n.WaxedWeatheredCopperChain =
            "minecraft:waxed_weathered_copper_chain"),
          (n.WaxedWeatheredCopperChest =
            "minecraft:waxed_weathered_copper_chest"),
          (n.WaxedWeatheredCopperDoor =
            "minecraft:waxed_weathered_copper_door"),
          (n.WaxedWeatheredCopperGolemStatue =
            "minecraft:waxed_weathered_copper_golem_statue"),
          (n.WaxedWeatheredCopperGrate =
            "minecraft:waxed_weathered_copper_grate"),
          (n.WaxedWeatheredCopperLantern =
            "minecraft:waxed_weathered_copper_lantern"),
          (n.WaxedWeatheredCopperTrapdoor =
            "minecraft:waxed_weathered_copper_trapdoor"),
          (n.WaxedWeatheredCutCopper = "minecraft:waxed_weathered_cut_copper"),
          (n.WaxedWeatheredCutCopperSlab =
            "minecraft:waxed_weathered_cut_copper_slab"),
          (n.WaxedWeatheredCutCopperStairs =
            "minecraft:waxed_weathered_cut_copper_stairs"),
          (n.WaxedWeatheredDoubleCutCopperSlab =
            "minecraft:waxed_weathered_double_cut_copper_slab"),
          (n.WaxedWeatheredLightningRod =
            "minecraft:waxed_weathered_lightning_rod"),
          (n.WeatheredChiseledCopper = "minecraft:weathered_chiseled_copper"),
          (n.WeatheredCopper = "minecraft:weathered_copper"),
          (n.WeatheredCopperBars = "minecraft:weathered_copper_bars"),
          (n.WeatheredCopperBulb = "minecraft:weathered_copper_bulb"),
          (n.WeatheredCopperChain = "minecraft:weathered_copper_chain"),
          (n.WeatheredCopperChest = "minecraft:weathered_copper_chest"),
          (n.WeatheredCopperDoor = "minecraft:weathered_copper_door"),
          (n.WeatheredCopperGolemStatue =
            "minecraft:weathered_copper_golem_statue"),
          (n.WeatheredCopperGrate = "minecraft:weathered_copper_grate"),
          (n.WeatheredCopperLantern = "minecraft:weathered_copper_lantern"),
          (n.WeatheredCopperTrapdoor = "minecraft:weathered_copper_trapdoor"),
          (n.WeatheredCutCopper = "minecraft:weathered_cut_copper"),
          (n.WeatheredCutCopperSlab = "minecraft:weathered_cut_copper_slab"),
          (n.WeatheredCutCopperStairs =
            "minecraft:weathered_cut_copper_stairs"),
          (n.WeatheredDoubleCutCopperSlab =
            "minecraft:weathered_double_cut_copper_slab"),
          (n.WeatheredLightningRod = "minecraft:weathered_lightning_rod"),
          (n.Web = "minecraft:web"),
          (n.WeepingVines = "minecraft:weeping_vines"),
          (n.WetSponge = "minecraft:wet_sponge"),
          (n.Wheat = "minecraft:wheat"),
          (n.WhiteCandle = "minecraft:white_candle"),
          (n.WhiteCandleCake = "minecraft:white_candle_cake"),
          (n.WhiteCarpet = "minecraft:white_carpet"),
          (n.WhiteConcrete = "minecraft:white_concrete"),
          (n.WhiteConcretePowder = "minecraft:white_concrete_powder"),
          (n.WhiteGlazedTerracotta = "minecraft:white_glazed_terracotta"),
          (n.WhiteShulkerBox = "minecraft:white_shulker_box"),
          (n.WhiteStainedGlass = "minecraft:white_stained_glass"),
          (n.WhiteStainedGlassPane = "minecraft:white_stained_glass_pane"),
          (n.WhiteTerracotta = "minecraft:white_terracotta"),
          (n.WhiteTulip = "minecraft:white_tulip"),
          (n.WhiteWool = "minecraft:white_wool"),
          (n.Wildflowers = "minecraft:wildflowers"),
          (n.WitherRose = "minecraft:wither_rose"),
          (n.WitherSkeletonSkull = "minecraft:wither_skeleton_skull"),
          (n.WoodenButton = "minecraft:wooden_button"),
          (n.WoodenDoor = "minecraft:wooden_door"),
          (n.WoodenPressurePlate = "minecraft:wooden_pressure_plate"),
          (n.YellowCandle = "minecraft:yellow_candle"),
          (n.YellowCandleCake = "minecraft:yellow_candle_cake"),
          (n.YellowCarpet = "minecraft:yellow_carpet"),
          (n.YellowConcrete = "minecraft:yellow_concrete"),
          (n.YellowConcretePowder = "minecraft:yellow_concrete_powder"),
          (n.YellowGlazedTerracotta = "minecraft:yellow_glazed_terracotta"),
          (n.YellowShulkerBox = "minecraft:yellow_shulker_box"),
          (n.YellowStainedGlass = "minecraft:yellow_stained_glass"),
          (n.YellowStainedGlassPane = "minecraft:yellow_stained_glass_pane"),
          (n.YellowTerracotta = "minecraft:yellow_terracotta"),
          (n.YellowWool = "minecraft:yellow_wool"),
          (n.ZombieHead = "minecraft:zombie_head"),
          n),
        h =
          (((i = h || {}).ControlSchemeCamera =
            "minecraft:control_scheme_camera"),
          (i.FirstPerson = "minecraft:first_person"),
          (i.FixedBoom = "minecraft:fixed_boom"),
          (i.FollowOrbit = "minecraft:follow_orbit"),
          (i.Free = "minecraft:free"),
          (i.ThirdPerson = "minecraft:third_person"),
          (i.ThirdPersonFront = "minecraft:third_person_front"),
          i),
        b =
          (((o = b || {}).Chorusfruit = "minecraft:chorusfruit"),
          (o.EnderPearl = "minecraft:ender_pearl"),
          (o.GoatHorn = "minecraft:goat_horn"),
          (o.Shield = "minecraft:shield"),
          (o.Spear = "minecraft:spear"),
          (o.WindCharge = "minecraft:wind_charge"),
          o),
        k =
          (((c = k || {}).Nether = "minecraft:nether"),
          (c.Overworld = "minecraft:overworld"),
          (c.TheEnd = "minecraft:the_end"),
          c),
        w =
          (((s = w || {}).Absorption = "minecraft:absorption"),
          (s.BadOmen = "minecraft:bad_omen"),
          (s.Blindness = "minecraft:blindness"),
          (s.BreathOfTheNautilus = "minecraft:breath_of_the_nautilus"),
          (s.ConduitPower = "minecraft:conduit_power"),
          (s.Darkness = "minecraft:darkness"),
          (s.FatalPoison = "minecraft:fatal_poison"),
          (s.FireResistance = "minecraft:fire_resistance"),
          (s.Haste = "minecraft:haste"),
          (s.HealthBoost = "minecraft:health_boost"),
          (s.Hunger = "minecraft:hunger"),
          (s.Infested = "minecraft:infested"),
          (s.InstantDamage = "minecraft:instant_damage"),
          (s.InstantHealth = "minecraft:instant_health"),
          (s.Invisibility = "minecraft:invisibility"),
          (s.JumpBoost = "minecraft:jump_boost"),
          (s.Levitation = "minecraft:levitation"),
          (s.MiningFatigue = "minecraft:mining_fatigue"),
          (s.Nausea = "minecraft:nausea"),
          (s.NightVision = "minecraft:night_vision"),
          (s.Oozing = "minecraft:oozing"),
          (s.Poison = "minecraft:poison"),
          (s.RaidOmen = "minecraft:raid_omen"),
          (s.Regeneration = "minecraft:regeneration"),
          (s.Resistance = "minecraft:resistance"),
          (s.Saturation = "minecraft:saturation"),
          (s.SlowFalling = "minecraft:slow_falling"),
          (s.Slowness = "minecraft:slowness"),
          (s.Speed = "minecraft:speed"),
          (s.Strength = "minecraft:strength"),
          (s.TrialOmen = "minecraft:trial_omen"),
          (s.VillageHero = "minecraft:village_hero"),
          (s.WaterBreathing = "minecraft:water_breathing"),
          (s.Weakness = "minecraft:weakness"),
          (s.Weaving = "minecraft:weaving"),
          (s.WindCharged = "minecraft:wind_charged"),
          (s.Wither = "minecraft:wither"),
          s),
        S =
          (((l = S || {}).AquaAffinity = "minecraft:aqua_affinity"),
          (l.BaneOfArthropods = "minecraft:bane_of_arthropods"),
          (l.Binding = "minecraft:binding"),
          (l.BlastProtection = "minecraft:blast_protection"),
          (l.BowInfinity = "minecraft:infinity"),
          (l.Breach = "minecraft:breach"),
          (l.Channeling = "minecraft:channeling"),
          (l.Density = "minecraft:density"),
          (l.DepthStrider = "minecraft:depth_strider"),
          (l.Efficiency = "minecraft:efficiency"),
          (l.FeatherFalling = "minecraft:feather_falling"),
          (l.FireAspect = "minecraft:fire_aspect"),
          (l.FireProtection = "minecraft:fire_protection"),
          (l.Flame = "minecraft:flame"),
          (l.Fortune = "minecraft:fortune"),
          (l.FrostWalker = "minecraft:frost_walker"),
          (l.Impaling = "minecraft:impaling"),
          (l.Knockback = "minecraft:knockback"),
          (l.Looting = "minecraft:looting"),
          (l.Loyalty = "minecraft:loyalty"),
          (l.LuckOfTheSea = "minecraft:luck_of_the_sea"),
          (l.Lunge = "minecraft:lunge"),
          (l.Lure = "minecraft:lure"),
          (l.Mending = "minecraft:mending"),
          (l.Multishot = "minecraft:multishot"),
          (l.Piercing = "minecraft:piercing"),
          (l.Power = "minecraft:power"),
          (l.ProjectileProtection = "minecraft:projectile_protection"),
          (l.Protection = "minecraft:protection"),
          (l.Punch = "minecraft:punch"),
          (l.QuickCharge = "minecraft:quick_charge"),
          (l.Respiration = "minecraft:respiration"),
          (l.Riptide = "minecraft:riptide"),
          (l.Sharpness = "minecraft:sharpness"),
          (l.SilkTouch = "minecraft:silk_touch"),
          (l.Smite = "minecraft:smite"),
          (l.SoulSpeed = "minecraft:soul_speed"),
          (l.SwiftSneak = "minecraft:swift_sneak"),
          (l.Thorns = "minecraft:thorns"),
          (l.Unbreaking = "minecraft:unbreaking"),
          (l.Vanishing = "minecraft:vanishing"),
          (l.WindBurst = "minecraft:wind_burst"),
          l),
        y =
          (((m = y || {}).Agent = "minecraft:agent"),
          (m.Allay = "minecraft:allay"),
          (m.AreaEffectCloud = "minecraft:area_effect_cloud"),
          (m.Armadillo = "minecraft:armadillo"),
          (m.ArmorStand = "minecraft:armor_stand"),
          (m.Arrow = "minecraft:arrow"),
          (m.Axolotl = "minecraft:axolotl"),
          (m.Bat = "minecraft:bat"),
          (m.Bee = "minecraft:bee"),
          (m.Blaze = "minecraft:blaze"),
          (m.Boat = "minecraft:boat"),
          (m.Bogged = "minecraft:bogged"),
          (m.Breeze = "minecraft:breeze"),
          (m.BreezeWindChargeProjectile =
            "minecraft:breeze_wind_charge_projectile"),
          (m.Camel = "minecraft:camel"),
          (m.CamelHusk = "minecraft:camel_husk"),
          (m.Cat = "minecraft:cat"),
          (m.CaveSpider = "minecraft:cave_spider"),
          (m.ChestBoat = "minecraft:chest_boat"),
          (m.ChestMinecart = "minecraft:chest_minecart"),
          (m.Chicken = "minecraft:chicken"),
          (m.Cod = "minecraft:cod"),
          (m.CommandBlockMinecart = "minecraft:command_block_minecart"),
          (m.CopperGolem = "minecraft:copper_golem"),
          (m.Cow = "minecraft:cow"),
          (m.Creaking = "minecraft:creaking"),
          (m.Creeper = "minecraft:creeper"),
          (m.Dolphin = "minecraft:dolphin"),
          (m.Donkey = "minecraft:donkey"),
          (m.DragonFireball = "minecraft:dragon_fireball"),
          (m.Drowned = "minecraft:drowned"),
          (m.Egg = "minecraft:egg"),
          (m.ElderGuardian = "minecraft:elder_guardian"),
          (m.EnderCrystal = "minecraft:ender_crystal"),
          (m.EnderDragon = "minecraft:ender_dragon"),
          (m.EnderPearl = "minecraft:ender_pearl"),
          (m.Enderman = "minecraft:enderman"),
          (m.Endermite = "minecraft:endermite"),
          (m.EvocationIllager = "minecraft:evocation_illager"),
          (m.EyeOfEnderSignal = "minecraft:eye_of_ender_signal"),
          (m.Fireball = "minecraft:fireball"),
          (m.FireworksRocket = "minecraft:fireworks_rocket"),
          (m.FishingHook = "minecraft:fishing_hook"),
          (m.Fox = "minecraft:fox"),
          (m.Frog = "minecraft:frog"),
          (m.Ghast = "minecraft:ghast"),
          (m.GlowSquid = "minecraft:glow_squid"),
          (m.Goat = "minecraft:goat"),
          (m.Guardian = "minecraft:guardian"),
          (m.HappyGhast = "minecraft:happy_ghast"),
          (m.Hoglin = "minecraft:hoglin"),
          (m.HopperMinecart = "minecraft:hopper_minecart"),
          (m.Horse = "minecraft:horse"),
          (m.Husk = "minecraft:husk"),
          (m.IronGolem = "minecraft:iron_golem"),
          (m.LightningBolt = "minecraft:lightning_bolt"),
          (m.LingeringPotion = "minecraft:lingering_potion"),
          (m.Llama = "minecraft:llama"),
          (m.LlamaSpit = "minecraft:llama_spit"),
          (m.MagmaCube = "minecraft:magma_cube"),
          (m.Minecart = "minecraft:minecart"),
          (m.Mooshroom = "minecraft:mooshroom"),
          (m.Mule = "minecraft:mule"),
          (m.Nautilus = "minecraft:nautilus"),
          (m.Npc = "minecraft:npc"),
          (m.Ocelot = "minecraft:ocelot"),
          (m.OminousItemSpawner = "minecraft:ominous_item_spawner"),
          (m.Panda = "minecraft:panda"),
          (m.Parched = "minecraft:parched"),
          (m.Parrot = "minecraft:parrot"),
          (m.Phantom = "minecraft:phantom"),
          (m.Pig = "minecraft:pig"),
          (m.Piglin = "minecraft:piglin"),
          (m.PiglinBrute = "minecraft:piglin_brute"),
          (m.Pillager = "minecraft:pillager"),
          (m.Player = "minecraft:player"),
          (m.PolarBear = "minecraft:polar_bear"),
          (m.Pufferfish = "minecraft:pufferfish"),
          (m.Rabbit = "minecraft:rabbit"),
          (m.Ravager = "minecraft:ravager"),
          (m.Salmon = "minecraft:salmon"),
          (m.Sheep = "minecraft:sheep"),
          (m.Shulker = "minecraft:shulker"),
          (m.ShulkerBullet = "minecraft:shulker_bullet"),
          (m.Silverfish = "minecraft:silverfish"),
          (m.Skeleton = "minecraft:skeleton"),
          (m.SkeletonHorse = "minecraft:skeleton_horse"),
          (m.Slime = "minecraft:slime"),
          (m.SmallFireball = "minecraft:small_fireball"),
          (m.Sniffer = "minecraft:sniffer"),
          (m.SnowGolem = "minecraft:snow_golem"),
          (m.Snowball = "minecraft:snowball"),
          (m.Spider = "minecraft:spider"),
          (m.SplashPotion = "minecraft:splash_potion"),
          (m.Squid = "minecraft:squid"),
          (m.Stray = "minecraft:stray"),
          (m.Strider = "minecraft:strider"),
          (m.Tadpole = "minecraft:tadpole"),
          (m.ThrownTrident = "minecraft:thrown_trident"),
          (m.Tnt = "minecraft:tnt"),
          (m.TntMinecart = "minecraft:tnt_minecart"),
          (m.TraderLlama = "minecraft:trader_llama"),
          (m.TripodCamera = "minecraft:tripod_camera"),
          (m.Tropicalfish = "minecraft:tropicalfish"),
          (m.Turtle = "minecraft:turtle"),
          (m.Vex = "minecraft:vex"),
          (m.Villager = "minecraft:villager"),
          (m.VillagerV2 = "minecraft:villager_v2"),
          (m.Vindicator = "minecraft:vindicator"),
          (m.WanderingTrader = "minecraft:wandering_trader"),
          (m.Warden = "minecraft:warden"),
          (m.WindChargeProjectile = "minecraft:wind_charge_projectile"),
          (m.Witch = "minecraft:witch"),
          (m.Wither = "minecraft:wither"),
          (m.WitherSkeleton = "minecraft:wither_skeleton"),
          (m.WitherSkull = "minecraft:wither_skull"),
          (m.WitherSkullDangerous = "minecraft:wither_skull_dangerous"),
          (m.Wolf = "minecraft:wolf"),
          (m.XpBottle = "minecraft:xp_bottle"),
          (m.XpOrb = "minecraft:xp_orb"),
          (m.Zoglin = "minecraft:zoglin"),
          (m.Zombie = "minecraft:zombie"),
          (m.ZombieHorse = "minecraft:zombie_horse"),
          (m.ZombieNautilus = "minecraft:zombie_nautilus"),
          (m.ZombiePigman = "minecraft:zombie_pigman"),
          (m.ZombieVillager = "minecraft:zombie_villager"),
          (m.ZombieVillagerV2 = "minecraft:zombie_villager_v2"),
          m),
        C =
          (((d = C || {}).AncientCity = "minecraft:ancient_city"),
          (d.BastionRemnant = "minecraft:bastion_remnant"),
          (d.BuriedTreasure = "minecraft:buried_treasure"),
          (d.EndCity = "minecraft:end_city"),
          (d.Fortress = "minecraft:fortress"),
          (d.Mansion = "minecraft:mansion"),
          (d.Mineshaft = "minecraft:mineshaft"),
          (d.Monument = "minecraft:monument"),
          (d.PillagerOutpost = "minecraft:pillager_outpost"),
          (d.RuinedPortal = "minecraft:ruined_portal"),
          (d.Ruins = "minecraft:ruins"),
          (d.Shipwreck = "minecraft:shipwreck"),
          (d.Stronghold = "minecraft:stronghold"),
          (d.Temple = "minecraft:temple"),
          (d.TrailRuins = "minecraft:trail_ruins"),
          (d.TrialChambers = "minecraft:trial_chambers"),
          (d.Village = "minecraft:village"),
          d),
        x =
          (((_ = x || {}).AcaciaBoat = "minecraft:acacia_boat"),
          (_.AcaciaButton = "minecraft:acacia_button"),
          (_.AcaciaChestBoat = "minecraft:acacia_chest_boat"),
          (_.AcaciaDoor = "minecraft:acacia_door"),
          (_.AcaciaFence = "minecraft:acacia_fence"),
          (_.AcaciaFenceGate = "minecraft:acacia_fence_gate"),
          (_.AcaciaHangingSign = "minecraft:acacia_hanging_sign"),
          (_.AcaciaLeaves = "minecraft:acacia_leaves"),
          (_.AcaciaLog = "minecraft:acacia_log"),
          (_.AcaciaPlanks = "minecraft:acacia_planks"),
          (_.AcaciaPressurePlate = "minecraft:acacia_pressure_plate"),
          (_.AcaciaSapling = "minecraft:acacia_sapling"),
          (_.AcaciaShelf = "minecraft:acacia_shelf"),
          (_.AcaciaSign = "minecraft:acacia_sign"),
          (_.AcaciaSlab = "minecraft:acacia_slab"),
          (_.AcaciaStairs = "minecraft:acacia_stairs"),
          (_.AcaciaTrapdoor = "minecraft:acacia_trapdoor"),
          (_.AcaciaWood = "minecraft:acacia_wood"),
          (_.ActivatorRail = "minecraft:activator_rail"),
          (_.AllaySpawnEgg = "minecraft:allay_spawn_egg"),
          (_.Allium = "minecraft:allium"),
          (_.Allow = "minecraft:allow"),
          (_.AmethystBlock = "minecraft:amethyst_block"),
          (_.AmethystCluster = "minecraft:amethyst_cluster"),
          (_.AmethystShard = "minecraft:amethyst_shard"),
          (_.AncientDebris = "minecraft:ancient_debris"),
          (_.Andesite = "minecraft:andesite"),
          (_.AndesiteSlab = "minecraft:andesite_slab"),
          (_.AndesiteStairs = "minecraft:andesite_stairs"),
          (_.AndesiteWall = "minecraft:andesite_wall"),
          (_.AnglerPotterySherd = "minecraft:angler_pottery_sherd"),
          (_.Anvil = "minecraft:anvil"),
          (_.Apple = "minecraft:apple"),
          (_.ArcherPotterySherd = "minecraft:archer_pottery_sherd"),
          (_.ArmadilloScute = "minecraft:armadillo_scute"),
          (_.ArmadilloSpawnEgg = "minecraft:armadillo_spawn_egg"),
          (_.ArmorStand = "minecraft:armor_stand"),
          (_.ArmsUpPotterySherd = "minecraft:arms_up_pottery_sherd"),
          (_.Arrow = "minecraft:arrow"),
          (_.AxolotlBucket = "minecraft:axolotl_bucket"),
          (_.AxolotlSpawnEgg = "minecraft:axolotl_spawn_egg"),
          (_.Azalea = "minecraft:azalea"),
          (_.AzaleaLeaves = "minecraft:azalea_leaves"),
          (_.AzaleaLeavesFlowered = "minecraft:azalea_leaves_flowered"),
          (_.AzureBluet = "minecraft:azure_bluet"),
          (_.BakedPotato = "minecraft:baked_potato"),
          (_.Bamboo = "minecraft:bamboo"),
          (_.BambooBlock = "minecraft:bamboo_block"),
          (_.BambooButton = "minecraft:bamboo_button"),
          (_.BambooChestRaft = "minecraft:bamboo_chest_raft"),
          (_.BambooDoor = "minecraft:bamboo_door"),
          (_.BambooFence = "minecraft:bamboo_fence"),
          (_.BambooFenceGate = "minecraft:bamboo_fence_gate"),
          (_.BambooHangingSign = "minecraft:bamboo_hanging_sign"),
          (_.BambooMosaic = "minecraft:bamboo_mosaic"),
          (_.BambooMosaicSlab = "minecraft:bamboo_mosaic_slab"),
          (_.BambooMosaicStairs = "minecraft:bamboo_mosaic_stairs"),
          (_.BambooPlanks = "minecraft:bamboo_planks"),
          (_.BambooPressurePlate = "minecraft:bamboo_pressure_plate"),
          (_.BambooRaft = "minecraft:bamboo_raft"),
          (_.BambooShelf = "minecraft:bamboo_shelf"),
          (_.BambooSign = "minecraft:bamboo_sign"),
          (_.BambooSlab = "minecraft:bamboo_slab"),
          (_.BambooStairs = "minecraft:bamboo_stairs"),
          (_.BambooTrapdoor = "minecraft:bamboo_trapdoor"),
          (_.Banner = "minecraft:banner"),
          (_.Barrel = "minecraft:barrel"),
          (_.Barrier = "minecraft:barrier"),
          (_.Basalt = "minecraft:basalt"),
          (_.BatSpawnEgg = "minecraft:bat_spawn_egg"),
          (_.Beacon = "minecraft:beacon"),
          (_.Bed = "minecraft:bed"),
          (_.Bedrock = "minecraft:bedrock"),
          (_.BeeNest = "minecraft:bee_nest"),
          (_.BeeSpawnEgg = "minecraft:bee_spawn_egg"),
          (_.Beef = "minecraft:beef"),
          (_.Beehive = "minecraft:beehive"),
          (_.Beetroot = "minecraft:beetroot"),
          (_.BeetrootSeeds = "minecraft:beetroot_seeds"),
          (_.BeetrootSoup = "minecraft:beetroot_soup"),
          (_.Bell = "minecraft:bell"),
          (_.BigDripleaf = "minecraft:big_dripleaf"),
          (_.BirchBoat = "minecraft:birch_boat"),
          (_.BirchButton = "minecraft:birch_button"),
          (_.BirchChestBoat = "minecraft:birch_chest_boat"),
          (_.BirchDoor = "minecraft:birch_door"),
          (_.BirchFence = "minecraft:birch_fence"),
          (_.BirchFenceGate = "minecraft:birch_fence_gate"),
          (_.BirchHangingSign = "minecraft:birch_hanging_sign"),
          (_.BirchLeaves = "minecraft:birch_leaves"),
          (_.BirchLog = "minecraft:birch_log"),
          (_.BirchPlanks = "minecraft:birch_planks"),
          (_.BirchPressurePlate = "minecraft:birch_pressure_plate"),
          (_.BirchSapling = "minecraft:birch_sapling"),
          (_.BirchShelf = "minecraft:birch_shelf"),
          (_.BirchSign = "minecraft:birch_sign"),
          (_.BirchSlab = "minecraft:birch_slab"),
          (_.BirchStairs = "minecraft:birch_stairs"),
          (_.BirchTrapdoor = "minecraft:birch_trapdoor"),
          (_.BirchWood = "minecraft:birch_wood"),
          (_.BlackBundle = "minecraft:black_bundle"),
          (_.BlackCandle = "minecraft:black_candle"),
          (_.BlackCarpet = "minecraft:black_carpet"),
          (_.BlackConcrete = "minecraft:black_concrete"),
          (_.BlackConcretePowder = "minecraft:black_concrete_powder"),
          (_.BlackDye = "minecraft:black_dye"),
          (_.BlackGlazedTerracotta = "minecraft:black_glazed_terracotta"),
          (_.BlackHarness = "minecraft:black_harness"),
          (_.BlackShulkerBox = "minecraft:black_shulker_box"),
          (_.BlackStainedGlass = "minecraft:black_stained_glass"),
          (_.BlackStainedGlassPane = "minecraft:black_stained_glass_pane"),
          (_.BlackTerracotta = "minecraft:black_terracotta"),
          (_.BlackWool = "minecraft:black_wool"),
          (_.Blackstone = "minecraft:blackstone"),
          (_.BlackstoneSlab = "minecraft:blackstone_slab"),
          (_.BlackstoneStairs = "minecraft:blackstone_stairs"),
          (_.BlackstoneWall = "minecraft:blackstone_wall"),
          (_.BladePotterySherd = "minecraft:blade_pottery_sherd"),
          (_.BlastFurnace = "minecraft:blast_furnace"),
          (_.BlazePowder = "minecraft:blaze_powder"),
          (_.BlazeRod = "minecraft:blaze_rod"),
          (_.BlazeSpawnEgg = "minecraft:blaze_spawn_egg"),
          (_.BlueBundle = "minecraft:blue_bundle"),
          (_.BlueCandle = "minecraft:blue_candle"),
          (_.BlueCarpet = "minecraft:blue_carpet"),
          (_.BlueConcrete = "minecraft:blue_concrete"),
          (_.BlueConcretePowder = "minecraft:blue_concrete_powder"),
          (_.BlueDye = "minecraft:blue_dye"),
          (_.BlueEgg = "minecraft:blue_egg"),
          (_.BlueGlazedTerracotta = "minecraft:blue_glazed_terracotta"),
          (_.BlueHarness = "minecraft:blue_harness"),
          (_.BlueIce = "minecraft:blue_ice"),
          (_.BlueOrchid = "minecraft:blue_orchid"),
          (_.BlueShulkerBox = "minecraft:blue_shulker_box"),
          (_.BlueStainedGlass = "minecraft:blue_stained_glass"),
          (_.BlueStainedGlassPane = "minecraft:blue_stained_glass_pane"),
          (_.BlueTerracotta = "minecraft:blue_terracotta"),
          (_.BlueWool = "minecraft:blue_wool"),
          (_.BoggedSpawnEgg = "minecraft:bogged_spawn_egg"),
          (_.BoltArmorTrimSmithingTemplate =
            "minecraft:bolt_armor_trim_smithing_template"),
          (_.Bone = "minecraft:bone"),
          (_.BoneBlock = "minecraft:bone_block"),
          (_.BoneMeal = "minecraft:bone_meal"),
          (_.Book = "minecraft:book"),
          (_.Bookshelf = "minecraft:bookshelf"),
          (_.BorderBlock = "minecraft:border_block"),
          (_.BordureIndentedBannerPattern =
            "minecraft:bordure_indented_banner_pattern"),
          (_.Bow = "minecraft:bow"),
          (_.Bowl = "minecraft:bowl"),
          (_.BrainCoral = "minecraft:brain_coral"),
          (_.BrainCoralBlock = "minecraft:brain_coral_block"),
          (_.BrainCoralFan = "minecraft:brain_coral_fan"),
          (_.Bread = "minecraft:bread"),
          (_.BreezeRod = "minecraft:breeze_rod"),
          (_.BreezeSpawnEgg = "minecraft:breeze_spawn_egg"),
          (_.BrewerPotterySherd = "minecraft:brewer_pottery_sherd"),
          (_.BrewingStand = "minecraft:brewing_stand"),
          (_.Brick = "minecraft:brick"),
          (_.BrickBlock = "minecraft:brick_block"),
          (_.BrickSlab = "minecraft:brick_slab"),
          (_.BrickStairs = "minecraft:brick_stairs"),
          (_.BrickWall = "minecraft:brick_wall"),
          (_.BrownBundle = "minecraft:brown_bundle"),
          (_.BrownCandle = "minecraft:brown_candle"),
          (_.BrownCarpet = "minecraft:brown_carpet"),
          (_.BrownConcrete = "minecraft:brown_concrete"),
          (_.BrownConcretePowder = "minecraft:brown_concrete_powder"),
          (_.BrownDye = "minecraft:brown_dye"),
          (_.BrownEgg = "minecraft:brown_egg"),
          (_.BrownGlazedTerracotta = "minecraft:brown_glazed_terracotta"),
          (_.BrownHarness = "minecraft:brown_harness"),
          (_.BrownMushroom = "minecraft:brown_mushroom"),
          (_.BrownMushroomBlock = "minecraft:brown_mushroom_block"),
          (_.BrownShulkerBox = "minecraft:brown_shulker_box"),
          (_.BrownStainedGlass = "minecraft:brown_stained_glass"),
          (_.BrownStainedGlassPane = "minecraft:brown_stained_glass_pane"),
          (_.BrownTerracotta = "minecraft:brown_terracotta"),
          (_.BrownWool = "minecraft:brown_wool"),
          (_.Brush = "minecraft:brush"),
          (_.BubbleCoral = "minecraft:bubble_coral"),
          (_.BubbleCoralBlock = "minecraft:bubble_coral_block"),
          (_.BubbleCoralFan = "minecraft:bubble_coral_fan"),
          (_.Bucket = "minecraft:bucket"),
          (_.BuddingAmethyst = "minecraft:budding_amethyst"),
          (_.Bundle = "minecraft:bundle"),
          (_.BurnPotterySherd = "minecraft:burn_pottery_sherd"),
          (_.Bush = "minecraft:bush"),
          (_.Cactus = "minecraft:cactus"),
          (_.CactusFlower = "minecraft:cactus_flower"),
          (_.Cake = "minecraft:cake"),
          (_.Calcite = "minecraft:calcite"),
          (_.CalibratedSculkSensor = "minecraft:calibrated_sculk_sensor"),
          (_.CamelHuskSpawnEgg = "minecraft:camel_husk_spawn_egg"),
          (_.CamelSpawnEgg = "minecraft:camel_spawn_egg"),
          (_.Campfire = "minecraft:campfire"),
          (_.Candle = "minecraft:candle"),
          (_.Carrot = "minecraft:carrot"),
          (_.CarrotOnAStick = "minecraft:carrot_on_a_stick"),
          (_.CartographyTable = "minecraft:cartography_table"),
          (_.CarvedPumpkin = "minecraft:carved_pumpkin"),
          (_.CatSpawnEgg = "minecraft:cat_spawn_egg"),
          (_.Cauldron = "minecraft:cauldron"),
          (_.CaveSpiderSpawnEgg = "minecraft:cave_spider_spawn_egg"),
          (_.ChainCommandBlock = "minecraft:chain_command_block"),
          (_.ChainmailBoots = "minecraft:chainmail_boots"),
          (_.ChainmailChestplate = "minecraft:chainmail_chestplate"),
          (_.ChainmailHelmet = "minecraft:chainmail_helmet"),
          (_.ChainmailLeggings = "minecraft:chainmail_leggings"),
          (_.Charcoal = "minecraft:charcoal"),
          (_.CherryBoat = "minecraft:cherry_boat"),
          (_.CherryButton = "minecraft:cherry_button"),
          (_.CherryChestBoat = "minecraft:cherry_chest_boat"),
          (_.CherryDoor = "minecraft:cherry_door"),
          (_.CherryFence = "minecraft:cherry_fence"),
          (_.CherryFenceGate = "minecraft:cherry_fence_gate"),
          (_.CherryHangingSign = "minecraft:cherry_hanging_sign"),
          (_.CherryLeaves = "minecraft:cherry_leaves"),
          (_.CherryLog = "minecraft:cherry_log"),
          (_.CherryPlanks = "minecraft:cherry_planks"),
          (_.CherryPressurePlate = "minecraft:cherry_pressure_plate"),
          (_.CherrySapling = "minecraft:cherry_sapling"),
          (_.CherryShelf = "minecraft:cherry_shelf"),
          (_.CherrySign = "minecraft:cherry_sign"),
          (_.CherrySlab = "minecraft:cherry_slab"),
          (_.CherryStairs = "minecraft:cherry_stairs"),
          (_.CherryTrapdoor = "minecraft:cherry_trapdoor"),
          (_.CherryWood = "minecraft:cherry_wood"),
          (_.Chest = "minecraft:chest"),
          (_.ChestMinecart = "minecraft:chest_minecart"),
          (_.Chicken = "minecraft:chicken"),
          (_.ChickenSpawnEgg = "minecraft:chicken_spawn_egg"),
          (_.ChippedAnvil = "minecraft:chipped_anvil"),
          (_.ChiseledBookshelf = "minecraft:chiseled_bookshelf"),
          (_.ChiseledCopper = "minecraft:chiseled_copper"),
          (_.ChiseledDeepslate = "minecraft:chiseled_deepslate"),
          (_.ChiseledNetherBricks = "minecraft:chiseled_nether_bricks"),
          (_.ChiseledPolishedBlackstone =
            "minecraft:chiseled_polished_blackstone"),
          (_.ChiseledQuartzBlock = "minecraft:chiseled_quartz_block"),
          (_.ChiseledRedSandstone = "minecraft:chiseled_red_sandstone"),
          (_.ChiseledResinBricks = "minecraft:chiseled_resin_bricks"),
          (_.ChiseledSandstone = "minecraft:chiseled_sandstone"),
          (_.ChiseledStoneBricks = "minecraft:chiseled_stone_bricks"),
          (_.ChiseledTuff = "minecraft:chiseled_tuff"),
          (_.ChiseledTuffBricks = "minecraft:chiseled_tuff_bricks"),
          (_.ChorusFlower = "minecraft:chorus_flower"),
          (_.ChorusFruit = "minecraft:chorus_fruit"),
          (_.ChorusPlant = "minecraft:chorus_plant"),
          (_.Clay = "minecraft:clay"),
          (_.ClayBall = "minecraft:clay_ball"),
          (_.Clock = "minecraft:clock"),
          (_.ClosedEyeblossom = "minecraft:closed_eyeblossom"),
          (_.Coal = "minecraft:coal"),
          (_.CoalBlock = "minecraft:coal_block"),
          (_.CoalOre = "minecraft:coal_ore"),
          (_.CoarseDirt = "minecraft:coarse_dirt"),
          (_.CoastArmorTrimSmithingTemplate =
            "minecraft:coast_armor_trim_smithing_template"),
          (_.CobbledDeepslate = "minecraft:cobbled_deepslate"),
          (_.CobbledDeepslateSlab = "minecraft:cobbled_deepslate_slab"),
          (_.CobbledDeepslateStairs = "minecraft:cobbled_deepslate_stairs"),
          (_.CobbledDeepslateWall = "minecraft:cobbled_deepslate_wall"),
          (_.Cobblestone = "minecraft:cobblestone"),
          (_.CobblestoneSlab = "minecraft:cobblestone_slab"),
          (_.CobblestoneWall = "minecraft:cobblestone_wall"),
          (_.CocoaBeans = "minecraft:cocoa_beans"),
          (_.Cod = "minecraft:cod"),
          (_.CodBucket = "minecraft:cod_bucket"),
          (_.CodSpawnEgg = "minecraft:cod_spawn_egg"),
          (_.CommandBlock = "minecraft:command_block"),
          (_.CommandBlockMinecart = "minecraft:command_block_minecart"),
          (_.Comparator = "minecraft:comparator"),
          (_.Compass = "minecraft:compass"),
          (_.Composter = "minecraft:composter"),
          (_.Conduit = "minecraft:conduit"),
          (_.CookedBeef = "minecraft:cooked_beef"),
          (_.CookedChicken = "minecraft:cooked_chicken"),
          (_.CookedCod = "minecraft:cooked_cod"),
          (_.CookedMutton = "minecraft:cooked_mutton"),
          (_.CookedPorkchop = "minecraft:cooked_porkchop"),
          (_.CookedRabbit = "minecraft:cooked_rabbit"),
          (_.CookedSalmon = "minecraft:cooked_salmon"),
          (_.Cookie = "minecraft:cookie"),
          (_.CopperAxe = "minecraft:copper_axe"),
          (_.CopperBars = "minecraft:copper_bars"),
          (_.CopperBlock = "minecraft:copper_block"),
          (_.CopperBoots = "minecraft:copper_boots"),
          (_.CopperBulb = "minecraft:copper_bulb"),
          (_.CopperChain = "minecraft:copper_chain"),
          (_.CopperChest = "minecraft:copper_chest"),
          (_.CopperChestplate = "minecraft:copper_chestplate"),
          (_.CopperDoor = "minecraft:copper_door"),
          (_.CopperGolemSpawnEgg = "minecraft:copper_golem_spawn_egg"),
          (_.CopperGolemStatue = "minecraft:copper_golem_statue"),
          (_.CopperGrate = "minecraft:copper_grate"),
          (_.CopperHelmet = "minecraft:copper_helmet"),
          (_.CopperHoe = "minecraft:copper_hoe"),
          (_.CopperHorseArmor = "minecraft:copper_horse_armor"),
          (_.CopperIngot = "minecraft:copper_ingot"),
          (_.CopperLantern = "minecraft:copper_lantern"),
          (_.CopperLeggings = "minecraft:copper_leggings"),
          (_.CopperNautilusArmor = "minecraft:copper_nautilus_armor"),
          (_.CopperNugget = "minecraft:copper_nugget"),
          (_.CopperOre = "minecraft:copper_ore"),
          (_.CopperPickaxe = "minecraft:copper_pickaxe"),
          (_.CopperShovel = "minecraft:copper_shovel"),
          (_.CopperSpear = "minecraft:copper_spear"),
          (_.CopperSword = "minecraft:copper_sword"),
          (_.CopperTorch = "minecraft:copper_torch"),
          (_.CopperTrapdoor = "minecraft:copper_trapdoor"),
          (_.Cornflower = "minecraft:cornflower"),
          (_.CowSpawnEgg = "minecraft:cow_spawn_egg"),
          (_.CrackedDeepslateBricks = "minecraft:cracked_deepslate_bricks"),
          (_.CrackedDeepslateTiles = "minecraft:cracked_deepslate_tiles"),
          (_.CrackedNetherBricks = "minecraft:cracked_nether_bricks"),
          (_.CrackedPolishedBlackstoneBricks =
            "minecraft:cracked_polished_blackstone_bricks"),
          (_.CrackedStoneBricks = "minecraft:cracked_stone_bricks"),
          (_.Crafter = "minecraft:crafter"),
          (_.CraftingTable = "minecraft:crafting_table"),
          (_.CreakingHeart = "minecraft:creaking_heart"),
          (_.CreakingSpawnEgg = "minecraft:creaking_spawn_egg"),
          (_.CreeperBannerPattern = "minecraft:creeper_banner_pattern"),
          (_.CreeperHead = "minecraft:creeper_head"),
          (_.CreeperSpawnEgg = "minecraft:creeper_spawn_egg"),
          (_.CrimsonButton = "minecraft:crimson_button"),
          (_.CrimsonDoor = "minecraft:crimson_door"),
          (_.CrimsonFence = "minecraft:crimson_fence"),
          (_.CrimsonFenceGate = "minecraft:crimson_fence_gate"),
          (_.CrimsonFungus = "minecraft:crimson_fungus"),
          (_.CrimsonHangingSign = "minecraft:crimson_hanging_sign"),
          (_.CrimsonHyphae = "minecraft:crimson_hyphae"),
          (_.CrimsonNylium = "minecraft:crimson_nylium"),
          (_.CrimsonPlanks = "minecraft:crimson_planks"),
          (_.CrimsonPressurePlate = "minecraft:crimson_pressure_plate"),
          (_.CrimsonRoots = "minecraft:crimson_roots"),
          (_.CrimsonShelf = "minecraft:crimson_shelf"),
          (_.CrimsonSign = "minecraft:crimson_sign"),
          (_.CrimsonSlab = "minecraft:crimson_slab"),
          (_.CrimsonStairs = "minecraft:crimson_stairs"),
          (_.CrimsonStem = "minecraft:crimson_stem"),
          (_.CrimsonTrapdoor = "minecraft:crimson_trapdoor"),
          (_.Crossbow = "minecraft:crossbow"),
          (_.CryingObsidian = "minecraft:crying_obsidian"),
          (_.CutCopper = "minecraft:cut_copper"),
          (_.CutCopperSlab = "minecraft:cut_copper_slab"),
          (_.CutCopperStairs = "minecraft:cut_copper_stairs"),
          (_.CutRedSandstone = "minecraft:cut_red_sandstone"),
          (_.CutRedSandstoneSlab = "minecraft:cut_red_sandstone_slab"),
          (_.CutSandstone = "minecraft:cut_sandstone"),
          (_.CutSandstoneSlab = "minecraft:cut_sandstone_slab"),
          (_.CyanBundle = "minecraft:cyan_bundle"),
          (_.CyanCandle = "minecraft:cyan_candle"),
          (_.CyanCarpet = "minecraft:cyan_carpet"),
          (_.CyanConcrete = "minecraft:cyan_concrete"),
          (_.CyanConcretePowder = "minecraft:cyan_concrete_powder"),
          (_.CyanDye = "minecraft:cyan_dye"),
          (_.CyanGlazedTerracotta = "minecraft:cyan_glazed_terracotta"),
          (_.CyanHarness = "minecraft:cyan_harness"),
          (_.CyanShulkerBox = "minecraft:cyan_shulker_box"),
          (_.CyanStainedGlass = "minecraft:cyan_stained_glass"),
          (_.CyanStainedGlassPane = "minecraft:cyan_stained_glass_pane"),
          (_.CyanTerracotta = "minecraft:cyan_terracotta"),
          (_.CyanWool = "minecraft:cyan_wool"),
          (_.DamagedAnvil = "minecraft:damaged_anvil"),
          (_.Dandelion = "minecraft:dandelion"),
          (_.DangerPotterySherd = "minecraft:danger_pottery_sherd"),
          (_.DarkOakBoat = "minecraft:dark_oak_boat"),
          (_.DarkOakButton = "minecraft:dark_oak_button"),
          (_.DarkOakChestBoat = "minecraft:dark_oak_chest_boat"),
          (_.DarkOakDoor = "minecraft:dark_oak_door"),
          (_.DarkOakFence = "minecraft:dark_oak_fence"),
          (_.DarkOakFenceGate = "minecraft:dark_oak_fence_gate"),
          (_.DarkOakHangingSign = "minecraft:dark_oak_hanging_sign"),
          (_.DarkOakLeaves = "minecraft:dark_oak_leaves"),
          (_.DarkOakLog = "minecraft:dark_oak_log"),
          (_.DarkOakPlanks = "minecraft:dark_oak_planks"),
          (_.DarkOakPressurePlate = "minecraft:dark_oak_pressure_plate"),
          (_.DarkOakSapling = "minecraft:dark_oak_sapling"),
          (_.DarkOakShelf = "minecraft:dark_oak_shelf"),
          (_.DarkOakSign = "minecraft:dark_oak_sign"),
          (_.DarkOakSlab = "minecraft:dark_oak_slab"),
          (_.DarkOakStairs = "minecraft:dark_oak_stairs"),
          (_.DarkOakTrapdoor = "minecraft:dark_oak_trapdoor"),
          (_.DarkOakWood = "minecraft:dark_oak_wood"),
          (_.DarkPrismarine = "minecraft:dark_prismarine"),
          (_.DarkPrismarineSlab = "minecraft:dark_prismarine_slab"),
          (_.DarkPrismarineStairs = "minecraft:dark_prismarine_stairs"),
          (_.DaylightDetector = "minecraft:daylight_detector"),
          (_.DeadBrainCoral = "minecraft:dead_brain_coral"),
          (_.DeadBrainCoralBlock = "minecraft:dead_brain_coral_block"),
          (_.DeadBrainCoralFan = "minecraft:dead_brain_coral_fan"),
          (_.DeadBubbleCoral = "minecraft:dead_bubble_coral"),
          (_.DeadBubbleCoralBlock = "minecraft:dead_bubble_coral_block"),
          (_.DeadBubbleCoralFan = "minecraft:dead_bubble_coral_fan"),
          (_.DeadFireCoral = "minecraft:dead_fire_coral"),
          (_.DeadFireCoralBlock = "minecraft:dead_fire_coral_block"),
          (_.DeadFireCoralFan = "minecraft:dead_fire_coral_fan"),
          (_.DeadHornCoral = "minecraft:dead_horn_coral"),
          (_.DeadHornCoralBlock = "minecraft:dead_horn_coral_block"),
          (_.DeadHornCoralFan = "minecraft:dead_horn_coral_fan"),
          (_.DeadTubeCoral = "minecraft:dead_tube_coral"),
          (_.DeadTubeCoralBlock = "minecraft:dead_tube_coral_block"),
          (_.DeadTubeCoralFan = "minecraft:dead_tube_coral_fan"),
          (_.Deadbush = "minecraft:deadbush"),
          (_.DecoratedPot = "minecraft:decorated_pot"),
          (_.Deepslate = "minecraft:deepslate"),
          (_.DeepslateBrickSlab = "minecraft:deepslate_brick_slab"),
          (_.DeepslateBrickStairs = "minecraft:deepslate_brick_stairs"),
          (_.DeepslateBrickWall = "minecraft:deepslate_brick_wall"),
          (_.DeepslateBricks = "minecraft:deepslate_bricks"),
          (_.DeepslateCoalOre = "minecraft:deepslate_coal_ore"),
          (_.DeepslateCopperOre = "minecraft:deepslate_copper_ore"),
          (_.DeepslateDiamondOre = "minecraft:deepslate_diamond_ore"),
          (_.DeepslateEmeraldOre = "minecraft:deepslate_emerald_ore"),
          (_.DeepslateGoldOre = "minecraft:deepslate_gold_ore"),
          (_.DeepslateIronOre = "minecraft:deepslate_iron_ore"),
          (_.DeepslateLapisOre = "minecraft:deepslate_lapis_ore"),
          (_.DeepslateRedstoneOre = "minecraft:deepslate_redstone_ore"),
          (_.DeepslateTileSlab = "minecraft:deepslate_tile_slab"),
          (_.DeepslateTileStairs = "minecraft:deepslate_tile_stairs"),
          (_.DeepslateTileWall = "minecraft:deepslate_tile_wall"),
          (_.DeepslateTiles = "minecraft:deepslate_tiles"),
          (_.Deny = "minecraft:deny"),
          (_.DetectorRail = "minecraft:detector_rail"),
          (_.Diamond = "minecraft:diamond"),
          (_.DiamondAxe = "minecraft:diamond_axe"),
          (_.DiamondBlock = "minecraft:diamond_block"),
          (_.DiamondBoots = "minecraft:diamond_boots"),
          (_.DiamondChestplate = "minecraft:diamond_chestplate"),
          (_.DiamondHelmet = "minecraft:diamond_helmet"),
          (_.DiamondHoe = "minecraft:diamond_hoe"),
          (_.DiamondHorseArmor = "minecraft:diamond_horse_armor"),
          (_.DiamondLeggings = "minecraft:diamond_leggings"),
          (_.DiamondNautilusArmor = "minecraft:diamond_nautilus_armor"),
          (_.DiamondOre = "minecraft:diamond_ore"),
          (_.DiamondPickaxe = "minecraft:diamond_pickaxe"),
          (_.DiamondShovel = "minecraft:diamond_shovel"),
          (_.DiamondSpear = "minecraft:diamond_spear"),
          (_.DiamondSword = "minecraft:diamond_sword"),
          (_.Diorite = "minecraft:diorite"),
          (_.DioriteSlab = "minecraft:diorite_slab"),
          (_.DioriteStairs = "minecraft:diorite_stairs"),
          (_.DioriteWall = "minecraft:diorite_wall"),
          (_.Dirt = "minecraft:dirt"),
          (_.DirtWithRoots = "minecraft:dirt_with_roots"),
          (_.DiscFragment5 = "minecraft:disc_fragment_5"),
          (_.Dispenser = "minecraft:dispenser"),
          (_.DolphinSpawnEgg = "minecraft:dolphin_spawn_egg"),
          (_.DonkeySpawnEgg = "minecraft:donkey_spawn_egg"),
          (_.DragonBreath = "minecraft:dragon_breath"),
          (_.DragonEgg = "minecraft:dragon_egg"),
          (_.DragonHead = "minecraft:dragon_head"),
          (_.DriedGhast = "minecraft:dried_ghast"),
          (_.DriedKelp = "minecraft:dried_kelp"),
          (_.DriedKelpBlock = "minecraft:dried_kelp_block"),
          (_.DripstoneBlock = "minecraft:dripstone_block"),
          (_.Dropper = "minecraft:dropper"),
          (_.DrownedSpawnEgg = "minecraft:drowned_spawn_egg"),
          (_.DuneArmorTrimSmithingTemplate =
            "minecraft:dune_armor_trim_smithing_template"),
          (_.EchoShard = "minecraft:echo_shard"),
          (_.Egg = "minecraft:egg"),
          (_.ElderGuardianSpawnEgg = "minecraft:elder_guardian_spawn_egg"),
          (_.Elytra = "minecraft:elytra"),
          (_.Emerald = "minecraft:emerald"),
          (_.EmeraldBlock = "minecraft:emerald_block"),
          (_.EmeraldOre = "minecraft:emerald_ore"),
          (_.EmptyMap = "minecraft:empty_map"),
          (_.EnchantedBook = "minecraft:enchanted_book"),
          (_.EnchantedGoldenApple = "minecraft:enchanted_golden_apple"),
          (_.EnchantingTable = "minecraft:enchanting_table"),
          (_.EndBrickStairs = "minecraft:end_brick_stairs"),
          (_.EndBricks = "minecraft:end_bricks"),
          (_.EndCrystal = "minecraft:end_crystal"),
          (_.EndPortalFrame = "minecraft:end_portal_frame"),
          (_.EndRod = "minecraft:end_rod"),
          (_.EndStone = "minecraft:end_stone"),
          (_.EndStoneBrickSlab = "minecraft:end_stone_brick_slab"),
          (_.EndStoneBrickWall = "minecraft:end_stone_brick_wall"),
          (_.EnderChest = "minecraft:ender_chest"),
          (_.EnderDragonSpawnEgg = "minecraft:ender_dragon_spawn_egg"),
          (_.EnderEye = "minecraft:ender_eye"),
          (_.EnderPearl = "minecraft:ender_pearl"),
          (_.EndermanSpawnEgg = "minecraft:enderman_spawn_egg"),
          (_.EndermiteSpawnEgg = "minecraft:endermite_spawn_egg"),
          (_.EvokerSpawnEgg = "minecraft:evoker_spawn_egg"),
          (_.ExperienceBottle = "minecraft:experience_bottle"),
          (_.ExplorerPotterySherd = "minecraft:explorer_pottery_sherd"),
          (_.ExposedChiseledCopper = "minecraft:exposed_chiseled_copper"),
          (_.ExposedCopper = "minecraft:exposed_copper"),
          (_.ExposedCopperBars = "minecraft:exposed_copper_bars"),
          (_.ExposedCopperBulb = "minecraft:exposed_copper_bulb"),
          (_.ExposedCopperChain = "minecraft:exposed_copper_chain"),
          (_.ExposedCopperChest = "minecraft:exposed_copper_chest"),
          (_.ExposedCopperDoor = "minecraft:exposed_copper_door"),
          (_.ExposedCopperGolemStatue =
            "minecraft:exposed_copper_golem_statue"),
          (_.ExposedCopperGrate = "minecraft:exposed_copper_grate"),
          (_.ExposedCopperLantern = "minecraft:exposed_copper_lantern"),
          (_.ExposedCopperTrapdoor = "minecraft:exposed_copper_trapdoor"),
          (_.ExposedCutCopper = "minecraft:exposed_cut_copper"),
          (_.ExposedCutCopperSlab = "minecraft:exposed_cut_copper_slab"),
          (_.ExposedCutCopperStairs = "minecraft:exposed_cut_copper_stairs"),
          (_.ExposedLightningRod = "minecraft:exposed_lightning_rod"),
          (_.EyeArmorTrimSmithingTemplate =
            "minecraft:eye_armor_trim_smithing_template"),
          (_.Farmland = "minecraft:farmland"),
          (_.Feather = "minecraft:feather"),
          (_.FenceGate = "minecraft:fence_gate"),
          (_.FermentedSpiderEye = "minecraft:fermented_spider_eye"),
          (_.Fern = "minecraft:fern"),
          (_.FieldMasonedBannerPattern =
            "minecraft:field_masoned_banner_pattern"),
          (_.FilledMap = "minecraft:filled_map"),
          (_.FireCharge = "minecraft:fire_charge"),
          (_.FireCoral = "minecraft:fire_coral"),
          (_.FireCoralBlock = "minecraft:fire_coral_block"),
          (_.FireCoralFan = "minecraft:fire_coral_fan"),
          (_.FireflyBush = "minecraft:firefly_bush"),
          (_.FireworkRocket = "minecraft:firework_rocket"),
          (_.FireworkStar = "minecraft:firework_star"),
          (_.FishingRod = "minecraft:fishing_rod"),
          (_.FletchingTable = "minecraft:fletching_table"),
          (_.Flint = "minecraft:flint"),
          (_.FlintAndSteel = "minecraft:flint_and_steel"),
          (_.FlowArmorTrimSmithingTemplate =
            "minecraft:flow_armor_trim_smithing_template"),
          (_.FlowBannerPattern = "minecraft:flow_banner_pattern"),
          (_.FlowPotterySherd = "minecraft:flow_pottery_sherd"),
          (_.FlowerBannerPattern = "minecraft:flower_banner_pattern"),
          (_.FlowerPot = "minecraft:flower_pot"),
          (_.FloweringAzalea = "minecraft:flowering_azalea"),
          (_.FoxSpawnEgg = "minecraft:fox_spawn_egg"),
          (_.Frame = "minecraft:frame"),
          (_.FriendPotterySherd = "minecraft:friend_pottery_sherd"),
          (_.FrogSpawn = "minecraft:frog_spawn"),
          (_.FrogSpawnEgg = "minecraft:frog_spawn_egg"),
          (_.FrostedIce = "minecraft:frosted_ice"),
          (_.Furnace = "minecraft:furnace"),
          (_.GhastSpawnEgg = "minecraft:ghast_spawn_egg"),
          (_.GhastTear = "minecraft:ghast_tear"),
          (_.GildedBlackstone = "minecraft:gilded_blackstone"),
          (_.Glass = "minecraft:glass"),
          (_.GlassBottle = "minecraft:glass_bottle"),
          (_.GlassPane = "minecraft:glass_pane"),
          (_.GlisteringMelonSlice = "minecraft:glistering_melon_slice"),
          (_.GlobeBannerPattern = "minecraft:globe_banner_pattern"),
          (_.GlowBerries = "minecraft:glow_berries"),
          (_.GlowFrame = "minecraft:glow_frame"),
          (_.GlowInkSac = "minecraft:glow_ink_sac"),
          (_.GlowLichen = "minecraft:glow_lichen"),
          (_.GlowSquidSpawnEgg = "minecraft:glow_squid_spawn_egg"),
          (_.Glowstone = "minecraft:glowstone"),
          (_.GlowstoneDust = "minecraft:glowstone_dust"),
          (_.GoatHorn = "minecraft:goat_horn"),
          (_.GoatSpawnEgg = "minecraft:goat_spawn_egg"),
          (_.GoldBlock = "minecraft:gold_block"),
          (_.GoldIngot = "minecraft:gold_ingot"),
          (_.GoldNugget = "minecraft:gold_nugget"),
          (_.GoldOre = "minecraft:gold_ore"),
          (_.GoldenApple = "minecraft:golden_apple"),
          (_.GoldenAxe = "minecraft:golden_axe"),
          (_.GoldenBoots = "minecraft:golden_boots"),
          (_.GoldenCarrot = "minecraft:golden_carrot"),
          (_.GoldenChestplate = "minecraft:golden_chestplate"),
          (_.GoldenHelmet = "minecraft:golden_helmet"),
          (_.GoldenHoe = "minecraft:golden_hoe"),
          (_.GoldenHorseArmor = "minecraft:golden_horse_armor"),
          (_.GoldenLeggings = "minecraft:golden_leggings"),
          (_.GoldenNautilusArmor = "minecraft:golden_nautilus_armor"),
          (_.GoldenPickaxe = "minecraft:golden_pickaxe"),
          (_.GoldenRail = "minecraft:golden_rail"),
          (_.GoldenShovel = "minecraft:golden_shovel"),
          (_.GoldenSpear = "minecraft:golden_spear"),
          (_.GoldenSword = "minecraft:golden_sword"),
          (_.Granite = "minecraft:granite"),
          (_.GraniteSlab = "minecraft:granite_slab"),
          (_.GraniteStairs = "minecraft:granite_stairs"),
          (_.GraniteWall = "minecraft:granite_wall"),
          (_.GrassBlock = "minecraft:grass_block"),
          (_.GrassPath = "minecraft:grass_path"),
          (_.Gravel = "minecraft:gravel"),
          (_.GrayBundle = "minecraft:gray_bundle"),
          (_.GrayCandle = "minecraft:gray_candle"),
          (_.GrayCarpet = "minecraft:gray_carpet"),
          (_.GrayConcrete = "minecraft:gray_concrete"),
          (_.GrayConcretePowder = "minecraft:gray_concrete_powder"),
          (_.GrayDye = "minecraft:gray_dye"),
          (_.GrayGlazedTerracotta = "minecraft:gray_glazed_terracotta"),
          (_.GrayHarness = "minecraft:gray_harness"),
          (_.GrayShulkerBox = "minecraft:gray_shulker_box"),
          (_.GrayStainedGlass = "minecraft:gray_stained_glass"),
          (_.GrayStainedGlassPane = "minecraft:gray_stained_glass_pane"),
          (_.GrayTerracotta = "minecraft:gray_terracotta"),
          (_.GrayWool = "minecraft:gray_wool"),
          (_.GreenBundle = "minecraft:green_bundle"),
          (_.GreenCandle = "minecraft:green_candle"),
          (_.GreenCarpet = "minecraft:green_carpet"),
          (_.GreenConcrete = "minecraft:green_concrete"),
          (_.GreenConcretePowder = "minecraft:green_concrete_powder"),
          (_.GreenDye = "minecraft:green_dye"),
          (_.GreenGlazedTerracotta = "minecraft:green_glazed_terracotta"),
          (_.GreenHarness = "minecraft:green_harness"),
          (_.GreenShulkerBox = "minecraft:green_shulker_box"),
          (_.GreenStainedGlass = "minecraft:green_stained_glass"),
          (_.GreenStainedGlassPane = "minecraft:green_stained_glass_pane"),
          (_.GreenTerracotta = "minecraft:green_terracotta"),
          (_.GreenWool = "minecraft:green_wool"),
          (_.Grindstone = "minecraft:grindstone"),
          (_.GuardianSpawnEgg = "minecraft:guardian_spawn_egg"),
          (_.Gunpowder = "minecraft:gunpowder"),
          (_.GusterBannerPattern = "minecraft:guster_banner_pattern"),
          (_.GusterPotterySherd = "minecraft:guster_pottery_sherd"),
          (_.HangingRoots = "minecraft:hanging_roots"),
          (_.HappyGhastSpawnEgg = "minecraft:happy_ghast_spawn_egg"),
          (_.HardenedClay = "minecraft:hardened_clay"),
          (_.HayBlock = "minecraft:hay_block"),
          (_.HeartOfTheSea = "minecraft:heart_of_the_sea"),
          (_.HeartPotterySherd = "minecraft:heart_pottery_sherd"),
          (_.HeartbreakPotterySherd = "minecraft:heartbreak_pottery_sherd"),
          (_.HeavyCore = "minecraft:heavy_core"),
          (_.HeavyWeightedPressurePlate =
            "minecraft:heavy_weighted_pressure_plate"),
          (_.HoglinSpawnEgg = "minecraft:hoglin_spawn_egg"),
          (_.HoneyBlock = "minecraft:honey_block"),
          (_.HoneyBottle = "minecraft:honey_bottle"),
          (_.Honeycomb = "minecraft:honeycomb"),
          (_.HoneycombBlock = "minecraft:honeycomb_block"),
          (_.Hopper = "minecraft:hopper"),
          (_.HopperMinecart = "minecraft:hopper_minecart"),
          (_.HornCoral = "minecraft:horn_coral"),
          (_.HornCoralBlock = "minecraft:horn_coral_block"),
          (_.HornCoralFan = "minecraft:horn_coral_fan"),
          (_.HorseSpawnEgg = "minecraft:horse_spawn_egg"),
          (_.HostArmorTrimSmithingTemplate =
            "minecraft:host_armor_trim_smithing_template"),
          (_.HowlPotterySherd = "minecraft:howl_pottery_sherd"),
          (_.HuskSpawnEgg = "minecraft:husk_spawn_egg"),
          (_.Ice = "minecraft:ice"),
          (_.InfestedChiseledStoneBricks =
            "minecraft:infested_chiseled_stone_bricks"),
          (_.InfestedCobblestone = "minecraft:infested_cobblestone"),
          (_.InfestedCrackedStoneBricks =
            "minecraft:infested_cracked_stone_bricks"),
          (_.InfestedDeepslate = "minecraft:infested_deepslate"),
          (_.InfestedMossyStoneBricks =
            "minecraft:infested_mossy_stone_bricks"),
          (_.InfestedStone = "minecraft:infested_stone"),
          (_.InfestedStoneBricks = "minecraft:infested_stone_bricks"),
          (_.InkSac = "minecraft:ink_sac"),
          (_.IronAxe = "minecraft:iron_axe"),
          (_.IronBars = "minecraft:iron_bars"),
          (_.IronBlock = "minecraft:iron_block"),
          (_.IronBoots = "minecraft:iron_boots"),
          (_.IronChain = "minecraft:iron_chain"),
          (_.IronChestplate = "minecraft:iron_chestplate"),
          (_.IronDoor = "minecraft:iron_door"),
          (_.IronGolemSpawnEgg = "minecraft:iron_golem_spawn_egg"),
          (_.IronHelmet = "minecraft:iron_helmet"),
          (_.IronHoe = "minecraft:iron_hoe"),
          (_.IronHorseArmor = "minecraft:iron_horse_armor"),
          (_.IronIngot = "minecraft:iron_ingot"),
          (_.IronLeggings = "minecraft:iron_leggings"),
          (_.IronNautilusArmor = "minecraft:iron_nautilus_armor"),
          (_.IronNugget = "minecraft:iron_nugget"),
          (_.IronOre = "minecraft:iron_ore"),
          (_.IronPickaxe = "minecraft:iron_pickaxe"),
          (_.IronShovel = "minecraft:iron_shovel"),
          (_.IronSpear = "minecraft:iron_spear"),
          (_.IronSword = "minecraft:iron_sword"),
          (_.IronTrapdoor = "minecraft:iron_trapdoor"),
          (_.Jigsaw = "minecraft:jigsaw"),
          (_.Jukebox = "minecraft:jukebox"),
          (_.JungleBoat = "minecraft:jungle_boat"),
          (_.JungleButton = "minecraft:jungle_button"),
          (_.JungleChestBoat = "minecraft:jungle_chest_boat"),
          (_.JungleDoor = "minecraft:jungle_door"),
          (_.JungleFence = "minecraft:jungle_fence"),
          (_.JungleFenceGate = "minecraft:jungle_fence_gate"),
          (_.JungleHangingSign = "minecraft:jungle_hanging_sign"),
          (_.JungleLeaves = "minecraft:jungle_leaves"),
          (_.JungleLog = "minecraft:jungle_log"),
          (_.JunglePlanks = "minecraft:jungle_planks"),
          (_.JunglePressurePlate = "minecraft:jungle_pressure_plate"),
          (_.JungleSapling = "minecraft:jungle_sapling"),
          (_.JungleShelf = "minecraft:jungle_shelf"),
          (_.JungleSign = "minecraft:jungle_sign"),
          (_.JungleSlab = "minecraft:jungle_slab"),
          (_.JungleStairs = "minecraft:jungle_stairs"),
          (_.JungleTrapdoor = "minecraft:jungle_trapdoor"),
          (_.JungleWood = "minecraft:jungle_wood"),
          (_.Kelp = "minecraft:kelp"),
          (_.Ladder = "minecraft:ladder"),
          (_.Lantern = "minecraft:lantern"),
          (_.LapisBlock = "minecraft:lapis_block"),
          (_.LapisLazuli = "minecraft:lapis_lazuli"),
          (_.LapisOre = "minecraft:lapis_ore"),
          (_.LargeAmethystBud = "minecraft:large_amethyst_bud"),
          (_.LargeFern = "minecraft:large_fern"),
          (_.LavaBucket = "minecraft:lava_bucket"),
          (_.Lead = "minecraft:lead"),
          (_.LeafLitter = "minecraft:leaf_litter"),
          (_.Leather = "minecraft:leather"),
          (_.LeatherBoots = "minecraft:leather_boots"),
          (_.LeatherChestplate = "minecraft:leather_chestplate"),
          (_.LeatherHelmet = "minecraft:leather_helmet"),
          (_.LeatherHorseArmor = "minecraft:leather_horse_armor"),
          (_.LeatherLeggings = "minecraft:leather_leggings"),
          (_.Lectern = "minecraft:lectern"),
          (_.Lever = "minecraft:lever"),
          (_.LightBlock0 = "minecraft:light_block_0"),
          (_.LightBlock1 = "minecraft:light_block_1"),
          (_.LightBlock10 = "minecraft:light_block_10"),
          (_.LightBlock11 = "minecraft:light_block_11"),
          (_.LightBlock12 = "minecraft:light_block_12"),
          (_.LightBlock13 = "minecraft:light_block_13"),
          (_.LightBlock14 = "minecraft:light_block_14"),
          (_.LightBlock15 = "minecraft:light_block_15"),
          (_.LightBlock2 = "minecraft:light_block_2"),
          (_.LightBlock3 = "minecraft:light_block_3"),
          (_.LightBlock4 = "minecraft:light_block_4"),
          (_.LightBlock5 = "minecraft:light_block_5"),
          (_.LightBlock6 = "minecraft:light_block_6"),
          (_.LightBlock7 = "minecraft:light_block_7"),
          (_.LightBlock8 = "minecraft:light_block_8"),
          (_.LightBlock9 = "minecraft:light_block_9"),
          (_.LightBlueBundle = "minecraft:light_blue_bundle"),
          (_.LightBlueCandle = "minecraft:light_blue_candle"),
          (_.LightBlueCarpet = "minecraft:light_blue_carpet"),
          (_.LightBlueConcrete = "minecraft:light_blue_concrete"),
          (_.LightBlueConcretePowder = "minecraft:light_blue_concrete_powder"),
          (_.LightBlueDye = "minecraft:light_blue_dye"),
          (_.LightBlueGlazedTerracotta =
            "minecraft:light_blue_glazed_terracotta"),
          (_.LightBlueHarness = "minecraft:light_blue_harness"),
          (_.LightBlueShulkerBox = "minecraft:light_blue_shulker_box"),
          (_.LightBlueStainedGlass = "minecraft:light_blue_stained_glass"),
          (_.LightBlueStainedGlassPane =
            "minecraft:light_blue_stained_glass_pane"),
          (_.LightBlueTerracotta = "minecraft:light_blue_terracotta"),
          (_.LightBlueWool = "minecraft:light_blue_wool"),
          (_.LightGrayBundle = "minecraft:light_gray_bundle"),
          (_.LightGrayCandle = "minecraft:light_gray_candle"),
          (_.LightGrayCarpet = "minecraft:light_gray_carpet"),
          (_.LightGrayConcrete = "minecraft:light_gray_concrete"),
          (_.LightGrayConcretePowder = "minecraft:light_gray_concrete_powder"),
          (_.LightGrayDye = "minecraft:light_gray_dye"),
          (_.LightGrayHarness = "minecraft:light_gray_harness"),
          (_.LightGrayShulkerBox = "minecraft:light_gray_shulker_box"),
          (_.LightGrayStainedGlass = "minecraft:light_gray_stained_glass"),
          (_.LightGrayStainedGlassPane =
            "minecraft:light_gray_stained_glass_pane"),
          (_.LightGrayTerracotta = "minecraft:light_gray_terracotta"),
          (_.LightGrayWool = "minecraft:light_gray_wool"),
          (_.LightWeightedPressurePlate =
            "minecraft:light_weighted_pressure_plate"),
          (_.LightningRod = "minecraft:lightning_rod"),
          (_.Lilac = "minecraft:lilac"),
          (_.LilyOfTheValley = "minecraft:lily_of_the_valley"),
          (_.LimeBundle = "minecraft:lime_bundle"),
          (_.LimeCandle = "minecraft:lime_candle"),
          (_.LimeCarpet = "minecraft:lime_carpet"),
          (_.LimeConcrete = "minecraft:lime_concrete"),
          (_.LimeConcretePowder = "minecraft:lime_concrete_powder"),
          (_.LimeDye = "minecraft:lime_dye"),
          (_.LimeGlazedTerracotta = "minecraft:lime_glazed_terracotta"),
          (_.LimeHarness = "minecraft:lime_harness"),
          (_.LimeShulkerBox = "minecraft:lime_shulker_box"),
          (_.LimeStainedGlass = "minecraft:lime_stained_glass"),
          (_.LimeStainedGlassPane = "minecraft:lime_stained_glass_pane"),
          (_.LimeTerracotta = "minecraft:lime_terracotta"),
          (_.LimeWool = "minecraft:lime_wool"),
          (_.LingeringPotion = "minecraft:lingering_potion"),
          (_.LitPumpkin = "minecraft:lit_pumpkin"),
          (_.LlamaSpawnEgg = "minecraft:llama_spawn_egg"),
          (_.Lodestone = "minecraft:lodestone"),
          (_.LodestoneCompass = "minecraft:lodestone_compass"),
          (_.Loom = "minecraft:loom"),
          (_.Mace = "minecraft:mace"),
          (_.MagentaBundle = "minecraft:magenta_bundle"),
          (_.MagentaCandle = "minecraft:magenta_candle"),
          (_.MagentaCarpet = "minecraft:magenta_carpet"),
          (_.MagentaConcrete = "minecraft:magenta_concrete"),
          (_.MagentaConcretePowder = "minecraft:magenta_concrete_powder"),
          (_.MagentaDye = "minecraft:magenta_dye"),
          (_.MagentaGlazedTerracotta = "minecraft:magenta_glazed_terracotta"),
          (_.MagentaHarness = "minecraft:magenta_harness"),
          (_.MagentaShulkerBox = "minecraft:magenta_shulker_box"),
          (_.MagentaStainedGlass = "minecraft:magenta_stained_glass"),
          (_.MagentaStainedGlassPane = "minecraft:magenta_stained_glass_pane"),
          (_.MagentaTerracotta = "minecraft:magenta_terracotta"),
          (_.MagentaWool = "minecraft:magenta_wool"),
          (_.Magma = "minecraft:magma"),
          (_.MagmaCream = "minecraft:magma_cream"),
          (_.MagmaCubeSpawnEgg = "minecraft:magma_cube_spawn_egg"),
          (_.MangroveBoat = "minecraft:mangrove_boat"),
          (_.MangroveButton = "minecraft:mangrove_button"),
          (_.MangroveChestBoat = "minecraft:mangrove_chest_boat"),
          (_.MangroveDoor = "minecraft:mangrove_door"),
          (_.MangroveFence = "minecraft:mangrove_fence"),
          (_.MangroveFenceGate = "minecraft:mangrove_fence_gate"),
          (_.MangroveHangingSign = "minecraft:mangrove_hanging_sign"),
          (_.MangroveLeaves = "minecraft:mangrove_leaves"),
          (_.MangroveLog = "minecraft:mangrove_log"),
          (_.MangrovePlanks = "minecraft:mangrove_planks"),
          (_.MangrovePressurePlate = "minecraft:mangrove_pressure_plate"),
          (_.MangrovePropagule = "minecraft:mangrove_propagule"),
          (_.MangroveRoots = "minecraft:mangrove_roots"),
          (_.MangroveShelf = "minecraft:mangrove_shelf"),
          (_.MangroveSign = "minecraft:mangrove_sign"),
          (_.MangroveSlab = "minecraft:mangrove_slab"),
          (_.MangroveStairs = "minecraft:mangrove_stairs"),
          (_.MangroveTrapdoor = "minecraft:mangrove_trapdoor"),
          (_.MangroveWood = "minecraft:mangrove_wood"),
          (_.MediumAmethystBud = "minecraft:medium_amethyst_bud"),
          (_.MelonBlock = "minecraft:melon_block"),
          (_.MelonSeeds = "minecraft:melon_seeds"),
          (_.MelonSlice = "minecraft:melon_slice"),
          (_.MilkBucket = "minecraft:milk_bucket"),
          (_.Minecart = "minecraft:minecart"),
          (_.MinerPotterySherd = "minecraft:miner_pottery_sherd"),
          (_.MobSpawner = "minecraft:mob_spawner"),
          (_.MojangBannerPattern = "minecraft:mojang_banner_pattern"),
          (_.MooshroomSpawnEgg = "minecraft:mooshroom_spawn_egg"),
          (_.MossBlock = "minecraft:moss_block"),
          (_.MossCarpet = "minecraft:moss_carpet"),
          (_.MossyCobblestone = "minecraft:mossy_cobblestone"),
          (_.MossyCobblestoneSlab = "minecraft:mossy_cobblestone_slab"),
          (_.MossyCobblestoneStairs = "minecraft:mossy_cobblestone_stairs"),
          (_.MossyCobblestoneWall = "minecraft:mossy_cobblestone_wall"),
          (_.MossyStoneBrickSlab = "minecraft:mossy_stone_brick_slab"),
          (_.MossyStoneBrickStairs = "minecraft:mossy_stone_brick_stairs"),
          (_.MossyStoneBrickWall = "minecraft:mossy_stone_brick_wall"),
          (_.MossyStoneBricks = "minecraft:mossy_stone_bricks"),
          (_.MournerPotterySherd = "minecraft:mourner_pottery_sherd"),
          (_.Mud = "minecraft:mud"),
          (_.MudBrickSlab = "minecraft:mud_brick_slab"),
          (_.MudBrickStairs = "minecraft:mud_brick_stairs"),
          (_.MudBrickWall = "minecraft:mud_brick_wall"),
          (_.MudBricks = "minecraft:mud_bricks"),
          (_.MuddyMangroveRoots = "minecraft:muddy_mangrove_roots"),
          (_.MuleSpawnEgg = "minecraft:mule_spawn_egg"),
          (_.MushroomStem = "minecraft:mushroom_stem"),
          (_.MushroomStew = "minecraft:mushroom_stew"),
          (_.MusicDisc11 = "minecraft:music_disc_11"),
          (_.MusicDisc13 = "minecraft:music_disc_13"),
          (_.MusicDisc5 = "minecraft:music_disc_5"),
          (_.MusicDiscBlocks = "minecraft:music_disc_blocks"),
          (_.MusicDiscCat = "minecraft:music_disc_cat"),
          (_.MusicDiscChirp = "minecraft:music_disc_chirp"),
          (_.MusicDiscCreator = "minecraft:music_disc_creator"),
          (_.MusicDiscCreatorMusicBox =
            "minecraft:music_disc_creator_music_box"),
          (_.MusicDiscFar = "minecraft:music_disc_far"),
          (_.MusicDiscLavaChicken = "minecraft:music_disc_lava_chicken"),
          (_.MusicDiscMall = "minecraft:music_disc_mall"),
          (_.MusicDiscMellohi = "minecraft:music_disc_mellohi"),
          (_.MusicDiscOtherside = "minecraft:music_disc_otherside"),
          (_.MusicDiscPigstep = "minecraft:music_disc_pigstep"),
          (_.MusicDiscPrecipice = "minecraft:music_disc_precipice"),
          (_.MusicDiscRelic = "minecraft:music_disc_relic"),
          (_.MusicDiscStal = "minecraft:music_disc_stal"),
          (_.MusicDiscStrad = "minecraft:music_disc_strad"),
          (_.MusicDiscTears = "minecraft:music_disc_tears"),
          (_.MusicDiscWait = "minecraft:music_disc_wait"),
          (_.MusicDiscWard = "minecraft:music_disc_ward"),
          (_.Mutton = "minecraft:mutton"),
          (_.Mycelium = "minecraft:mycelium"),
          (_.NameTag = "minecraft:name_tag"),
          (_.NautilusShell = "minecraft:nautilus_shell"),
          (_.NautilusSpawnEgg = "minecraft:nautilus_spawn_egg"),
          (_.NetherBrick = "minecraft:nether_brick"),
          (_.NetherBrickFence = "minecraft:nether_brick_fence"),
          (_.NetherBrickSlab = "minecraft:nether_brick_slab"),
          (_.NetherBrickStairs = "minecraft:nether_brick_stairs"),
          (_.NetherBrickWall = "minecraft:nether_brick_wall"),
          (_.NetherGoldOre = "minecraft:nether_gold_ore"),
          (_.NetherSprouts = "minecraft:nether_sprouts"),
          (_.NetherStar = "minecraft:nether_star"),
          (_.NetherWart = "minecraft:nether_wart"),
          (_.NetherWartBlock = "minecraft:nether_wart_block"),
          (_.Netherbrick = "minecraft:netherbrick"),
          (_.NetheriteAxe = "minecraft:netherite_axe"),
          (_.NetheriteBlock = "minecraft:netherite_block"),
          (_.NetheriteBoots = "minecraft:netherite_boots"),
          (_.NetheriteChestplate = "minecraft:netherite_chestplate"),
          (_.NetheriteHelmet = "minecraft:netherite_helmet"),
          (_.NetheriteHoe = "minecraft:netherite_hoe"),
          (_.NetheriteHorseArmor = "minecraft:netherite_horse_armor"),
          (_.NetheriteIngot = "minecraft:netherite_ingot"),
          (_.NetheriteLeggings = "minecraft:netherite_leggings"),
          (_.NetheriteNautilusArmor = "minecraft:netherite_nautilus_armor"),
          (_.NetheritePickaxe = "minecraft:netherite_pickaxe"),
          (_.NetheriteScrap = "minecraft:netherite_scrap"),
          (_.NetheriteShovel = "minecraft:netherite_shovel"),
          (_.NetheriteSpear = "minecraft:netherite_spear"),
          (_.NetheriteSword = "minecraft:netherite_sword"),
          (_.NetheriteUpgradeSmithingTemplate =
            "minecraft:netherite_upgrade_smithing_template"),
          (_.Netherrack = "minecraft:netherrack"),
          (_.NormalStoneSlab = "minecraft:normal_stone_slab"),
          (_.NormalStoneStairs = "minecraft:normal_stone_stairs"),
          (_.Noteblock = "minecraft:noteblock"),
          (_.OakBoat = "minecraft:oak_boat"),
          (_.OakChestBoat = "minecraft:oak_chest_boat"),
          (_.OakFence = "minecraft:oak_fence"),
          (_.OakHangingSign = "minecraft:oak_hanging_sign"),
          (_.OakLeaves = "minecraft:oak_leaves"),
          (_.OakLog = "minecraft:oak_log"),
          (_.OakPlanks = "minecraft:oak_planks"),
          (_.OakSapling = "minecraft:oak_sapling"),
          (_.OakShelf = "minecraft:oak_shelf"),
          (_.OakSign = "minecraft:oak_sign"),
          (_.OakSlab = "minecraft:oak_slab"),
          (_.OakStairs = "minecraft:oak_stairs"),
          (_.OakWood = "minecraft:oak_wood"),
          (_.Observer = "minecraft:observer"),
          (_.Obsidian = "minecraft:obsidian"),
          (_.OcelotSpawnEgg = "minecraft:ocelot_spawn_egg"),
          (_.OchreFroglight = "minecraft:ochre_froglight"),
          (_.OminousBottle = "minecraft:ominous_bottle"),
          (_.OminousTrialKey = "minecraft:ominous_trial_key"),
          (_.OpenEyeblossom = "minecraft:open_eyeblossom"),
          (_.OrangeBundle = "minecraft:orange_bundle"),
          (_.OrangeCandle = "minecraft:orange_candle"),
          (_.OrangeCarpet = "minecraft:orange_carpet"),
          (_.OrangeConcrete = "minecraft:orange_concrete"),
          (_.OrangeConcretePowder = "minecraft:orange_concrete_powder"),
          (_.OrangeDye = "minecraft:orange_dye"),
          (_.OrangeGlazedTerracotta = "minecraft:orange_glazed_terracotta"),
          (_.OrangeHarness = "minecraft:orange_harness"),
          (_.OrangeShulkerBox = "minecraft:orange_shulker_box"),
          (_.OrangeStainedGlass = "minecraft:orange_stained_glass"),
          (_.OrangeStainedGlassPane = "minecraft:orange_stained_glass_pane"),
          (_.OrangeTerracotta = "minecraft:orange_terracotta"),
          (_.OrangeTulip = "minecraft:orange_tulip"),
          (_.OrangeWool = "minecraft:orange_wool"),
          (_.OxeyeDaisy = "minecraft:oxeye_daisy"),
          (_.OxidizedChiseledCopper = "minecraft:oxidized_chiseled_copper"),
          (_.OxidizedCopper = "minecraft:oxidized_copper"),
          (_.OxidizedCopperBars = "minecraft:oxidized_copper_bars"),
          (_.OxidizedCopperBulb = "minecraft:oxidized_copper_bulb"),
          (_.OxidizedCopperChain = "minecraft:oxidized_copper_chain"),
          (_.OxidizedCopperChest = "minecraft:oxidized_copper_chest"),
          (_.OxidizedCopperDoor = "minecraft:oxidized_copper_door"),
          (_.OxidizedCopperGolemStatue =
            "minecraft:oxidized_copper_golem_statue"),
          (_.OxidizedCopperGrate = "minecraft:oxidized_copper_grate"),
          (_.OxidizedCopperLantern = "minecraft:oxidized_copper_lantern"),
          (_.OxidizedCopperTrapdoor = "minecraft:oxidized_copper_trapdoor"),
          (_.OxidizedCutCopper = "minecraft:oxidized_cut_copper"),
          (_.OxidizedCutCopperSlab = "minecraft:oxidized_cut_copper_slab"),
          (_.OxidizedCutCopperStairs = "minecraft:oxidized_cut_copper_stairs"),
          (_.OxidizedLightningRod = "minecraft:oxidized_lightning_rod"),
          (_.PackedIce = "minecraft:packed_ice"),
          (_.PackedMud = "minecraft:packed_mud"),
          (_.Painting = "minecraft:painting"),
          (_.PaleHangingMoss = "minecraft:pale_hanging_moss"),
          (_.PaleMossBlock = "minecraft:pale_moss_block"),
          (_.PaleMossCarpet = "minecraft:pale_moss_carpet"),
          (_.PaleOakBoat = "minecraft:pale_oak_boat"),
          (_.PaleOakButton = "minecraft:pale_oak_button"),
          (_.PaleOakChestBoat = "minecraft:pale_oak_chest_boat"),
          (_.PaleOakDoor = "minecraft:pale_oak_door"),
          (_.PaleOakFence = "minecraft:pale_oak_fence"),
          (_.PaleOakFenceGate = "minecraft:pale_oak_fence_gate"),
          (_.PaleOakHangingSign = "minecraft:pale_oak_hanging_sign"),
          (_.PaleOakLeaves = "minecraft:pale_oak_leaves"),
          (_.PaleOakLog = "minecraft:pale_oak_log"),
          (_.PaleOakPlanks = "minecraft:pale_oak_planks"),
          (_.PaleOakPressurePlate = "minecraft:pale_oak_pressure_plate"),
          (_.PaleOakSapling = "minecraft:pale_oak_sapling"),
          (_.PaleOakShelf = "minecraft:pale_oak_shelf"),
          (_.PaleOakSign = "minecraft:pale_oak_sign"),
          (_.PaleOakSlab = "minecraft:pale_oak_slab"),
          (_.PaleOakStairs = "minecraft:pale_oak_stairs"),
          (_.PaleOakTrapdoor = "minecraft:pale_oak_trapdoor"),
          (_.PaleOakWood = "minecraft:pale_oak_wood"),
          (_.PandaSpawnEgg = "minecraft:panda_spawn_egg"),
          (_.Paper = "minecraft:paper"),
          (_.ParchedSpawnEgg = "minecraft:parched_spawn_egg"),
          (_.ParrotSpawnEgg = "minecraft:parrot_spawn_egg"),
          (_.PearlescentFroglight = "minecraft:pearlescent_froglight"),
          (_.Peony = "minecraft:peony"),
          (_.PetrifiedOakSlab = "minecraft:petrified_oak_slab"),
          (_.PhantomMembrane = "minecraft:phantom_membrane"),
          (_.PhantomSpawnEgg = "minecraft:phantom_spawn_egg"),
          (_.PigSpawnEgg = "minecraft:pig_spawn_egg"),
          (_.PiglinBannerPattern = "minecraft:piglin_banner_pattern"),
          (_.PiglinBruteSpawnEgg = "minecraft:piglin_brute_spawn_egg"),
          (_.PiglinHead = "minecraft:piglin_head"),
          (_.PiglinSpawnEgg = "minecraft:piglin_spawn_egg"),
          (_.PillagerSpawnEgg = "minecraft:pillager_spawn_egg"),
          (_.PinkBundle = "minecraft:pink_bundle"),
          (_.PinkCandle = "minecraft:pink_candle"),
          (_.PinkCarpet = "minecraft:pink_carpet"),
          (_.PinkConcrete = "minecraft:pink_concrete"),
          (_.PinkConcretePowder = "minecraft:pink_concrete_powder"),
          (_.PinkDye = "minecraft:pink_dye"),
          (_.PinkGlazedTerracotta = "minecraft:pink_glazed_terracotta"),
          (_.PinkHarness = "minecraft:pink_harness"),
          (_.PinkPetals = "minecraft:pink_petals"),
          (_.PinkShulkerBox = "minecraft:pink_shulker_box"),
          (_.PinkStainedGlass = "minecraft:pink_stained_glass"),
          (_.PinkStainedGlassPane = "minecraft:pink_stained_glass_pane"),
          (_.PinkTerracotta = "minecraft:pink_terracotta"),
          (_.PinkTulip = "minecraft:pink_tulip"),
          (_.PinkWool = "minecraft:pink_wool"),
          (_.Piston = "minecraft:piston"),
          (_.PitcherPlant = "minecraft:pitcher_plant"),
          (_.PitcherPod = "minecraft:pitcher_pod"),
          (_.PlayerHead = "minecraft:player_head"),
          (_.PlentyPotterySherd = "minecraft:plenty_pottery_sherd"),
          (_.Podzol = "minecraft:podzol"),
          (_.PointedDripstone = "minecraft:pointed_dripstone"),
          (_.PoisonousPotato = "minecraft:poisonous_potato"),
          (_.PolarBearSpawnEgg = "minecraft:polar_bear_spawn_egg"),
          (_.PolishedAndesite = "minecraft:polished_andesite"),
          (_.PolishedAndesiteSlab = "minecraft:polished_andesite_slab"),
          (_.PolishedAndesiteStairs = "minecraft:polished_andesite_stairs"),
          (_.PolishedBasalt = "minecraft:polished_basalt"),
          (_.PolishedBlackstone = "minecraft:polished_blackstone"),
          (_.PolishedBlackstoneBrickSlab =
            "minecraft:polished_blackstone_brick_slab"),
          (_.PolishedBlackstoneBrickStairs =
            "minecraft:polished_blackstone_brick_stairs"),
          (_.PolishedBlackstoneBrickWall =
            "minecraft:polished_blackstone_brick_wall"),
          (_.PolishedBlackstoneBricks = "minecraft:polished_blackstone_bricks"),
          (_.PolishedBlackstoneButton = "minecraft:polished_blackstone_button"),
          (_.PolishedBlackstonePressurePlate =
            "minecraft:polished_blackstone_pressure_plate"),
          (_.PolishedBlackstoneSlab = "minecraft:polished_blackstone_slab"),
          (_.PolishedBlackstoneStairs = "minecraft:polished_blackstone_stairs"),
          (_.PolishedBlackstoneWall = "minecraft:polished_blackstone_wall"),
          (_.PolishedDeepslate = "minecraft:polished_deepslate"),
          (_.PolishedDeepslateSlab = "minecraft:polished_deepslate_slab"),
          (_.PolishedDeepslateStairs = "minecraft:polished_deepslate_stairs"),
          (_.PolishedDeepslateWall = "minecraft:polished_deepslate_wall"),
          (_.PolishedDiorite = "minecraft:polished_diorite"),
          (_.PolishedDioriteSlab = "minecraft:polished_diorite_slab"),
          (_.PolishedDioriteStairs = "minecraft:polished_diorite_stairs"),
          (_.PolishedGranite = "minecraft:polished_granite"),
          (_.PolishedGraniteSlab = "minecraft:polished_granite_slab"),
          (_.PolishedGraniteStairs = "minecraft:polished_granite_stairs"),
          (_.PolishedTuff = "minecraft:polished_tuff"),
          (_.PolishedTuffSlab = "minecraft:polished_tuff_slab"),
          (_.PolishedTuffStairs = "minecraft:polished_tuff_stairs"),
          (_.PolishedTuffWall = "minecraft:polished_tuff_wall"),
          (_.PoppedChorusFruit = "minecraft:popped_chorus_fruit"),
          (_.Poppy = "minecraft:poppy"),
          (_.Porkchop = "minecraft:porkchop"),
          (_.Potato = "minecraft:potato"),
          (_.Potion = "minecraft:potion"),
          (_.PowderSnowBucket = "minecraft:powder_snow_bucket"),
          (_.Prismarine = "minecraft:prismarine"),
          (_.PrismarineBrickSlab = "minecraft:prismarine_brick_slab"),
          (_.PrismarineBricks = "minecraft:prismarine_bricks"),
          (_.PrismarineBricksStairs = "minecraft:prismarine_bricks_stairs"),
          (_.PrismarineCrystals = "minecraft:prismarine_crystals"),
          (_.PrismarineShard = "minecraft:prismarine_shard"),
          (_.PrismarineSlab = "minecraft:prismarine_slab"),
          (_.PrismarineStairs = "minecraft:prismarine_stairs"),
          (_.PrismarineWall = "minecraft:prismarine_wall"),
          (_.PrizePotterySherd = "minecraft:prize_pottery_sherd"),
          (_.Pufferfish = "minecraft:pufferfish"),
          (_.PufferfishBucket = "minecraft:pufferfish_bucket"),
          (_.PufferfishSpawnEgg = "minecraft:pufferfish_spawn_egg"),
          (_.Pumpkin = "minecraft:pumpkin"),
          (_.PumpkinPie = "minecraft:pumpkin_pie"),
          (_.PumpkinSeeds = "minecraft:pumpkin_seeds"),
          (_.PurpleBundle = "minecraft:purple_bundle"),
          (_.PurpleCandle = "minecraft:purple_candle"),
          (_.PurpleCarpet = "minecraft:purple_carpet"),
          (_.PurpleConcrete = "minecraft:purple_concrete"),
          (_.PurpleConcretePowder = "minecraft:purple_concrete_powder"),
          (_.PurpleDye = "minecraft:purple_dye"),
          (_.PurpleGlazedTerracotta = "minecraft:purple_glazed_terracotta"),
          (_.PurpleHarness = "minecraft:purple_harness"),
          (_.PurpleShulkerBox = "minecraft:purple_shulker_box"),
          (_.PurpleStainedGlass = "minecraft:purple_stained_glass"),
          (_.PurpleStainedGlassPane = "minecraft:purple_stained_glass_pane"),
          (_.PurpleTerracotta = "minecraft:purple_terracotta"),
          (_.PurpleWool = "minecraft:purple_wool"),
          (_.PurpurBlock = "minecraft:purpur_block"),
          (_.PurpurPillar = "minecraft:purpur_pillar"),
          (_.PurpurSlab = "minecraft:purpur_slab"),
          (_.PurpurStairs = "minecraft:purpur_stairs"),
          (_.Quartz = "minecraft:quartz"),
          (_.QuartzBlock = "minecraft:quartz_block"),
          (_.QuartzBricks = "minecraft:quartz_bricks"),
          (_.QuartzOre = "minecraft:quartz_ore"),
          (_.QuartzPillar = "minecraft:quartz_pillar"),
          (_.QuartzSlab = "minecraft:quartz_slab"),
          (_.QuartzStairs = "minecraft:quartz_stairs"),
          (_.Rabbit = "minecraft:rabbit"),
          (_.RabbitFoot = "minecraft:rabbit_foot"),
          (_.RabbitHide = "minecraft:rabbit_hide"),
          (_.RabbitSpawnEgg = "minecraft:rabbit_spawn_egg"),
          (_.RabbitStew = "minecraft:rabbit_stew"),
          (_.Rail = "minecraft:rail"),
          (_.RaiserArmorTrimSmithingTemplate =
            "minecraft:raiser_armor_trim_smithing_template"),
          (_.RavagerSpawnEgg = "minecraft:ravager_spawn_egg"),
          (_.RawCopper = "minecraft:raw_copper"),
          (_.RawCopperBlock = "minecraft:raw_copper_block"),
          (_.RawGold = "minecraft:raw_gold"),
          (_.RawGoldBlock = "minecraft:raw_gold_block"),
          (_.RawIron = "minecraft:raw_iron"),
          (_.RawIronBlock = "minecraft:raw_iron_block"),
          (_.RecoveryCompass = "minecraft:recovery_compass"),
          (_.RedBundle = "minecraft:red_bundle"),
          (_.RedCandle = "minecraft:red_candle"),
          (_.RedCarpet = "minecraft:red_carpet"),
          (_.RedConcrete = "minecraft:red_concrete"),
          (_.RedConcretePowder = "minecraft:red_concrete_powder"),
          (_.RedDye = "minecraft:red_dye"),
          (_.RedGlazedTerracotta = "minecraft:red_glazed_terracotta"),
          (_.RedHarness = "minecraft:red_harness"),
          (_.RedMushroom = "minecraft:red_mushroom"),
          (_.RedMushroomBlock = "minecraft:red_mushroom_block"),
          (_.RedNetherBrick = "minecraft:red_nether_brick"),
          (_.RedNetherBrickSlab = "minecraft:red_nether_brick_slab"),
          (_.RedNetherBrickStairs = "minecraft:red_nether_brick_stairs"),
          (_.RedNetherBrickWall = "minecraft:red_nether_brick_wall"),
          (_.RedSand = "minecraft:red_sand"),
          (_.RedSandstone = "minecraft:red_sandstone"),
          (_.RedSandstoneSlab = "minecraft:red_sandstone_slab"),
          (_.RedSandstoneStairs = "minecraft:red_sandstone_stairs"),
          (_.RedSandstoneWall = "minecraft:red_sandstone_wall"),
          (_.RedShulkerBox = "minecraft:red_shulker_box"),
          (_.RedStainedGlass = "minecraft:red_stained_glass"),
          (_.RedStainedGlassPane = "minecraft:red_stained_glass_pane"),
          (_.RedTerracotta = "minecraft:red_terracotta"),
          (_.RedTulip = "minecraft:red_tulip"),
          (_.RedWool = "minecraft:red_wool"),
          (_.Redstone = "minecraft:redstone"),
          (_.RedstoneBlock = "minecraft:redstone_block"),
          (_.RedstoneLamp = "minecraft:redstone_lamp"),
          (_.RedstoneOre = "minecraft:redstone_ore"),
          (_.RedstoneTorch = "minecraft:redstone_torch"),
          (_.ReinforcedDeepslate = "minecraft:reinforced_deepslate"),
          (_.Repeater = "minecraft:repeater"),
          (_.RepeatingCommandBlock = "minecraft:repeating_command_block"),
          (_.ResinBlock = "minecraft:resin_block"),
          (_.ResinBrick = "minecraft:resin_brick"),
          (_.ResinBrickSlab = "minecraft:resin_brick_slab"),
          (_.ResinBrickStairs = "minecraft:resin_brick_stairs"),
          (_.ResinBrickWall = "minecraft:resin_brick_wall"),
          (_.ResinBricks = "minecraft:resin_bricks"),
          (_.ResinClump = "minecraft:resin_clump"),
          (_.RespawnAnchor = "minecraft:respawn_anchor"),
          (_.RibArmorTrimSmithingTemplate =
            "minecraft:rib_armor_trim_smithing_template"),
          (_.RoseBush = "minecraft:rose_bush"),
          (_.RottenFlesh = "minecraft:rotten_flesh"),
          (_.Saddle = "minecraft:saddle"),
          (_.Salmon = "minecraft:salmon"),
          (_.SalmonBucket = "minecraft:salmon_bucket"),
          (_.SalmonSpawnEgg = "minecraft:salmon_spawn_egg"),
          (_.Sand = "minecraft:sand"),
          (_.Sandstone = "minecraft:sandstone"),
          (_.SandstoneSlab = "minecraft:sandstone_slab"),
          (_.SandstoneStairs = "minecraft:sandstone_stairs"),
          (_.SandstoneWall = "minecraft:sandstone_wall"),
          (_.Scaffolding = "minecraft:scaffolding"),
          (_.ScrapePotterySherd = "minecraft:scrape_pottery_sherd"),
          (_.Sculk = "minecraft:sculk"),
          (_.SculkCatalyst = "minecraft:sculk_catalyst"),
          (_.SculkSensor = "minecraft:sculk_sensor"),
          (_.SculkShrieker = "minecraft:sculk_shrieker"),
          (_.SculkVein = "minecraft:sculk_vein"),
          (_.SeaLantern = "minecraft:sea_lantern"),
          (_.SeaPickle = "minecraft:sea_pickle"),
          (_.Seagrass = "minecraft:seagrass"),
          (_.SentryArmorTrimSmithingTemplate =
            "minecraft:sentry_armor_trim_smithing_template"),
          (_.ShaperArmorTrimSmithingTemplate =
            "minecraft:shaper_armor_trim_smithing_template"),
          (_.SheafPotterySherd = "minecraft:sheaf_pottery_sherd"),
          (_.Shears = "minecraft:shears"),
          (_.SheepSpawnEgg = "minecraft:sheep_spawn_egg"),
          (_.ShelterPotterySherd = "minecraft:shelter_pottery_sherd"),
          (_.Shield = "minecraft:shield"),
          (_.ShortDryGrass = "minecraft:short_dry_grass"),
          (_.ShortGrass = "minecraft:short_grass"),
          (_.Shroomlight = "minecraft:shroomlight"),
          (_.ShulkerShell = "minecraft:shulker_shell"),
          (_.ShulkerSpawnEgg = "minecraft:shulker_spawn_egg"),
          (_.SilenceArmorTrimSmithingTemplate =
            "minecraft:silence_armor_trim_smithing_template"),
          (_.SilverGlazedTerracotta = "minecraft:silver_glazed_terracotta"),
          (_.SilverfishSpawnEgg = "minecraft:silverfish_spawn_egg"),
          (_.SkeletonHorseSpawnEgg = "minecraft:skeleton_horse_spawn_egg"),
          (_.SkeletonSkull = "minecraft:skeleton_skull"),
          (_.SkeletonSpawnEgg = "minecraft:skeleton_spawn_egg"),
          (_.SkullBannerPattern = "minecraft:skull_banner_pattern"),
          (_.SkullPotterySherd = "minecraft:skull_pottery_sherd"),
          (_.Slime = "minecraft:slime"),
          (_.SlimeBall = "minecraft:slime_ball"),
          (_.SlimeSpawnEgg = "minecraft:slime_spawn_egg"),
          (_.SmallAmethystBud = "minecraft:small_amethyst_bud"),
          (_.SmallDripleafBlock = "minecraft:small_dripleaf_block"),
          (_.SmithingTable = "minecraft:smithing_table"),
          (_.Smoker = "minecraft:smoker"),
          (_.SmoothBasalt = "minecraft:smooth_basalt"),
          (_.SmoothQuartz = "minecraft:smooth_quartz"),
          (_.SmoothQuartzSlab = "minecraft:smooth_quartz_slab"),
          (_.SmoothQuartzStairs = "minecraft:smooth_quartz_stairs"),
          (_.SmoothRedSandstone = "minecraft:smooth_red_sandstone"),
          (_.SmoothRedSandstoneSlab = "minecraft:smooth_red_sandstone_slab"),
          (_.SmoothRedSandstoneStairs =
            "minecraft:smooth_red_sandstone_stairs"),
          (_.SmoothSandstone = "minecraft:smooth_sandstone"),
          (_.SmoothSandstoneSlab = "minecraft:smooth_sandstone_slab"),
          (_.SmoothSandstoneStairs = "minecraft:smooth_sandstone_stairs"),
          (_.SmoothStone = "minecraft:smooth_stone"),
          (_.SmoothStoneSlab = "minecraft:smooth_stone_slab"),
          (_.SnifferEgg = "minecraft:sniffer_egg"),
          (_.SnifferSpawnEgg = "minecraft:sniffer_spawn_egg"),
          (_.SnortPotterySherd = "minecraft:snort_pottery_sherd"),
          (_.SnoutArmorTrimSmithingTemplate =
            "minecraft:snout_armor_trim_smithing_template"),
          (_.Snow = "minecraft:snow"),
          (_.SnowGolemSpawnEgg = "minecraft:snow_golem_spawn_egg"),
          (_.SnowLayer = "minecraft:snow_layer"),
          (_.Snowball = "minecraft:snowball"),
          (_.SoulCampfire = "minecraft:soul_campfire"),
          (_.SoulLantern = "minecraft:soul_lantern"),
          (_.SoulSand = "minecraft:soul_sand"),
          (_.SoulSoil = "minecraft:soul_soil"),
          (_.SoulTorch = "minecraft:soul_torch"),
          (_.SpiderEye = "minecraft:spider_eye"),
          (_.SpiderSpawnEgg = "minecraft:spider_spawn_egg"),
          (_.SpireArmorTrimSmithingTemplate =
            "minecraft:spire_armor_trim_smithing_template"),
          (_.SplashPotion = "minecraft:splash_potion"),
          (_.Sponge = "minecraft:sponge"),
          (_.SporeBlossom = "minecraft:spore_blossom"),
          (_.SpruceBoat = "minecraft:spruce_boat"),
          (_.SpruceButton = "minecraft:spruce_button"),
          (_.SpruceChestBoat = "minecraft:spruce_chest_boat"),
          (_.SpruceDoor = "minecraft:spruce_door"),
          (_.SpruceFence = "minecraft:spruce_fence"),
          (_.SpruceFenceGate = "minecraft:spruce_fence_gate"),
          (_.SpruceHangingSign = "minecraft:spruce_hanging_sign"),
          (_.SpruceLeaves = "minecraft:spruce_leaves"),
          (_.SpruceLog = "minecraft:spruce_log"),
          (_.SprucePlanks = "minecraft:spruce_planks"),
          (_.SprucePressurePlate = "minecraft:spruce_pressure_plate"),
          (_.SpruceSapling = "minecraft:spruce_sapling"),
          (_.SpruceShelf = "minecraft:spruce_shelf"),
          (_.SpruceSign = "minecraft:spruce_sign"),
          (_.SpruceSlab = "minecraft:spruce_slab"),
          (_.SpruceStairs = "minecraft:spruce_stairs"),
          (_.SpruceTrapdoor = "minecraft:spruce_trapdoor"),
          (_.SpruceWood = "minecraft:spruce_wood"),
          (_.Spyglass = "minecraft:spyglass"),
          (_.SquidSpawnEgg = "minecraft:squid_spawn_egg"),
          (_.Stick = "minecraft:stick"),
          (_.StickyPiston = "minecraft:sticky_piston"),
          (_.Stone = "minecraft:stone"),
          (_.StoneAxe = "minecraft:stone_axe"),
          (_.StoneBrickSlab = "minecraft:stone_brick_slab"),
          (_.StoneBrickStairs = "minecraft:stone_brick_stairs"),
          (_.StoneBrickWall = "minecraft:stone_brick_wall"),
          (_.StoneBricks = "minecraft:stone_bricks"),
          (_.StoneButton = "minecraft:stone_button"),
          (_.StoneHoe = "minecraft:stone_hoe"),
          (_.StonePickaxe = "minecraft:stone_pickaxe"),
          (_.StonePressurePlate = "minecraft:stone_pressure_plate"),
          (_.StoneShovel = "minecraft:stone_shovel"),
          (_.StoneSpear = "minecraft:stone_spear"),
          (_.StoneStairs = "minecraft:stone_stairs"),
          (_.StoneSword = "minecraft:stone_sword"),
          (_.StonecutterBlock = "minecraft:stonecutter_block"),
          (_.StraySpawnEgg = "minecraft:stray_spawn_egg"),
          (_.StriderSpawnEgg = "minecraft:strider_spawn_egg"),
          (_.String = "minecraft:string"),
          (_.StrippedAcaciaLog = "minecraft:stripped_acacia_log"),
          (_.StrippedAcaciaWood = "minecraft:stripped_acacia_wood"),
          (_.StrippedBambooBlock = "minecraft:stripped_bamboo_block"),
          (_.StrippedBirchLog = "minecraft:stripped_birch_log"),
          (_.StrippedBirchWood = "minecraft:stripped_birch_wood"),
          (_.StrippedCherryLog = "minecraft:stripped_cherry_log"),
          (_.StrippedCherryWood = "minecraft:stripped_cherry_wood"),
          (_.StrippedCrimsonHyphae = "minecraft:stripped_crimson_hyphae"),
          (_.StrippedCrimsonStem = "minecraft:stripped_crimson_stem"),
          (_.StrippedDarkOakLog = "minecraft:stripped_dark_oak_log"),
          (_.StrippedDarkOakWood = "minecraft:stripped_dark_oak_wood"),
          (_.StrippedJungleLog = "minecraft:stripped_jungle_log"),
          (_.StrippedJungleWood = "minecraft:stripped_jungle_wood"),
          (_.StrippedMangroveLog = "minecraft:stripped_mangrove_log"),
          (_.StrippedMangroveWood = "minecraft:stripped_mangrove_wood"),
          (_.StrippedOakLog = "minecraft:stripped_oak_log"),
          (_.StrippedOakWood = "minecraft:stripped_oak_wood"),
          (_.StrippedPaleOakLog = "minecraft:stripped_pale_oak_log"),
          (_.StrippedPaleOakWood = "minecraft:stripped_pale_oak_wood"),
          (_.StrippedSpruceLog = "minecraft:stripped_spruce_log"),
          (_.StrippedSpruceWood = "minecraft:stripped_spruce_wood"),
          (_.StrippedWarpedHyphae = "minecraft:stripped_warped_hyphae"),
          (_.StrippedWarpedStem = "minecraft:stripped_warped_stem"),
          (_.StructureBlock = "minecraft:structure_block"),
          (_.StructureVoid = "minecraft:structure_void"),
          (_.Sugar = "minecraft:sugar"),
          (_.SugarCane = "minecraft:sugar_cane"),
          (_.Sunflower = "minecraft:sunflower"),
          (_.SuspiciousGravel = "minecraft:suspicious_gravel"),
          (_.SuspiciousSand = "minecraft:suspicious_sand"),
          (_.SuspiciousStew = "minecraft:suspicious_stew"),
          (_.SweetBerries = "minecraft:sweet_berries"),
          (_.TadpoleBucket = "minecraft:tadpole_bucket"),
          (_.TadpoleSpawnEgg = "minecraft:tadpole_spawn_egg"),
          (_.TallDryGrass = "minecraft:tall_dry_grass"),
          (_.TallGrass = "minecraft:tall_grass"),
          (_.Target = "minecraft:target"),
          (_.TideArmorTrimSmithingTemplate =
            "minecraft:tide_armor_trim_smithing_template"),
          (_.TintedGlass = "minecraft:tinted_glass"),
          (_.Tnt = "minecraft:tnt"),
          (_.TntMinecart = "minecraft:tnt_minecart"),
          (_.Torch = "minecraft:torch"),
          (_.Torchflower = "minecraft:torchflower"),
          (_.TorchflowerSeeds = "minecraft:torchflower_seeds"),
          (_.TotemOfUndying = "minecraft:totem_of_undying"),
          (_.TraderLlamaSpawnEgg = "minecraft:trader_llama_spawn_egg"),
          (_.Trapdoor = "minecraft:trapdoor"),
          (_.TrappedChest = "minecraft:trapped_chest"),
          (_.TrialKey = "minecraft:trial_key"),
          (_.TrialSpawner = "minecraft:trial_spawner"),
          (_.Trident = "minecraft:trident"),
          (_.TripwireHook = "minecraft:tripwire_hook"),
          (_.TropicalFish = "minecraft:tropical_fish"),
          (_.TropicalFishBucket = "minecraft:tropical_fish_bucket"),
          (_.TropicalFishSpawnEgg = "minecraft:tropical_fish_spawn_egg"),
          (_.TubeCoral = "minecraft:tube_coral"),
          (_.TubeCoralBlock = "minecraft:tube_coral_block"),
          (_.TubeCoralFan = "minecraft:tube_coral_fan"),
          (_.Tuff = "minecraft:tuff"),
          (_.TuffBrickSlab = "minecraft:tuff_brick_slab"),
          (_.TuffBrickStairs = "minecraft:tuff_brick_stairs"),
          (_.TuffBrickWall = "minecraft:tuff_brick_wall"),
          (_.TuffBricks = "minecraft:tuff_bricks"),
          (_.TuffSlab = "minecraft:tuff_slab"),
          (_.TuffStairs = "minecraft:tuff_stairs"),
          (_.TuffWall = "minecraft:tuff_wall"),
          (_.TurtleEgg = "minecraft:turtle_egg"),
          (_.TurtleHelmet = "minecraft:turtle_helmet"),
          (_.TurtleScute = "minecraft:turtle_scute"),
          (_.TurtleSpawnEgg = "minecraft:turtle_spawn_egg"),
          (_.TwistingVines = "minecraft:twisting_vines"),
          (_.UndyedShulkerBox = "minecraft:undyed_shulker_box"),
          (_.Vault = "minecraft:vault"),
          (_.VerdantFroglight = "minecraft:verdant_froglight"),
          (_.VexArmorTrimSmithingTemplate =
            "minecraft:vex_armor_trim_smithing_template"),
          (_.VexSpawnEgg = "minecraft:vex_spawn_egg"),
          (_.VillagerSpawnEgg = "minecraft:villager_spawn_egg"),
          (_.VindicatorSpawnEgg = "minecraft:vindicator_spawn_egg"),
          (_.Vine = "minecraft:vine"),
          (_.WanderingTraderSpawnEgg = "minecraft:wandering_trader_spawn_egg"),
          (_.WardArmorTrimSmithingTemplate =
            "minecraft:ward_armor_trim_smithing_template"),
          (_.WardenSpawnEgg = "minecraft:warden_spawn_egg"),
          (_.WarpedButton = "minecraft:warped_button"),
          (_.WarpedDoor = "minecraft:warped_door"),
          (_.WarpedFence = "minecraft:warped_fence"),
          (_.WarpedFenceGate = "minecraft:warped_fence_gate"),
          (_.WarpedFungus = "minecraft:warped_fungus"),
          (_.WarpedFungusOnAStick = "minecraft:warped_fungus_on_a_stick"),
          (_.WarpedHangingSign = "minecraft:warped_hanging_sign"),
          (_.WarpedHyphae = "minecraft:warped_hyphae"),
          (_.WarpedNylium = "minecraft:warped_nylium"),
          (_.WarpedPlanks = "minecraft:warped_planks"),
          (_.WarpedPressurePlate = "minecraft:warped_pressure_plate"),
          (_.WarpedRoots = "minecraft:warped_roots"),
          (_.WarpedShelf = "minecraft:warped_shelf"),
          (_.WarpedSign = "minecraft:warped_sign"),
          (_.WarpedSlab = "minecraft:warped_slab"),
          (_.WarpedStairs = "minecraft:warped_stairs"),
          (_.WarpedStem = "minecraft:warped_stem"),
          (_.WarpedTrapdoor = "minecraft:warped_trapdoor"),
          (_.WarpedWartBlock = "minecraft:warped_wart_block"),
          (_.WaterBucket = "minecraft:water_bucket"),
          (_.Waterlily = "minecraft:waterlily"),
          (_.WaxedChiseledCopper = "minecraft:waxed_chiseled_copper"),
          (_.WaxedCopper = "minecraft:waxed_copper"),
          (_.WaxedCopperBars = "minecraft:waxed_copper_bars"),
          (_.WaxedCopperBulb = "minecraft:waxed_copper_bulb"),
          (_.WaxedCopperChain = "minecraft:waxed_copper_chain"),
          (_.WaxedCopperChest = "minecraft:waxed_copper_chest"),
          (_.WaxedCopperDoor = "minecraft:waxed_copper_door"),
          (_.WaxedCopperGolemStatue = "minecraft:waxed_copper_golem_statue"),
          (_.WaxedCopperGrate = "minecraft:waxed_copper_grate"),
          (_.WaxedCopperLantern = "minecraft:waxed_copper_lantern"),
          (_.WaxedCopperTrapdoor = "minecraft:waxed_copper_trapdoor"),
          (_.WaxedCutCopper = "minecraft:waxed_cut_copper"),
          (_.WaxedCutCopperSlab = "minecraft:waxed_cut_copper_slab"),
          (_.WaxedCutCopperStairs = "minecraft:waxed_cut_copper_stairs"),
          (_.WaxedExposedChiseledCopper =
            "minecraft:waxed_exposed_chiseled_copper"),
          (_.WaxedExposedCopper = "minecraft:waxed_exposed_copper"),
          (_.WaxedExposedCopperBars = "minecraft:waxed_exposed_copper_bars"),
          (_.WaxedExposedCopperBulb = "minecraft:waxed_exposed_copper_bulb"),
          (_.WaxedExposedCopperChain = "minecraft:waxed_exposed_copper_chain"),
          (_.WaxedExposedCopperChest = "minecraft:waxed_exposed_copper_chest"),
          (_.WaxedExposedCopperDoor = "minecraft:waxed_exposed_copper_door"),
          (_.WaxedExposedCopperGolemStatue =
            "minecraft:waxed_exposed_copper_golem_statue"),
          (_.WaxedExposedCopperGrate = "minecraft:waxed_exposed_copper_grate"),
          (_.WaxedExposedCopperLantern =
            "minecraft:waxed_exposed_copper_lantern"),
          (_.WaxedExposedCopperTrapdoor =
            "minecraft:waxed_exposed_copper_trapdoor"),
          (_.WaxedExposedCutCopper = "minecraft:waxed_exposed_cut_copper"),
          (_.WaxedExposedCutCopperSlab =
            "minecraft:waxed_exposed_cut_copper_slab"),
          (_.WaxedExposedCutCopperStairs =
            "minecraft:waxed_exposed_cut_copper_stairs"),
          (_.WaxedExposedLightningRod =
            "minecraft:waxed_exposed_lightning_rod"),
          (_.WaxedLightningRod = "minecraft:waxed_lightning_rod"),
          (_.WaxedOxidizedChiseledCopper =
            "minecraft:waxed_oxidized_chiseled_copper"),
          (_.WaxedOxidizedCopper = "minecraft:waxed_oxidized_copper"),
          (_.WaxedOxidizedCopperBars = "minecraft:waxed_oxidized_copper_bars"),
          (_.WaxedOxidizedCopperBulb = "minecraft:waxed_oxidized_copper_bulb"),
          (_.WaxedOxidizedCopperChain =
            "minecraft:waxed_oxidized_copper_chain"),
          (_.WaxedOxidizedCopperChest =
            "minecraft:waxed_oxidized_copper_chest"),
          (_.WaxedOxidizedCopperDoor = "minecraft:waxed_oxidized_copper_door"),
          (_.WaxedOxidizedCopperGolemStatue =
            "minecraft:waxed_oxidized_copper_golem_statue"),
          (_.WaxedOxidizedCopperGrate =
            "minecraft:waxed_oxidized_copper_grate"),
          (_.WaxedOxidizedCopperLantern =
            "minecraft:waxed_oxidized_copper_lantern"),
          (_.WaxedOxidizedCopperTrapdoor =
            "minecraft:waxed_oxidized_copper_trapdoor"),
          (_.WaxedOxidizedCutCopper = "minecraft:waxed_oxidized_cut_copper"),
          (_.WaxedOxidizedCutCopperSlab =
            "minecraft:waxed_oxidized_cut_copper_slab"),
          (_.WaxedOxidizedCutCopperStairs =
            "minecraft:waxed_oxidized_cut_copper_stairs"),
          (_.WaxedOxidizedLightningRod =
            "minecraft:waxed_oxidized_lightning_rod"),
          (_.WaxedWeatheredChiseledCopper =
            "minecraft:waxed_weathered_chiseled_copper"),
          (_.WaxedWeatheredCopper = "minecraft:waxed_weathered_copper"),
          (_.WaxedWeatheredCopperBars =
            "minecraft:waxed_weathered_copper_bars"),
          (_.WaxedWeatheredCopperBulb =
            "minecraft:waxed_weathered_copper_bulb"),
          (_.WaxedWeatheredCopperChain =
            "minecraft:waxed_weathered_copper_chain"),
          (_.WaxedWeatheredCopperChest =
            "minecraft:waxed_weathered_copper_chest"),
          (_.WaxedWeatheredCopperDoor =
            "minecraft:waxed_weathered_copper_door"),
          (_.WaxedWeatheredCopperGolemStatue =
            "minecraft:waxed_weathered_copper_golem_statue"),
          (_.WaxedWeatheredCopperGrate =
            "minecraft:waxed_weathered_copper_grate"),
          (_.WaxedWeatheredCopperLantern =
            "minecraft:waxed_weathered_copper_lantern"),
          (_.WaxedWeatheredCopperTrapdoor =
            "minecraft:waxed_weathered_copper_trapdoor"),
          (_.WaxedWeatheredCutCopper = "minecraft:waxed_weathered_cut_copper"),
          (_.WaxedWeatheredCutCopperSlab =
            "minecraft:waxed_weathered_cut_copper_slab"),
          (_.WaxedWeatheredCutCopperStairs =
            "minecraft:waxed_weathered_cut_copper_stairs"),
          (_.WaxedWeatheredLightningRod =
            "minecraft:waxed_weathered_lightning_rod"),
          (_.WayfinderArmorTrimSmithingTemplate =
            "minecraft:wayfinder_armor_trim_smithing_template"),
          (_.WeatheredChiseledCopper = "minecraft:weathered_chiseled_copper"),
          (_.WeatheredCopper = "minecraft:weathered_copper"),
          (_.WeatheredCopperBars = "minecraft:weathered_copper_bars"),
          (_.WeatheredCopperBulb = "minecraft:weathered_copper_bulb"),
          (_.WeatheredCopperChain = "minecraft:weathered_copper_chain"),
          (_.WeatheredCopperChest = "minecraft:weathered_copper_chest"),
          (_.WeatheredCopperDoor = "minecraft:weathered_copper_door"),
          (_.WeatheredCopperGolemStatue =
            "minecraft:weathered_copper_golem_statue"),
          (_.WeatheredCopperGrate = "minecraft:weathered_copper_grate"),
          (_.WeatheredCopperLantern = "minecraft:weathered_copper_lantern"),
          (_.WeatheredCopperTrapdoor = "minecraft:weathered_copper_trapdoor"),
          (_.WeatheredCutCopper = "minecraft:weathered_cut_copper"),
          (_.WeatheredCutCopperSlab = "minecraft:weathered_cut_copper_slab"),
          (_.WeatheredCutCopperStairs =
            "minecraft:weathered_cut_copper_stairs"),
          (_.WeatheredLightningRod = "minecraft:weathered_lightning_rod"),
          (_.Web = "minecraft:web"),
          (_.WeepingVines = "minecraft:weeping_vines"),
          (_.WetSponge = "minecraft:wet_sponge"),
          (_.Wheat = "minecraft:wheat"),
          (_.WheatSeeds = "minecraft:wheat_seeds"),
          (_.WhiteBundle = "minecraft:white_bundle"),
          (_.WhiteCandle = "minecraft:white_candle"),
          (_.WhiteCarpet = "minecraft:white_carpet"),
          (_.WhiteConcrete = "minecraft:white_concrete"),
          (_.WhiteConcretePowder = "minecraft:white_concrete_powder"),
          (_.WhiteDye = "minecraft:white_dye"),
          (_.WhiteGlazedTerracotta = "minecraft:white_glazed_terracotta"),
          (_.WhiteHarness = "minecraft:white_harness"),
          (_.WhiteShulkerBox = "minecraft:white_shulker_box"),
          (_.WhiteStainedGlass = "minecraft:white_stained_glass"),
          (_.WhiteStainedGlassPane = "minecraft:white_stained_glass_pane"),
          (_.WhiteTerracotta = "minecraft:white_terracotta"),
          (_.WhiteTulip = "minecraft:white_tulip"),
          (_.WhiteWool = "minecraft:white_wool"),
          (_.WildArmorTrimSmithingTemplate =
            "minecraft:wild_armor_trim_smithing_template"),
          (_.Wildflowers = "minecraft:wildflowers"),
          (_.WindCharge = "minecraft:wind_charge"),
          (_.WitchSpawnEgg = "minecraft:witch_spawn_egg"),
          (_.WitherRose = "minecraft:wither_rose"),
          (_.WitherSkeletonSkull = "minecraft:wither_skeleton_skull"),
          (_.WitherSkeletonSpawnEgg = "minecraft:wither_skeleton_spawn_egg"),
          (_.WitherSpawnEgg = "minecraft:wither_spawn_egg"),
          (_.WolfArmor = "minecraft:wolf_armor"),
          (_.WolfSpawnEgg = "minecraft:wolf_spawn_egg"),
          (_.WoodenAxe = "minecraft:wooden_axe"),
          (_.WoodenButton = "minecraft:wooden_button"),
          (_.WoodenDoor = "minecraft:wooden_door"),
          (_.WoodenHoe = "minecraft:wooden_hoe"),
          (_.WoodenPickaxe = "minecraft:wooden_pickaxe"),
          (_.WoodenPressurePlate = "minecraft:wooden_pressure_plate"),
          (_.WoodenShovel = "minecraft:wooden_shovel"),
          (_.WoodenSpear = "minecraft:wooden_spear"),
          (_.WoodenSword = "minecraft:wooden_sword"),
          (_.WritableBook = "minecraft:writable_book"),
          (_.YellowBundle = "minecraft:yellow_bundle"),
          (_.YellowCandle = "minecraft:yellow_candle"),
          (_.YellowCarpet = "minecraft:yellow_carpet"),
          (_.YellowConcrete = "minecraft:yellow_concrete"),
          (_.YellowConcretePowder = "minecraft:yellow_concrete_powder"),
          (_.YellowDye = "minecraft:yellow_dye"),
          (_.YellowGlazedTerracotta = "minecraft:yellow_glazed_terracotta"),
          (_.YellowHarness = "minecraft:yellow_harness"),
          (_.YellowShulkerBox = "minecraft:yellow_shulker_box"),
          (_.YellowStainedGlass = "minecraft:yellow_stained_glass"),
          (_.YellowStainedGlassPane = "minecraft:yellow_stained_glass_pane"),
          (_.YellowTerracotta = "minecraft:yellow_terracotta"),
          (_.YellowWool = "minecraft:yellow_wool"),
          (_.ZoglinSpawnEgg = "minecraft:zoglin_spawn_egg"),
          (_.ZombieHead = "minecraft:zombie_head"),
          (_.ZombieHorseSpawnEgg = "minecraft:zombie_horse_spawn_egg"),
          (_.ZombieNautilusSpawnEgg = "minecraft:zombie_nautilus_spawn_egg"),
          (_.ZombiePigmanSpawnEgg = "minecraft:zombie_pigman_spawn_egg"),
          (_.ZombieSpawnEgg = "minecraft:zombie_spawn_egg"),
          (_.ZombieVillagerSpawnEgg = "minecraft:zombie_villager_spawn_egg"),
          _),
        B =
          (((f = B || {}).Consume = "Consume"),
          (f.ThrownLingering = "ThrownLingering"),
          (f.ThrownSplash = "ThrownSplash"),
          f),
        P =
          (((p = P || {}).Awkward = "minecraft:awkward"),
          (p.FireResistance = "minecraft:fire_resistance"),
          (p.Harming = "minecraft:harming"),
          (p.Healing = "minecraft:healing"),
          (p.Infested = "minecraft:infested"),
          (p.Invisibility = "minecraft:invisibility"),
          (p.Leaping = "minecraft:leaping"),
          (p.LongFireResistance = "minecraft:long_fire_resistance"),
          (p.LongInvisibility = "minecraft:long_invisibility"),
          (p.LongLeaping = "minecraft:long_leaping"),
          (p.LongMundane = "minecraft:long_mundane"),
          (p.LongNightvision = "minecraft:long_nightvision"),
          (p.LongPoison = "minecraft:long_poison"),
          (p.LongRegeneration = "minecraft:long_regeneration"),
          (p.LongSlowFalling = "minecraft:long_slow_falling"),
          (p.LongSlowness = "minecraft:long_slowness"),
          (p.LongStrength = "minecraft:long_strength"),
          (p.LongSwiftness = "minecraft:long_swiftness"),
          (p.LongTurtleMaster = "minecraft:long_turtle_master"),
          (p.LongWaterBreathing = "minecraft:long_water_breathing"),
          (p.LongWeakness = "minecraft:long_weakness"),
          (p.Mundane = "minecraft:mundane"),
          (p.Nightvision = "minecraft:nightvision"),
          (p.Oozing = "minecraft:oozing"),
          (p.Poison = "minecraft:poison"),
          (p.Regeneration = "minecraft:regeneration"),
          (p.SlowFalling = "minecraft:slow_falling"),
          (p.Slowness = "minecraft:slowness"),
          (p.Strength = "minecraft:strength"),
          (p.StrongHarming = "minecraft:strong_harming"),
          (p.StrongHealing = "minecraft:strong_healing"),
          (p.StrongLeaping = "minecraft:strong_leaping"),
          (p.StrongPoison = "minecraft:strong_poison"),
          (p.StrongRegeneration = "minecraft:strong_regeneration"),
          (p.StrongSlowness = "minecraft:strong_slowness"),
          (p.StrongStrength = "minecraft:strong_strength"),
          (p.StrongSwiftness = "minecraft:strong_swiftness"),
          (p.StrongTurtleMaster = "minecraft:strong_turtle_master"),
          (p.Swiftness = "minecraft:swiftness"),
          (p.Thick = "minecraft:thick"),
          (p.TurtleMaster = "minecraft:turtle_master"),
          (p.Water = "minecraft:water"),
          (p.WaterBreathing = "minecraft:water_breathing"),
          (p.Weakness = "minecraft:weakness"),
          (p.Weaving = "minecraft:weaving"),
          (p.WindCharged = "minecraft:wind_charged"),
          (p.Wither = "minecraft:wither"),
          p);
    },
    890: (e, a, r) => {
      const { MinecraftColor: t } = r(243);
      function n(e, a) {
        var r = { seen: [], stylize: i };
        return (
          arguments.length >= 3 && (r.depth = arguments[2]),
          arguments.length >= 4 && (r.colors = arguments[3]),
          o(a)
            ? (r.showHidden = a)
            : a &&
              (function (e, a) {
                if (!a || !p(a)) return e;
                for (var r = Object.keys(a), t = r.length; t--;)
                  e[r[t]] = a[r[t]];
              })(r, a),
          c(r.showHidden) && (r.showHidden = !1),
          c(r.depth) && (r.depth = 2),
          c(r.colors) && (r.colors = !1),
          c(r.customInspect) && (r.customInspect = !0),
          r.colors && (r.stylize = s),
          k(r, e, r.depth)
        );
      }
      function i(e, a) {
        return e;
      }
      function o(e) {
        return "boolean" == typeof e;
      }
      function c(e) {
        return void 0 === e;
      }
      function s(e, a) {
        var r = n.styles[a];
        return r ? n.colors[r][0] + e + n.colors[r][1] : e;
      }
      function l(e) {
        return "function" == typeof e;
      }
      function m(e) {
        return "string" == typeof e;
      }
      function d(e) {
        return null === e;
      }
      function _(e, a) {
        return Object.prototype.hasOwnProperty.call(e, a);
      }
      function f(e) {
        return p(e) && "[object RegExp]" === h(e);
      }
      function p(e) {
        return "object" == typeof e && null !== e;
      }
      function u(e) {
        return p(e) && ("[object Error]" === h(e) || e instanceof Error);
      }
      function g(e) {
        return p(e) && "[object Date]" === h(e);
      }
      function h(e) {
        return Object.prototype.toString.call(e);
      }
      function b(e) {
        return "[" + Error.prototype.toString.call(e) + "]";
      }
      function k(e, a, r) {
        if (
          e.customInspect &&
          a &&
          l(a.inspect) &&
          a.inspect !== n &&
          (!a.constructor || a.constructor.prototype !== a)
        ) {
          var t = a.inspect(r, e);
          return (m(t) || (t = k(e, t, r)), t);
        }
        var i = (function (e, a) {
          if (c(a)) return e.stylize("undefined", "undefined");
          if (m(a)) {
            var r =
              "'" +
              JSON.stringify(a)
                .replace(/^"|"$/g, "")
                .replace(/'/g, "\\'")
                .replace(/\\"/g, '"') +
              "'";
            return e.stylize(r, "string");
          }
          return "number" == typeof a
            ? e.stylize("" + a, "number")
            : o(a)
              ? e.stylize("" + a, "boolean")
              : d(a)
                ? e.stylize("null", "null")
                : void 0;
        })(e, a);
        if (i) return i;
        var s = Object.keys(a),
          p = (function (e) {
            var a = {};
            return (
              e.forEach(function (e, r) {
                a[e] = !0;
              }),
              a
            );
          })(s);
        try {
          e.showHidden &&
            Object.getOwnPropertyNames &&
            (s = Object.getOwnPropertyNames(a));
        } catch (e) {}
        if (
          u(a) &&
          (s.indexOf("message") >= 0 || s.indexOf("description") >= 0)
        )
          return b(a);
        if (0 === s.length) {
          if (
            (function (e) {
              if ("function" != typeof e) return !1;
              const a = Object.getOwnPropertyDescriptor(e, "prototype");
              return !!a && !a.writable;
            })(a)
          )
            return (
              "[Function" +
              (h = a.name ? ": " + a.name : " (anonymous)") +
              "] " +
              k(e, a.prototype, r)
            );
          if (l(a)) {
            var h = a.name ? ": " + a.name : " (anonymous)";
            return e.stylize("[Function" + h + "]", "special");
          }
          if (f(a))
            return e.stylize(RegExp.prototype.toString.call(a), "regexp");
          if (g(a)) return e.stylize(Date.prototype.toString.call(a), "date");
          if (u(a)) return b(a);
        }
        var S,
          y = "",
          C = !1,
          x = ["{", "}"];
        return (
          Array.isArray(a) && ((C = !0), (x = ["[", "]"])),
          l(a) &&
            (y = "[Function" + (a.name ? ": " + a.name : " (anonymous)") + "]"),
          f(a) && (y = " " + RegExp.prototype.toString.call(a)),
          g(a) && (y = " " + Date.prototype.toUTCString.call(a)),
          u(a) && (y = " " + b(a)),
          0 !== s.length || (C && 0 != a.length)
            ? r < 0
              ? f(a)
                ? e.stylize(RegExp.prototype.toString.call(a), "regexp")
                : e.stylize("[Object]", "special")
              : (e.seen.push(a),
                (S = C
                  ? (function (e, a, r, t, n) {
                      for (var i = [], o = 0, c = a.length; o < c; ++o)
                        _(a, String(o))
                          ? i.push(w(e, a, r, t, String(o), !0))
                          : i.push("");
                      return (
                        n.forEach(function (n) {
                          n.match(/^\d+$/) || i.push(w(e, a, r, t, n, !0));
                        }),
                        i
                      );
                    })(e, a, r, p, s)
                  : s.map(function (t) {
                      return w(e, a, r, p, t, C);
                    })),
                e.seen.pop(),
                (function (e, a, r) {
                  return e.reduce(function (e, a) {
                    return (
                      a.indexOf("\n"),
                      e + a.replace(/§\d\d?/g, "").length + 1
                    );
                  }, 0) > 60
                    ? ("" === a ? "" : a + " ") +
                        r[0] +
                        "\n  " +
                        e.join(",\n  ") +
                        "\n" +
                        r[1]
                    : a + " " + r[0] + " " + e.join(", ") + " " + r[1];
                })(S, y, x))
            : x[0] + y + x[1]
        );
      }
      function w(e, a, r, t, n, i) {
        var o, s, l;
        l = { value: void 0 };
        try {
          l.value = a[n];
        } catch (e) {}
        try {
          Object.getOwnPropertyDescriptor &&
            (l = Object.getOwnPropertyDescriptor(a, n) || l);
        } catch (e) {}
        if (
          (l.get
            ? (s = l.set
                ? e.stylize("[Getter/Setter]", "special")
                : e.stylize("[Getter]", "special"))
            : l.set && (s = e.stylize("[Setter]", "special")),
          _(t, n) || (o = "[" + n + "]"),
          !s)
        )
          if (e.seen.indexOf(l.value) < 0) {
            if (
              (s = d(r) ? k(e, l.value, null) : k(e, l.value, r - 1)).indexOf(
                "\n",
              ) > -1
            )
              if (i)
                s = s
                  .split("\n")
                  .map(function (e) {
                    return "  " + e;
                  })
                  .join("\n")
                  .substr(2);
              else {
                const e = s.split("\n");
                s =
                  e.shift() +
                  "\n" +
                  e
                    .map(function (e) {
                      return "  " + e;
                    })
                    .join("\n");
              }
          } else s = e.stylize("[Circular]", "special");
        if (c(o)) {
          if (i && n.match(/^\d+$/)) return s;
          (o = JSON.stringify("" + n)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)
            ? ((o = o.substr(1, o.length - 2)), (o = e.stylize(o, "name")))
            : ((o = o
                .replace(/'/g, "\\'")
                .replace(/\\"/g, '"')
                .replace(/(^"|"$)/g, "'")),
              (o = e.stylize(o, "string")));
        }
        return o + ": " + s;
      }
      ((e.exports = { inspect: n }),
        (n.colors = {
          bold: [t.bold, t.reset],
          italic: [t.italic, t.reset],
          white: [t.white, t.reset],
          grey: [t.darkGray, t.reset],
          black: [t.black, t.reset],
          blue: [t.darkBlue, t.reset],
          cyan: [t.blue, t.reset],
          green: [t.darkGreen, t.reset],
          magenta: [t.darkPurple, t.reset],
          red: [t.red, t.reset],
          yellow: [t.gold, t.reset],
        }),
        (n.styles = {
          special: "cyan",
          number: "yellow",
          boolean: "yellow",
          undefined: "grey",
          null: "bold",
          string: "green",
          date: "magenta",
          regexp: "red",
        }));
    },
  },
  i = {};
function o(e) {
  var a = i[e];
  if (void 0 !== a) return a.exports;
  var r = (i[e] = { exports: {} });
  return (n[e].call(r.exports, r, r.exports, o), r.exports);
}
((o.n = (e) => {
  var a = e && e.__esModule ? () => e.default : () => e;
  return (o.d(a, { a }), a);
}),
  (o.d = (e, a) => {
    for (var r in a)
      o.o(a, r) &&
        !o.o(e, r) &&
        Object.defineProperty(e, r, { enumerable: !0, get: a[r] });
  }),
  (o.o = (e, a) => Object.prototype.hasOwnProperty.call(e, a)),
  (o.r = (e) => {
    ("undefined" != typeof Symbol &&
      Symbol.toStringTag &&
      Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
      Object.defineProperty(e, "__esModule", { value: !0 }));
  }));
var c = {};
(o.r(c),
  o.d(c, {
    clearInterval: () => U,
    clearTimeout: () => V,
    setInterval: () => $,
    setTimeout: () => J,
  }));
const s =
  ((l = {
    Player: () => e.Player,
    system: () => e.system,
    world: () => e.world,
  }),
  (m = {}),
  o.d(m, l),
  m);
var l, m;
const u = "dark7mc:script_block";
var g;
!(function (e) {
  (e.timestamp = "dark7mc:player_timestamp");
})(g || (g = {}));
const b = ((e) => {
    var a = {};
    return (o.d(a, e), a);
  })({
    ActionFormData: () => a.ActionFormData,
    FormCancelationReason: () => a.FormCancelationReason,
    ModalFormData: () => a.ModalFormData,
  });
var F = o(890),
  N = o(247),
  H = o.n(N);
const j = new Map();
class I {
  constructor(e, a, r = 0) {
    if ("function" != typeof e)
      throw new TypeError("Handler must be a function");
    if ("number" != typeof r || r < 0)
      throw new TypeError("Timeout must be a non-negative number");
    if ("boolean" != typeof a) throw new TypeError("Repeat must be a boolean");
    ((this.handler = e),
      (this.timeout = r),
      (this.repeat = a),
      (this.next = Date.now() + r),
      (this.isForgotten = !1),
      (this.id = this.trigger()),
      j.set(this.id, this));
  }
  trigger() {
    return s.system.runJob(
      (function* (e) {
        for (; !e.isForgotten;)
          if (Date.now() >= e.next) {
            try {
              yield e.handler();
            } catch (e) {
              console.error(e instanceof Error ? e : "Error: " + e);
            }
            e.repeat ? (e.next += e.timeout) : e.forget();
          } else yield;
      })(this),
    );
  }
  forget() {
    ((this.isForgotten = !0), s.system.clearJob(this.id), j.set(this.id, null));
  }
}
function $(e, a) {
  return new I(e, !0, a).id;
}
function J(e, a) {
  return new I(e, !1, a).id;
}
function U(e) {
  const a = j.get(e);
  !0 === a?.repeat && a.forget();
}
function V(e) {
  const a = j.get(e);
  !1 === a?.repeat && a.forget();
}
const Z = JSON.stringify;
async function q(e, a, r) {
  let t = {
    ...c,
    util: F,
    ...(await Promise.resolve().then(o.bind(o, 821))),
    ...(await import("@minecraft/common")),
    ...(await import("@minecraft/server")),
    ...(await import("@minecraft/server-ui")),
  };
  try {
    t = Object.assign(t, await import("@minecraft/server-gametest"));
  } catch {}
  try {
    t = Object.assign(t, await import("@minecraft/server-editor-bindings"));
  } catch {}
  try {
    t = Object.assign(
      t,
      await import("@minecraft/server-editor-private-bindings"),
    );
  } catch {}
  try {
    t = Object.assign(t, await import("@minecraft/server-editor"));
  } catch {}
  try {
    t = Object.assign(t, await import("@minecraft/server-net"));
  } catch {}
  try {
    t = Object.assign(t, await import("@minecraft/server-admin"));
  } catch {}
  try {
    t = Object.assign(t, await import("@minecraft/debug-utilities"));
  } catch {}
  try {
    t = Object.assign(t, await import("@minecraft/diagnostics"));
  } catch {}
  try {
    t = Object.assign(t, await import("@minecraft/server-graphics"));
  } catch {}
  const n = new Function(
    `{${Object.keys(t).join(",")}}`,
    `return (() => eval(${JSON.stringify(e)}));`,
  )(t)();
  if (!(n instanceof Promise)) return n;
  n.catch((e) => {
    Q(e, !0, a);
  });
}
function Q(e, a, r) {
  let i = (function (e) {
    if (!e.stack) return "";
    const a = e.stack.split("\n"),
      r = [],
      t = /at <eval> \(<input>:[0-9]+\)/i,
      n = /at <input>:[0-9]+/i;
    for (let e = 0; e < a.length; e++) {
      const i = a[e];
      (t.test(i) || n.test(i)) && r.push(e);
    }
    const i = Math.max(...r);
    return "\n" + a.filter((e, a) => a <= i).join("\n");
  })(e);
  const o = (a ? "Unhandled promise rejection: " : "") + String(e + i);
  r
    ? r.sendMessage(`§c${o}`)
    : console.error(`[Interpreter] ${o}`);
}
JSON.stringify = ((e, a, r) => Z.call(void 0, H()(e), a, r)).bind(JSON);
class X {
  constructor(e, a, r, t) {
    ((this.x = e),
      (this.y = a),
      (this.z = r),
      (this.id = `Interpreter::${t.id},${e},${a},${r}`));
    const n = s.world.getDynamicProperty(this.id);
    this.data = "string" == typeof n ? n : "";
  }
  write(e) {
    ((this.data = e), s.world.setDynamicProperty(this.id, e));
  }
  remove() {
    s.world.setDynamicProperty(this.id);
  }
  static get(e) {
    return new X(e.location.x, e.location.y, e.location.z, e.dimension);
  }
}
function ee(e, a) {
  const r = X.get(e),
    t = new b.ModalFormData();
  (t.title("Script Block"),
    t.textField("Text Field", "Type here", { defaultValue: r.data }),
    t.submitButton("Save"),
    t
      .show(a)
      .then((e) => {
        if (e.canceled || !e.formValues) return;
        const { formValues: t } = e,
          n = t[0];
        r.write(n);
      })
      .catch((r) => {
        Q(r, !1, a);
      }));
}
class ae {
  constructor() {
    ((this.onPlayerInteract = ({ block: e, player: a }) => {
      a &&
        !a.isSneaking &&
        a.getDynamicProperty(g.timestamp) !== s.system.currentTick &&
        (a.setDynamicProperty(g.timestamp, s.system.currentTick), ee(e, a));
    }),
      (this.onPlayerBreak = ({ block: e }) => {
        X.get(e).remove();
      }),
      (this.onPlayerInteract = this.onPlayerInteract.bind(this)),
      (this.onPlayerBreak = this.onPlayerBreak.bind(this)));
  }
}
class re {
  constructor(e, a, r) {
    ((this.x = e), (this.y = a), (this.z = r));
  }
  static get back() {
    return new this(0, 0, -1);
  }
  static get down() {
    return new this(0, -1, 0);
  }
  static get forward() {
    return new this(0, 0, 1);
  }
  static get left() {
    return new this(-1, 0, 0);
  }
  static get one() {
    return new this(1, 1, 1);
  }
  static get right() {
    return new this(1, 0, 0);
  }
  static get up() {
    return new this(0, 1, 0);
  }
  static get zero() {
    return new this(0, 0, 0);
  }
  static from(e) {
    return new re(e.x, e.y, e.z);
  }
  length() {
    return Math.hypot(this.x, this.y, this.z);
  }
  lengthSquared() {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }
  normalized() {
    const e = this.length(),
      a = this.x / e,
      r = this.y / e,
      t = this.z / e;
    return new re(a, r, t);
  }
  static add(e, a) {
    const r = new re(e.x, e.y, e.z);
    return ((r.x += a.x), (r.y += a.y), (r.z += a.z), r);
  }
  static cross(e, a) {
    return new re(
      e.y * a.z - e.z * a.y,
      e.z * a.x - e.x * a.z,
      e.x * a.y - e.y * a.x,
    );
  }
  static distance(e, a) {
    const r = a.x - e.x,
      t = a.y - e.y,
      n = a.z - e.z;
    return Math.hypot(r, t, n);
  }
  static divide(e, a) {
    const r = new re(e.x, e.y, e.z);
    return (
      "number" == typeof a
        ? ((r.x /= a), (r.y /= a), (r.z /= a))
        : ((r.x /= a.x), (r.y /= a.y), (r.z /= a.z)),
      r
    );
  }
  static lerp(e, a, r) {
    const t = new re(e.x, e.y, e.z);
    return (
      (t.x += (a.x - e.x) * r),
      (t.y += (a.y - e.y) * r),
      (t.z += (a.z - e.z) * r),
      t
    );
  }
  static max(e, a) {
    const r = [e, a],
      t = r.map(({ x: e, y: a, z: r }) => new re(e, a, r).length()),
      n = Math.max(...t),
      i = r[t.indexOf(n)];
    return new re(i.x, i.y, i.z);
  }
  static min(e, a) {
    const r = [e, a],
      t = r.map(({ x: e, y: a, z: r }) => new re(e, a, r).length()),
      n = Math.min(...t),
      i = r[t.indexOf(n)];
    return new re(i.x, i.y, i.z);
  }
  static multiply(e, a) {
    const r = new re(e.x, e.y, e.z);
    return (
      "number" == typeof a
        ? ((r.x *= a), (r.y *= a), (r.z *= a))
        : ((r.x *= a.x), (r.y *= a.y), (r.z *= a.z)),
      r
    );
  }
  static slerp(e, a, r) {
    const t = Math.acos(
        (function (e, a) {
          return e.map((r, t) => e[t] * a[t]).reduce((e, a) => e + a);
        })([e.x, e.y, e.z], [a.x, a.y, a.z]),
      ),
      n = Math.sin(t * (1 - r)) / Math.sin(t),
      i = Math.sin(t * r) / Math.sin(t);
    return new re(e.x * n + a.x * i, e.y * n + a.y * i, e.z * n + a.z * i);
  }
  static subtract(e, a) {
    const r = new re(e.x, e.y, e.z);
    return ((r.x -= a.x), (r.y -= a.y), (r.z -= a.z), r);
  }
  floor() {
    return new re(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }
  above() {
    return new re(this.x, this.y + 1, this.z);
  }
  between(e) {
    const a = e.x - this.x,
      r = e.y - this.y,
      t = e.z - this.z,
      n = [];
    for (let e = 0; e <= a; e++) {
      const a = e + this.x;
      for (let e = 0; e <= r; e++) {
        const r = e + this.y;
        for (let e = 0; e <= t; e++) {
          const t = e + this.z;
          n.push(new re(a, r, t));
        }
      }
    }
    return n;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z;
  }
  offset(e, a, r) {
    return new re(e + this.x, a + this.y, r + this.z);
  }
  isNear(e, a) {
    return re.distance(this, e) <= a;
  }
}
var te, ne, ie;
function oe(e, a) {
  const r = e?.below(),
    t = e?.above(),
    n = e?.south(),
    i = e?.north(),
    o = e?.east(),
    c = e?.west();
  if ("button" === a)
    switch (e.permutation.getAllStates().facing_direction) {
      case ie.down:
        return [
          t,
          i,
          n,
          o,
          c,
          r,
          r?.north(),
          r?.south(),
          r?.east(),
          r?.west(),
          r?.below(),
        ];
      case ie.up:
        return [
          t?.above(),
          t,
          t?.south(),
          t?.north(),
          t?.east(),
          t?.west(),
          i,
          n,
          o,
          c,
          r,
        ];
      case ie.north:
        return [
          t?.north(),
          t,
          i?.north(),
          i,
          c,
          c?.north(),
          o,
          o?.north(),
          n,
          r?.north(),
          r,
        ];
      case ie.south:
        return [
          t?.south(),
          t,
          n?.south(),
          n,
          c,
          c?.south(),
          o,
          o?.south(),
          i,
          r?.south(),
          r,
        ];
      case ie.west:
        return [
          t?.west(),
          t,
          c?.west(),
          c,
          n,
          n?.west(),
          i,
          i?.west(),
          o,
          r?.west(),
          r,
        ];
      case ie.east:
        return [
          t?.east(),
          t,
          o?.east(),
          o,
          n,
          n?.east(),
          i,
          i?.east(),
          c,
          r?.east(),
          r,
        ];
    }
  else {
    if ("pressure_plate" === a)
      return [
        t,
        i,
        n,
        o,
        c,
        r,
        r?.north(),
        r?.south(),
        r?.east(),
        r?.west(),
        r?.below(),
      ];
    if ("lever" === a) {
      const a = e.permutation?.getAllStates();
      switch (a.lever_direction) {
        case ne.north:
          return [
            t?.south(),
            t,
            n?.south(),
            n,
            c,
            c?.south(),
            o,
            o?.south(),
            i,
            r?.south(),
            r,
          ];
        case ne.south:
          return [
            t?.north(),
            t,
            i?.north(),
            i,
            c,
            c?.north(),
            o,
            o?.north(),
            n,
            r?.north(),
            r,
          ];
        case ne.east:
          return [
            t?.west(),
            t,
            c?.west(),
            c,
            n,
            n?.west(),
            i,
            i?.west(),
            o,
            r?.west(),
            r,
          ];
        case ne.west:
          return [
            t?.east(),
            t,
            o?.east(),
            o,
            n,
            n?.east(),
            i,
            i?.east(),
            c,
            r?.east(),
            r,
          ];
        case ne.up_east_west:
        case ne.up_north_south:
          return [
            t,
            i,
            n,
            o,
            c,
            r,
            r?.north(),
            r?.south(),
            r?.east(),
            r?.west(),
            r?.below(),
          ];
        case ne.down_north_south:
        case ne.down_east_west:
          return [
            t?.above(),
            t,
            t?.south(),
            t?.north(),
            t?.east(),
            t?.west(),
            i,
            n,
            o,
            c,
            r,
          ];
      }
    }
  }
  return [];
}
async function se(e, a, r = 1 / 0) {
  const t = s.system.currentTick;
  for (; s.system.currentTick - t < r;) {
    const r = await a.show(e);
    if (r.cancelationReason !== b.FormCancelationReason.UserBusy) return r;
  }
  throw new Error(`Timed out after ${r} ticks`);
}
async function le(e, a, r, t, n) {
  const i = await se(a, e[r]),
    o = t[r] - 1,
    c = 0 === r,
    s = r === t.length - 1;
  if (!i.canceled) {
    if (i.selection === o && ((c && !s) || (!c && !s)))
      return await le(e, a, r + 1, t, n);
    if (i.selection === o && s && !c) return await le(e, a, r - 1, t, n);
    if (i.selection !== o - 1 || c || s) {
      let { selection: e } = i;
      if (void 0 === e) throw new TypeError("Selection is undefined");
      return r * n + e;
    }
    return await le(e, a, r - 1, t, n);
  }
}
(!(function (e) {
  ((e[(e.Down = 0)] = "Down"),
    (e[(e.Up = 1)] = "Up"),
    (e[(e.Forward = 2)] = "Forward"),
    (e[(e.Back = 3)] = "Back"),
    (e[(e.Right = 4)] = "Right"),
    (e[(e.Left = 5)] = "Left"));
})(te || (te = {})),
  (function (e) {
    ((e.north = "north"),
      (e.south = "south"),
      (e.east = "east"),
      (e.west = "west"),
      (e.down_east_west = "down_east_west"),
      (e.down_north_south = "down_north_south"),
      (e.up_north_south = "up_north_south"),
      (e.up_east_west = "up_east_west"));
  })(ne || (ne = {})),
  (function (e) {
    ((e[(e.up = 0)] = "up"),
      (e[(e.down = 1)] = "down"),
      (e[(e.south = 2)] = "south"),
      (e[(e.north = 3)] = "north"),
      (e[(e.east = 4)] = "east"),
      (e[(e.west = 5)] = "west"));
  })(ie || (ie = {})),
  s.world.afterEvents.explosion.subscribe(function (e) {
    const a = e.getImpactedBlocks();
    for (const e of a) {
      if (!e.isValid || e.typeId !== u) return;
      X.get(e).remove();
    }
  }),
  s.world.afterEvents.pistonActivate.subscribe(function ({
    block: e,
    piston: a,
    isExpanding: r,
    dimension: t,
  }) {
    let n;
    const i = e.permutation.getState("facing_direction");
    if ((i === te.Up && r) || (i === te.Down && !r)) n = re.up;
    else if ((i === te.Down && r) || (i === te.Up && !r)) n = re.down;
    else if ((i === te.Left && r) || (i === te.Right && !r)) n = re.left;
    else if ((i === te.Right && r) || (i === te.Left && !r)) n = re.right;
    else if ((i === te.Forward && r) || (i === te.Back && !r)) n = re.forward;
    else {
      if (!((i === te.Back && r) || (i === te.Forward && !r))) return;
      n = re.back;
    }
    const o = a.getAttachedBlocks();
    for (const e of o) {
      const a = t.getBlock(e),
        r = t.getBlock(re.add(re.from(e), n));
      if (!a || !r) continue;
      const i = X.get(a);
      (X.get(r).write(i.data), i.remove());
    }
  }),
  s.world.afterEvents.pressurePlatePush.subscribe(function ({
    block: e,
    source: a,
  }) {
    const r = oe(e, "pressure_plate");
    for (const e of r)
      e?.typeId === u &&
        q(X.get(e).data)
          .catch((r) => {
            a instanceof s.Player && Q(r, !1, a);
          });
  }),
  s.world.afterEvents.buttonPush.subscribe(function ({ block: e, source: a }) {
    const r = oe(e, "button");
    for (const e of r)
      e &&
        e.typeId === u &&
        q(X.get(e).data)
          .catch((r) => {
            a instanceof s.Player && Q(r, !1, a);
          });
  }),
  s.world.afterEvents.leverAction.subscribe(function ({
    block: e,
    isPowered: a,
    player: r,
  }) {
    const t = oe(e, "lever");
    for (const e of t)
      e &&
        e.typeId === u &&
        a &&
        q(X.get(e).data)
          .catch((a) => {
            Q(a, !1, r);
          });
  }),
  s.system.beforeEvents.startup.subscribe((e) => {
    e.blockComponentRegistry.registerCustomComponent(
      "dark7mc:script_storage",
      new ae(),
    );
  }));
