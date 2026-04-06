DEFAULT_POLICIES = {
    "baseline": {
        "description": "No constraints on resource use — maximize immediate service delivery.",
        "constraints": {}
    },
    "context_aware": {
        "description": "CACCS policy — cap on resource discharge to preserve long-term health.",
        "constraints": {
            "linear_constraints": [
                {
                    "description": "Battery discharge cap (50 kWh/day)",
                    "coeffs": [0, 0, 0, 1.0],  # coefficient on discharge variable
                    "rhs": 50.0
                }
            ]
        }
    },
    "aggressive": {
        "description": "Maximize short-term delivery with no regard for degradation.",
        "constraints": {}
    },
    "conservative": {
        "description": "Strict resource preservation — minimize discharge.",
        "constraints": {
            "linear_constraints": [
                {
                    "description": "Strict discharge cap (25 kWh/day)",
                    "coeffs": [0, 0, 0, 1.0],
                    "rhs": 25.0
                }
            ]
        }
    }
}


def get_policy_constraints(policy_name: str, custom_constraints: dict = None) -> dict:
    """Get constraint set for a named policy."""
    if custom_constraints:
        return custom_constraints
    return DEFAULT_POLICIES.get(policy_name, {}).get("constraints", {})
