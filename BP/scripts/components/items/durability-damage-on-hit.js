export default {
  id: "durability_damage_on_hit",
  onBeforeDurabilityDamage: (event, { params }) => {
    event.durabilityDamage = params.durability_damage;
  }
};