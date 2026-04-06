soh = state.get("battery_soh", 1.0)
soc = state.get("battery_soc", 1.0)
capacity = state.get("usable_capacity", 200.0)

discharge = decision.get("battery_discharge", 0)
pv_available = external.get("pv_generation", 300)

depth_of_discharge = discharge / capacity if capacity > 0 else 0
degradation_rate = 0.002 * depth_of_discharge
new_soh = max(soh - degradation_rate, 0.0)

new_soc = max(soc - discharge / capacity, 0.0)
total_allocated = sum(v for k, v in decision.items() if k.startswith("alloc_"))
excess_pv = max(pv_available - total_allocated, 0)
new_soc = min(new_soc + excess_pv / capacity, 1.0)

new_capacity = 200 * new_soh

new_state = {
    "battery_soh": new_soh,
    "battery_soc": new_soc,
    "usable_capacity": new_capacity
}
