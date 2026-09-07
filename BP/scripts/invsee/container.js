import { DimensionTypes, EntityComponentTypes, EquipmentSlot, system, world } from "@minecraft/server";
import { fitName } from "./titles";
import { errorFeedback, feedback, LocalizedError } from "../utils/messages";

const TYPES = { inventory: "dark7mc:invsee_inventory", enderchest: "dark7mc:invsee_enderchest" };
const EQUIPMENT = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand];
const byEntity = new Map();
const editors = new Map();
const TARGET_POLL_PERIOD = 4;

function cursor(player) {
  return player.isValid ? player.getComponent(EntityComponentTypes.CursorInventory) : undefined;
}

function inventory(player) {
  return player.isValid ? player.getComponent(EntityComponentTypes.Inventory)?.container : undefined;
}

function signature(item, includeAmount = true) {
  if (!item) return "";
  const properties = item.getDynamicPropertyIds().sort().map(key => [key, item.getDynamicProperty(key)]);
  const enchantments = item.getComponent("minecraft:enchantable")?.getEnchantments()
    .map(({ type, level }) => [type.id, level]).sort((a, b) => a[0].localeCompare(b[0]));
  return JSON.stringify([
    item.typeId, includeAmount ? item.amount : undefined, item.nameTag, item.getLore(), item.lockMode, item.keepOnDeath,
    item.getComponent("minecraft:durability")?.damage, enchantments,
    item.getCanPlaceOn(), item.getCanDestroy(), properties
  ]);
}

export class InventoryEditor {
  constructor(viewer, target, view) {
    this.viewer = viewer;
    this.target = target;
    this.view = view;
    this.key = `${target.id}:${view}`;
    this.size = view === "enderchest" ? 27 : 41;
    this.baseline = new Array(this.size).fill("");
    this.baselineItems = new Array(this.size);
    this.dirty = true;
    this.pollTicks = 0;
    this.active = true;
    this.closed = new Promise(resolve => { this.resolve = resolve; });
  }

  open() {
    if (editors.has(this.key)) throw new LocalizedError("invsee.error.already_edited");
    if (this.view === "inventory" && this.viewer.id === this.target.id) {
      throw new LocalizedError("invsee.error.own_inventory");
    }
    if (this.viewer.getComponent(EntityComponentTypes.Riding)) throw new LocalizedError("invsee.error.riding");
    if (this.viewer.isSneaking) throw new LocalizedError("invsee.error.sneaking");
    if (cursor(this.viewer)?.item || cursor(this.target)?.item) throw new LocalizedError("invsee.error.cursor");
    if (!this.targetContainer) throw new LocalizedError("invsee.error.unavailable");
    this.dimension = this.viewer.dimension.id;
    this.targetDimension = this.target.dimension.id;
    this.entity = this.viewer.dimension.spawnEntity(TYPES[this.view], this.viewer.location);
    try {
      this.entity.addTag("dark7mc:invsee");
      this.container = this.entity.getComponent(EntityComponentTypes.Inventory)?.container;
      if (!this.container) throw new LocalizedError("invsee.error.container_unavailable");
      for (let slot = 0; slot < this.size; slot++) {
        const item = this.readTarget(slot);
        this.baseline[slot] = signature(item);
        this.baselineItems[slot] = item;
        this.container.setItem(this.projectedSlot(slot), item);
      }
      this.refreshTitle();
      editors.set(this.key, this);
      byEntity.set(this.entity.id, this);
      if (!this.entity.getComponent(EntityComponentTypes.Rideable)?.addRider(this.viewer)) {
        throw new LocalizedError("invsee.error.open_failed");
      }
      this.timer = system.runInterval(() => this.tick(), 1);
      return this;
    } catch (error) {
      this.close(false);
      throw error;
    }
  }

  get targetContainer() {
    const component = this.view === "enderchest" ? EntityComponentTypes.EnderInventory : EntityComponentTypes.Inventory;
    return this.target.isValid ? this.target.getComponent(component)?.container : undefined;
  }

  projectedSlot(slot) {
    if (this.view === "enderchest") return slot;
    return slot < 9 ? slot + 27 : slot < 36 ? slot - 9 : slot + 9;
  }

