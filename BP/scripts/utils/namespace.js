const NAMESPACE = "dark7mc";

export const namespace = {
  value: NAMESPACE,
  toNamespacedId: (id) => `${NAMESPACE}:${id}`
};