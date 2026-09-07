import { EntityComponentTypes, system, world } from "@minecraft/server";
import { FormCancelationReason, uiManager } from "@minecraft/server-ui";
import Waila from "../waila/core/Waila";
import { InventoryMirror } from "../waila/core/InventoryMirror";
import { morphForm, readMorphMenu, selectTargetMorph, variantsForm } from "./morphs";
import { InventoryEditor } from "./container";
import { errorFeedback, LocalizedError } from "../utils/messages";

const ACTIVE_PROPERTY = "dark7mc:invsee_active";
const sessions = new Map();
const participants = new Map();
const waitTicks = ticks => new Promise(resolve => system.runTimeout(resolve, ticks));

export function isInvseeOpen(player) { return sessions.has(player.id); }

function alive(session) {
  return session.active && session.viewer.isValid && session.target.isValid &&
    session.viewer.dimension.id === session.dimension &&
    session.target.dimension.id === session.targetDimension &&
    (session.viewer.getComponent(EntityComponentTypes.Health)?.currentValue ?? 0) > 0 &&
    (session.target.getComponent(EntityComponentTypes.Health)?.currentValue ?? 0) > 0;
}

function stop(session) {
  if (!session.active) return;
  session.active = false;
  session.cancel({ canceled: true });
  session.editor?.close();
  if (session.view === "omnitrix" && session.viewer.isValid) uiManager.closeAllForms(session.viewer);
}

async function show(session, form) {
  for (let attempt = 0; attempt < 50; attempt++) {
    await waitTicks(2);
    if (!alive(session)) return { canceled: true };
    const response = await Promise.race([form.show(session.viewer), session.closed]);
    if (!alive(session)) return { canceled: true };
    if (response.cancelationReason !== FormCancelationReason.UserBusy) return response;
  }
  throw new LocalizedError("invsee.error.screen_busy");
}

function cleanRead(target, callback) {
  InventoryMirror.restore(target);
  return callback();
}

async function showOmnitrix(session) {
  while (alive(session)) {
    const menu = cleanRead(session.target, () => readMorphMenu(session.target));
    const response = await show(session, morphForm(session.target, menu));
    if (response.canceled) return;
    const entry = menu.entries[response.selection];
    if (!entry) return;
    let id = entry.variants[0];
    if (entry.variants.length > 1) {
      const variant = await show(session, variantsForm(session.target, entry.variants));
      if (variant.canceled) continue;
      id = entry.variants[variant.selection];
    }
    if (id && alive(session)) cleanRead(session.target, () => selectTargetMorph(session.target, id));
    return;
  }
}

function pauseWaila(player) {
  const existing = participants.get(player.id);
  if (existing) {
    existing.count++;
    return;
  }
  const previous = player.getDynamicProperty(ACTIVE_PROPERTY);
  player.setDynamicProperty(ACTIVE_PROPERTY, true);
  participants.set(player.id, { count: 1, previous });
  Waila.getInstance().clearUI(player);
}

function resumeWaila(player) {
  const participant = participants.get(player.id);
  if (!participant || --participant.count > 0) return;
  participants.delete(player.id);
  if (player.isValid) player.setDynamicProperty(ACTIVE_PROPERTY, participant.previous);
}

export async function openInvsee(viewer, target, view = "inventory") {
  if (!viewer.isValid || !target.isValid) return;
  if (sessions.has(viewer.id)) return viewer.sendMessage(errorFeedback(new LocalizedError("invsee.error.already_open")));
  let cancel;
  const closed = new Promise(resolve => { cancel = resolve; });
  const session = { viewer, target, view, dimension: viewer.dimension.id, targetDimension: target.dimension.id, active: true, cancel, closed };
  sessions.set(viewer.id, session);
  const paused = [];
  let monitor;
  try {
    for (const player of viewer.id === target.id ? [viewer] : [viewer, target]) {
      pauseWaila(player);
      paused.push(player);
    }
    monitor = system.runInterval(() => { if (!alive(session)) stop(session); }, 5);
    if (view === "omnitrix") await showOmnitrix(session);
    else if (view === "inventory" || view === "enderchest") {
      session.editor = new InventoryEditor(viewer, target, view).open();
      await session.editor.closed;
    }
    else throw new LocalizedError("invsee.error.invalid_view");
  } catch (error) {
    if (viewer.isValid) viewer.sendMessage(errorFeedback(error));
  } finally {
    session.active = false;
    session.cancel({ canceled: true });
    session.editor?.close();
    if (monitor !== undefined) system.clearRun(monitor);
    for (const player of paused) resumeWaila(player);
    sessions.delete(viewer.id);
  }
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (initialSpawn && !participants.has(player.id)) player.setDynamicProperty(ACTIVE_PROPERTY, undefined);
});
world.afterEvents.worldLoad.subscribe(() => {
  for (const player of world.getAllPlayers()) player.setDynamicProperty(ACTIVE_PROPERTY, undefined);
});
