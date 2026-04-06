CDSP_TEMPLATES = {
    "short_vs_long_tradeoff": {
        "description": "Fixes That Fail: balance short-term relief vs long-term preservation",
        "structure": {
            "given": [
                "Current state of system resource (e.g., battery SOH, SoC)",
                "External input availability (e.g., PV generation)",
                "Stakeholder demands",
                "Priority weights"
            ],
            "find": [
                "Allocation to each stakeholder (decision variables)",
                "Corrective action intensity (e.g., battery discharge)",
                "Deviation variables for each goal (d+, d-)"
            ],
            "satisfy": {
                "goals": [
                    "Stakeholder service level targets (one per stakeholder)",
                    "Resource preservation target (e.g., SOH floor)"
                ],
                "constraints": [
                    "Resource balance (supply = allocated + stored + lost)",
                    "Demand bounds (allocation <= demand for each stakeholder)",
                    "Physical feasibility (resource capacity limits)",
                    "Corrective action cap (the CACCS constraint)"
                ],
                "bounds": [
                    "All allocations >= 0",
                    "All deviation variables >= 0",
                    "Corrective action >= 0"
                ]
            },
            "minimize": "Weighted sum of goal deviations: sum w_i * (d_i+ + d_i-) / T_i"
        }
    },
    "multi_agent_resource_allocation": {
        "description": "Tragedy of the Commons: balance individual agent gains vs shared resource",
        "structure": {
            "given": [
                "Common resource stock",
                "Number of agents and their extraction rates",
                "Resource regeneration function",
                "Agent utility functions"
            ],
            "find": [
                "Extraction rate for each agent",
                "Deviation variables for agent utility goals",
                "Deviation variables for sustainability goal"
            ],
            "satisfy": {
                "goals": [
                    "Agent utility targets (one per agent)",
                    "Resource sustainability target (stock >= threshold)"
                ],
                "constraints": [
                    "Total extraction <= available stock",
                    "Regeneration dynamics",
                    "Fairness bounds (optional: no agent gets < X%)"
                ],
                "bounds": [
                    "Extraction rates >= 0",
                    "Deviation variables >= 0"
                ]
            },
            "minimize": "Weighted sum of deviations with sustainability premium"
        }
    },
    "growth_vs_constraint": {
        "description": "Limits to Growth: manage growth rate against approaching constraints",
        "structure": {
            "given": ["Growth rate", "Resource capacity", "Constraint thresholds"],
            "find": ["Growth investment level", "Deviation variables"],
            "satisfy": {
                "goals": ["Growth target", "Capacity preservation"],
                "constraints": ["Resource limits", "Investment bounds"],
                "bounds": ["Non-negativity"]
            },
            "minimize": "Weighted deviations from growth and sustainability goals"
        }
    },
    "symptom_vs_root_cause": {
        "description": "Shifting the Burden: invest in fundamental solution vs quick fix",
        "structure": {
            "given": ["Problem severity", "Fix effectiveness", "Fundamental solution timeline"],
            "find": ["Symptomatic fix intensity", "Fundamental fix investment", "Deviation variables"],
            "satisfy": {
                "goals": ["Symptom relief target", "Root cause resolution target"],
                "constraints": ["Budget/resource limits", "Side effect bounds"],
                "bounds": ["Non-negativity"]
            },
            "minimize": "Weighted deviations with premium on fundamental solution"
        }
    },
    "aspiration_preservation": {
        "description": "Eroding Goals: maintain performance standards under pressure",
        "structure": {
            "given": ["Current performance", "Goal levels", "Pressure intensity"],
            "find": ["Performance improvement investment", "Goal adjustment", "Deviation variables"],
            "satisfy": {
                "goals": ["Performance target", "Goal floor (no erosion below X)"],
                "constraints": ["Resource limits", "Improvement capacity"],
                "bounds": ["Non-negativity", "Goal floor"]
            },
            "minimize": "Weighted deviations with heavy penalty on goal erosion"
        }
    },
    "mutual_de_escalation": {
        "description": "Escalation: find de-escalation equilibrium",
        "structure": {
            "given": ["Current escalation levels", "Response functions", "Cost of escalation"],
            "find": ["Action levels for each party", "Deviation variables"],
            "satisfy": {
                "goals": ["Security targets for each party", "De-escalation target"],
                "constraints": ["Coupled response constraints", "Commitment bounds"],
                "bounds": ["Non-negativity"]
            },
            "minimize": "Weighted deviations with mutual de-escalation premium"
        }
    },
    "equity_vs_efficiency": {
        "description": "Success to the Successful: balance efficiency with equitable distribution",
        "structure": {
            "given": ["Current resource distribution", "Performance metrics", "Fairness thresholds"],
            "find": ["Resource allocations", "Rebalancing transfers", "Deviation variables"],
            "satisfy": {
                "goals": ["Efficiency target", "Equity target (Gini or min share)"],
                "constraints": ["Total resource constraint", "Transfer limits"],
                "bounds": ["Non-negativity"]
            },
            "minimize": "Weighted deviations balancing efficiency and equity"
        }
    },
    "joint_optimization": {
        "description": "Accidental Adversaries: joint optimization replacing local optimization",
        "structure": {
            "given": ["Individual objectives", "Side effect functions", "Mutual benefit baseline"],
            "find": ["Joint action profile", "Side effect mitigation investments", "Deviation variables"],
            "satisfy": {
                "goals": ["Individual targets", "Mutual benefit target", "Side effect limits"],
                "constraints": ["Action feasibility", "Budget constraints"],
                "bounds": ["Non-negativity"]
            },
            "minimize": "Weighted deviations from joint welfare maximum"
        }
    },
    "proactive_vs_reactive_investment": {
        "description": "Growth and Underinvestment: time investment proactively",
        "structure": {
            "given": ["Current capacity", "Growth trajectory", "Investment cost and lag"],
            "find": ["Investment timing and amount", "Deviation variables"],
            "satisfy": {
                "goals": ["Capacity adequacy target", "Growth target"],
                "constraints": ["Investment budget", "Lead time constraints"],
                "bounds": ["Non-negativity"]
            },
            "minimize": "Weighted deviations with proactive investment premium"
        }
    },
    "anchored_aspiration": {
        "description": "Drifting Goals: anchor aspirations to prevent downward drift",
        "structure": {
            "given": ["Current performance", "Reference goal", "Drift rate"],
            "find": ["Performance improvement effort", "Goal anchor strength", "Deviation variables"],
            "satisfy": {
                "goals": ["Performance target", "Goal stability target"],
                "constraints": ["Effort capacity", "Goal floor"],
                "bounds": ["Non-negativity"]
            },
            "minimize": "Weighted deviations with goal-drift penalty"
        }
    },
}
