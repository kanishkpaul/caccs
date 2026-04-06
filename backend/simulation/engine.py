import numpy as np
from dataclasses import dataclass, field
from backend.cdsp.compiler import compile_cdsp


@dataclass
class SimulationConfig:
    horizon: int = 30
    policies: list = field(default_factory=lambda: ["baseline", "context_aware"])
    initial_state: dict = field(default_factory=dict)
    external_schedule: list = field(default_factory=list)
    weight_scenarios: list = field(default_factory=list)


@dataclass
class SimulationResult:
    policy: str
    scenario: str
    daily_decisions: list
    daily_states: list
    metrics: dict


def run_simulation(
    cdsp: dict,
    config: SimulationConfig,
    state_update_fn: str,
    policy_constraints: dict
) -> list[dict]:
    """Execute the cDSP simulation over a time horizon for each policy and scenario."""
    results = []

    for policy_name in config.policies:
        for scenario in config.weight_scenarios:
            result = _simulate_single(
                cdsp, config, policy_name, scenario,
                state_update_fn, policy_constraints.get(policy_name, {})
            )
            results.append({
                "policy": result.policy,
                "scenario": result.scenario,
                "daily_decisions": result.daily_decisions,
                "daily_states": result.daily_states,
                "metrics": result.metrics
            })

    return results


def _simulate_single(
    cdsp, config, policy_name, scenario, state_update_fn, extra_constraints
) -> SimulationResult:
    """Run one policy x one scenario over the full horizon."""
    state = dict(config.initial_state)
    daily_decisions = []
    daily_states = [dict(state)]

    for day in range(config.horizon):
        external = config.external_schedule[day] if day < len(config.external_schedule) else {}

        weights = scenario if isinstance(scenario, dict) else {}
        decision = compile_cdsp(cdsp, state, external, weights, extra_constraints)
        daily_decisions.append(decision)

        state = _execute_state_update(state, decision, external, state_update_fn)
        daily_states.append(dict(state))

    from backend.simulation.metrics import compute_metrics
    metrics = compute_metrics(daily_decisions, daily_states, cdsp)

    return SimulationResult(
        policy=policy_name,
        scenario=str(scenario),
        daily_decisions=daily_decisions,
        daily_states=daily_states,
        metrics=metrics
    )


def _execute_state_update(state: dict, decision: dict, external: dict, update_fn_code: str) -> dict:
    """Execute state update function. Uses exec in a restricted namespace for safety."""
    namespace = {
        "state": dict(state),
        "decision": dict(decision),
        "external": dict(external),
        "max": max,
        "min": min,
        "sum": sum,
        "abs": abs,
    }

    try:
        exec(update_fn_code, {"__builtins__": {}}, namespace)
        return namespace.get("new_state", state)
    except Exception as e:
        # If state update fails, return unchanged state
        return state
