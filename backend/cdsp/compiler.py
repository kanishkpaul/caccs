import numpy as np
from scipy.optimize import minimize as scipy_minimize


def compile_cdsp(cdsp: dict, state: dict, external: dict, weights: dict, extra_constraints: dict = None) -> dict:
    """Compile and solve a cDSP formulation for a single timestep using scipy."""
    decision_vars = cdsp["find"]["decision_variables"]
    deviation_vars = list(cdsp["find"]["deviation_variables"].keys())
    n_decisions = len(decision_vars)
    n_deviations = len(deviation_vars)
    n_vars = n_decisions + n_deviations

    if n_vars == 0:
        return {}

    # Objective: minimize weighted deviations
    def objective(x):
        total = 0.0
        for i, dvar in enumerate(deviation_vars):
            if "d_minus" in dvar:
                w_idx = i % max(len(weights), 1)
                w = list(weights.values())[w_idx] if weights else 1.0
                total += w * x[n_decisions + i]
        return total

    x0 = np.ones(n_vars) * 0.1
    bounds = [(0, None)] * n_vars

    constraints = []
    if extra_constraints:
        for c in extra_constraints.get("linear_constraints", []):
            coeffs = c["coeffs"]
            rhs = c["rhs"]
            constraints.append({
                'type': 'ineq',
                'fun': lambda x, co=coeffs, r=rhs: r - sum(co[i] * x[i] for i in range(min(len(co), len(x))))
            })

    # Resource balance constraint
    total_external = sum(external.values()) if external else 100.0
    if n_decisions > 0:
        constraints.append({
            'type': 'ineq',
            'fun': lambda x: total_external - sum(x[:n_decisions])
        })

    result = scipy_minimize(objective, x0, method='SLSQP', bounds=bounds, constraints=constraints)

    solution = {}
    for i, var in enumerate(decision_vars):
        solution[var] = float(result.x[i])
    for i, var in enumerate(deviation_vars):
        solution[var] = float(result.x[n_decisions + i])
    solution["_objective_value"] = float(result.fun)
    solution["_success"] = bool(result.success)

    return solution
