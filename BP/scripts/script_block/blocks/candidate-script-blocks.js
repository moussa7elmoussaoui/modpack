import { ButtonFacing, LeverDirection } from "./facing-directions.js";

export function getCandidateScriptBlocks(block, deviceType) {
  const below = block?.below(),
    above = block?.above(),
    south = block?.south(),
    north = block?.north(),
    east = block?.east(),
    west = block?.west();
  if ("button" === deviceType)
    switch (block.permutation.getAllStates().facing_direction) {
      case ButtonFacing.down:
        return [
          above,
          north,
          south,
          east,
          west,
          below,
          below?.north(),
          below?.south(),
          below?.east(),
          below?.west(),
          below?.below(),
        ];
      case ButtonFacing.up:
        return [
          above?.above(),
          above,
          above?.south(),
          above?.north(),
          above?.east(),
          above?.west(),
          north,
          south,
          east,
          west,
          below,
        ];
      case ButtonFacing.north:
        return [
          above?.north(),
          above,
          north?.north(),
          north,
          west,
          west?.north(),
          east,
          east?.north(),
          south,
          below?.north(),
          below,
        ];
      case ButtonFacing.south:
        return [
          above?.south(),
          above,
          south?.south(),
          south,
          west,
          west?.south(),
          east,
          east?.south(),
          north,
          below?.south(),
          below,
        ];
      case ButtonFacing.west:
        return [
          above?.west(),
          above,
          west?.west(),
          west,
          south,
          south?.west(),
          north,
          north?.west(),
          east,
          below?.west(),
          below,
        ];
      case ButtonFacing.east:
        return [
          above?.east(),
          above,
          east?.east(),
          east,
          south,
          south?.east(),
          north,
          north?.east(),
          west,
          below?.east(),
          below,
        ];
    }
  else {
    if ("pressure_plate" === deviceType)
      return [
        above,
        north,
        south,
        east,
        west,
        below,
        below?.north(),
        below?.south(),
        below?.east(),
        below?.west(),
        below?.below(),
      ];
    if ("lever" === deviceType) {
      const states = block.permutation?.getAllStates();
      switch (states.lever_direction) {
        case LeverDirection.north:
          return [
            above?.south(),
            above,
            south?.south(),
            south,
            west,
            west?.south(),
            east,
            east?.south(),
            north,
            below?.south(),
            below,
          ];
        case LeverDirection.south:
          return [
            above?.north(),
            above,
            north?.north(),
            north,
            west,
            west?.north(),
            east,
            east?.north(),
            south,
            below?.north(),
            below,
          ];
        case LeverDirection.east:
          return [
            above?.west(),
            above,
            west?.west(),
            west,
            south,
            south?.west(),
            north,
            north?.west(),
            east,
            below?.west(),
            below,
          ];
        case LeverDirection.west:
          return [
            above?.east(),
            above,
            east?.east(),
            east,
            south,
            south?.east(),
            north,
            north?.east(),
            west,
            below?.east(),
            below,
          ];
        case LeverDirection.up_east_west:
        case LeverDirection.up_north_south:
          return [
            above,
            north,
            south,
            east,
            west,
            below,
            below?.north(),
            below?.south(),
            below?.east(),
            below?.west(),
            below?.below(),
          ];
        case LeverDirection.down_north_south:
        case LeverDirection.down_east_west:
          return [
            above?.above(),
            above,
            above?.south(),
            above?.north(),
            above?.east(),
            above?.west(),
            north,
            south,
            east,
            west,
            below,
          ];
      }
    }
  }
  return [];
}