  readTarget(slot) {
    if (slot < 36 || this.view === "enderchest") return this.targetContainer?.getItem(slot);
    return this.target.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EQUIPMENT[slot - 36]);
  }

  writeTarget(slot, item) {
    if (slot < 36 || this.view === "enderchest") {
      const container = this.targetContainer;
      if (!container) throw new LocalizedError("invsee.error.unavailable");
      container.setItem(slot, item);
      return true;
    }
    try {
      return this.target.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EQUIPMENT[slot - 36], item) ?? false;
    } catch (error) {
      if (!this.target.isValid) throw error;
      return false;
    }
  }

  refreshTitle() {
    const flags = this.baseline.slice(36).map(value => value ? "a" : "b").join("");
    const title = (this.view === "enderchest" ? "_dark7mc:enderchest:" : `_dark7mc:invsee:${flags}:`) + fitName(this.target.name, 60);
    if (this.entity.nameTag !== title) this.entity.nameTag = title;
  }

  pullTarget() {
    this.dirty = false;
    for (let slot = 0; slot < this.size; slot++) {
      const source = this.readTarget(slot);
      const current = signature(source);
      if (current !== this.baseline[slot]) {
        this.container.setItem(this.projectedSlot(slot), source);
        this.baseline[slot] = current;
        this.baselineItems[slot] = source;
      }
    }
  }

  pushChanges() {
    for (let slot = 0; slot < this.size; slot++) {
      const index = this.projectedSlot(slot);
      const item = this.container.getItem(index);
      const current = signature(item);
      if (current === this.baseline[slot]) continue;
      if (!this.writeTarget(slot, item)) {
        if (!this.writeTarget(slot, undefined)) throw new LocalizedError("invsee.error.equipment");
        this.container.setItem(index, undefined);
        this.baseline[slot] = "";
        this.baselineItems[slot] = undefined;
        if (item) this.returnToViewer(item);
        this.viewer.sendMessage(feedback("invsee.item_returned"));
      } else {
        this.baseline[slot] = current;
        this.baselineItems[slot] = item;
      }
    }
    this.reclaimUnusedSlots();
    this.refreshTitle();
  }

  synchronize() {
    if (this.dirty) this.pullTarget();
    this.pushChanges();
  }

  cursorComesFromTarget(held) {
    const identity = signature(held, false);
    return this.baselineItems.some((before, slot) => {
      if (!before || signature(before, false) !== identity) return false;
      const after = this.container.getItem(this.projectedSlot(slot));
      if (after && signature(after, false) !== identity) return false;
      return before.amount - (after?.amount ?? 0) >= held.amount;
    });
  }

  returnToViewer(item) {
    const container = inventory(this.viewer);
    const remainder = container?.addItem(item) ?? (container ? undefined : item);
    if (remainder) this.entity.dimension.spawnItem(remainder, this.entity.location);
  }

  reclaimUnusedSlots() {
    if (this.view === "enderchest") return;
    for (const slot of [36, 37, 38, 39, 40, 41, 42, 43, 44, 50, 51, 52, 53]) {
      const item = this.container.getItem(slot);
      if (!item) continue;
      this.returnToViewer(item);
      this.container.setItem(slot, undefined);
    }
  }

  tick() {
    try {
      if (!this.viewer.isValid || !this.target.isValid || !this.entity.isValid ||
          this.viewer.dimension.id !== this.dimension || this.target.dimension.id !== this.targetDimension ||
          this.viewer.getComponent(EntityComponentTypes.Riding)?.entityRidingOn?.id !== this.entity.id ||
          (this.viewer.getComponent(EntityComponentTypes.Health)?.currentValue ?? 0) <= 0 ||
          (this.target.getComponent(EntityComponentTypes.Health)?.currentValue ?? 0) <= 0) {
        this.close();
        return;
      }
      if (++this.pollTicks >= TARGET_POLL_PERIOD) {
        this.pollTicks = 0;
        this.dirty = true;
      }
      if (!cursor(this.viewer)?.item && !cursor(this.target)?.item) this.synchronize();
    } catch (error) {
      if (this.viewer.isValid) this.viewer.sendMessage(errorFeedback(error));
      this.close();
    }
  }

  close(settle = true) {
    if (!this.active) return;
    this.active = false;
    if (this.timer !== undefined) system.clearRun(this.timer);
    if (editors.get(this.key) === this) editors.delete(this.key);
    if (this.entity) byEntity.delete(this.entity.id);
    try {
      const held = settle ? cursor(this.viewer) : undefined;
      const stack = held?.item;
      const fromTarget = stack && this.container?.isValid && this.cursorComesFromTarget(stack);
      const canCommit = settle && this.container?.isValid && this.target.isValid &&
        (this.target.getComponent(EntityComponentTypes.Health)?.currentValue ?? 0) > 0;
      if (canCommit) this.pushChanges();
      if (stack) {
        if (fromTarget) {
          if (canCommit) {
            const remainder = this.targetContainer.addItem(stack);
            if (remainder) this.target.dimension.spawnItem(remainder, this.target.location);
          }
        } else {
          this.returnToViewer(stack);
        }
        held.clear();
      }
    } catch (error) {
      console.warn(`InvSee could not finish an inventory transaction: ${error}`);
    } finally {
      try {
        if (this.entity?.isValid) {
          try {
            this.entity.getComponent(EntityComponentTypes.Rideable)?.ejectRiders();
          } finally {
            if (this.entity.isValid) this.entity.remove();
          }
        }
      } catch (error) {
        console.warn(`InvSee could not remove its container: ${error}`);
      } finally {
        this.resolve();
      }
    }
  }
}

world.beforeEvents.playerInteractWithEntity.subscribe(event => {
  if (!Object.values(TYPES).includes(event.target.typeId)) return;
  if (byEntity.get(event.target.id)?.viewer.id !== event.player.id) event.cancel = true;
});
world.afterEvents.entityContainerClosed.subscribe(({ entity, closeSource }) => {
  const editor = byEntity.get(entity.id);
  if (editor && (!closeSource?.entity || closeSource.entity.id === editor.viewer.id)) {
    system.run(() => editor.close());
  }
});
world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  for (const editor of [...editors.values()]) {
    if (editor.viewer.id === playerId || editor.target.id === playerId) editor.close();
  }
});
world.afterEvents.entityRemove.subscribe(({ removedEntityId }) => byEntity.get(removedEntityId)?.close());
world.afterEvents.playerInventoryItemChange.subscribe(({ player }) => {
  const editor = editors.get(`${player.id}:inventory`);
  if (editor) editor.dirty = true;
});
world.afterEvents.entityLoad.subscribe(({ entity }) => {
  if (!Object.values(TYPES).includes(entity.typeId)) return;
  system.run(() => {
    if (entity.isValid && !byEntity.has(entity.id)) entity.remove();
  });
});
world.afterEvents.worldLoad.subscribe(() => {
  for (const dimension of DimensionTypes.getAll()) {
    for (const type of Object.values(TYPES)) {
      for (const entity of world.getDimension(dimension.typeId).getEntities({ type })) entity.remove();
    }
  }
});
