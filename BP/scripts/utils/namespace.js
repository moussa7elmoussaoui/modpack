const NAMESPACE = "morphing_bracelet";

export const namespace = {
  value: NAMESPACE,
  toNamespacedId: (id) => `${NAMESPACE}:${id}`
};