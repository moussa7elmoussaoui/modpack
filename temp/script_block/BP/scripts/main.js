import { registerEventHandlers } from "./events/index.js";
import { installDeepCloneJsonStringify } from "./json-patch.js";

installDeepCloneJsonStringify();
registerEventHandlers();
