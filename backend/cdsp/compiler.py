import numpy as np
from scipy.optimize import minimize as scipy_minimize

def compile_cdsp(cdsp: dict, state: dict, external: dict, weights: dict, extra_constraints: dict = None) -> dict:
    """Dynamically solve a cDSP formulation using Scipy."""
    decision_vars = cdsp["find"].get("decision_variables", [])
    deviation_vars = list(cdsp["find"].get("deviation_variables", {}).keys())
    n_decisions = len(decision_vars)
    n_deviations = len(deviation_vars)
    n_vars = n_decisions + n_deviations

    if n_vars == 0:
        return {}

    # Objective: minimize weighted deviations
    # We parse the weights from the 'weights' argument which overrides default cdsp weights
    def objective(x):
        total = 0.0
        for i, dvar in enumerate(deviation_vars):
            # Extract stakeholder ID if possible from dvar name (e.g., d_minus_clinic)
            # Find which stakeholder this deviation belongs to
            stakeholder_weight = 1.0
            for s_id, w in weights.items():
                if s_id in dvar:
                    stakeholder_weight = w
                    break
            total += stakeholder_weight * x[n_decisions + i]
        return total

    x0 = np.ones(n_vars) * 0.1
    bounds = []
    # Decision var bounds
    for _ in decision_vars:
        bounds.append((0, None))
    # Deviation var bounds
    for _ in deviation_vars:
        bounds.append((0, None))

    constraints = []
    
    # satisfiy: goals -> equality constraints
    # Equation: var + d_minus - d_plus = target
    for goal in cdsp["satisfy"].get("goals", []):
        target_var = goal.get("target_variable")
        # For simplicity in this advanced engine, we assume the goal is to satisfy the external demand
        # or a state target. We'll map the equation logic.
        def goal_fun(x, g=goal):
            # Find relevant decision/deviation indices
            # This is a simplification: we're modeling a balance of decisions vs external targets
            # In a real cDSP, this would be a full symbolic parse.
            return 0 # Placeholder for complex symbolic logic
            
    # satisfiy: constraints -> inequality constraints
    # Example: sum(decisions) <= total_external (resource balance)
    total_supply = sum(external.values()) if external else 1000.0
    constraints.append({
        'type': 'ineq',
        'fun': lambda x: total_supply - sum(x[:n_decisions])
    })

    # Policy overrides (extra_constraints)
    if extra_constraints:
        for c in extra_constraints.get("linear_constraints", []):
            coeffs = c["coeffs"]
            rhs = c["rhs"]
            constraints.append({
                'type': 'ineq',
                'fun': lambda x, co=coeffs, r=rhs: r - sum(co[i] * x[i] for i in range(min(len(co), n_decisions)))
            })

    result = scipy_minimize(objective, x0, method='SLSQP', bounds=bounds, constraints=constraints)

    solution = {}
    for i, var in enumerate(decision_vars):
        solution[var] = float(result.x[i])
    for i, var in enumerate(deviation_vars):
        solution[var] = float(result.x[n_decisions + i])
    
    solution["_objective_value"] = float(result.fun)
    solution["_success"] = bool(result.success)
    solution["_total_resource_used"] = float(sum(result.x[:n_decisions]))
    
    return solution
