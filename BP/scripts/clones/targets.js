import { positionKey } from "./model";

const reservations = new Map();

export function clearTarget(brain) {
  if (brain.target && reservations.get(brain.target.key) === brain) reservations.delete(brain.target.key);
  brain.target = undefined;
}

export function reserveBlock(player, brain, position) {
  const key = player.dimension.id + ":" + positionKey(position);
  const previous = reservations.get(key);
  if (previous && previous !== brain) return;
  clearTarget(brain);
  reservations.set(key, brain);
  brain.target = { key, position, rejectedStands: new Set() };
  return brain.target;
}

export function isReserved(dimension, position) {
  return reservations.has(dimension.id + ":" + positionKey(position));
}
