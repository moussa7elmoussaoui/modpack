const RESOURCE_PACK_ID = "f601f51f-e87c-45a6-ad47-7c156825de21";
const NAMESPACE = "dark7mc";

export function getResourcePackId() {
  return RESOURCE_PACK_ID;
}

export const namespace = {
  value: NAMESPACE,
  toNamespacedId: (id) => `${NAMESPACE}:${id}`
};