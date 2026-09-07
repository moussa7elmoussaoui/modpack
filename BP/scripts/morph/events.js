const beforeListeners = new Set();
const afterListeners = new Set();

function callListeners(listeners, event) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.error(error);
    }
  }
}

export function emitMorphEvent(event, applyMorph) {
  callListeners(beforeListeners, event);
  if (event.cancel) return false;

  applyMorph(event);
  callListeners(afterListeners, event);
  return true;
}

export const morphEvents = Object.freeze({
  beforeMorph: Object.freeze({
    subscribe(listener) {
      beforeListeners.add(listener);
      return listener;
    },
    unsubscribe(listener) {
      beforeListeners.delete(listener);
      return listener;
    }
  }),
  afterMorph: Object.freeze({
    subscribe(listener) {
      afterListeners.add(listener);
      return listener;
    },
    unsubscribe(listener) {
      afterListeners.delete(listener);
      return listener;
    }
  })
});
