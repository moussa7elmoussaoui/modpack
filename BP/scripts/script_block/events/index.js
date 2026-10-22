import { registerExplosionHandler } from "./explosion-events.js";
import { registerPistonHandler } from "./piston-events.js";
import {
  registerButtonHandler,
  registerLeverHandler,
  registerPressurePlateHandler,
} from "./redstone-events.js";
import { registerStartupHandler } from "./startup-events.js";

export function registerEventHandlers() {
  registerExplosionHandler();
  registerPistonHandler();
  registerPressurePlateHandler();
  registerButtonHandler();
  registerLeverHandler();
  registerStartupHandler();
}
