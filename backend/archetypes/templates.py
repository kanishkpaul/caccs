ARCHETYPE_TEMPLATES = {
    "fixes_that_fail": {
        "description": "Quick fix temporarily solves symptom but creates delayed consequences that worsen the original problem.",
        "structure": {
            "required_loops": [
                {"type": "balancing", "has_delay": False, "role": "relief"},
                {"type": "reinforcing", "has_delay": True, "role": "erosion"}
            ],
            "shared_variable_role": "corrective_action",
            "key_pattern": "The relief loop and erosion loop share a common intervention variable. The erosion loop has delay."
        },
        "game_theory_mapping": "myopic_nash",
        "cdsp_template": "short_vs_long_tradeoff"
    },
    "limits_to_growth": {
        "description": "Growth process encounters a limit that slows and eventually reverses growth.",
        "structure": {
            "required_loops": [
                {"type": "reinforcing", "has_delay": False, "role": "growth_engine"},
                {"type": "balancing", "has_delay": True, "role": "limiting_constraint"}
            ],
            "shared_variable_role": "growing_action",
            "key_pattern": "Reinforcing loop drives growth; balancing loop activates as a resource constraint is approached."
        },
        "game_theory_mapping": "optimal_stopping",
        "cdsp_template": "growth_vs_constraint"
    },
    "tragedy_of_the_commons": {
        "description": "Multiple agents deplete a shared resource by acting in individual self-interest.",
        "structure": {
            "required_loops": [
                {"type": "reinforcing", "has_delay": False, "role": "individual_gain", "count": "multiple"},
                {"type": "balancing", "has_delay": True, "role": "resource_depletion"}
            ],
            "shared_variable_role": "common_resource",
            "key_pattern": "Multiple reinforcing loops (one per agent) all draw from a shared resource node; balancing loop represents resource depletion feedback."
        },
        "game_theory_mapping": "social_dilemma",
        "cdsp_template": "multi_agent_resource_allocation"
    },
    "shifting_the_burden": {
        "description": "An easy symptomatic solution undermines a more fundamental long-term solution.",
        "structure": {
            "required_loops": [
                {"type": "balancing", "has_delay": False, "role": "symptomatic_fix"},
                {"type": "balancing", "has_delay": True, "role": "fundamental_fix"},
                {"type": "reinforcing", "has_delay": True, "role": "addiction"}
            ],
            "shared_variable_role": "problem_symptom",
            "key_pattern": "Two balancing loops address the same symptom; the fast one creates side effects that weaken the slow fundamental one."
        },
        "game_theory_mapping": "commitment_problem",
        "cdsp_template": "symptom_vs_root_cause"
    },
    "eroding_goals": {
        "description": "Under pressure, goals are lowered to close the gap between desired and actual performance.",
        "structure": {
            "required_loops": [
                {"type": "balancing", "has_delay": False, "role": "goal_adjustment"},
                {"type": "balancing", "has_delay": True, "role": "corrective_action"}
            ],
            "shared_variable_role": "performance_gap",
            "key_pattern": "Two loops close the gap: one lowers the goal, one improves performance. The goal-lowering loop is faster."
        },
        "game_theory_mapping": "ratchet_effect",
        "cdsp_template": "aspiration_preservation"
    },
    "escalation": {
        "description": "Two parties compete, each responding to the other's actions, driving mutual escalation.",
        "structure": {
            "required_loops": [
                {"type": "reinforcing", "has_delay": False, "role": "escalation_A"},
                {"type": "reinforcing", "has_delay": False, "role": "escalation_B"}
            ],
            "shared_variable_role": "relative_position",
            "key_pattern": "Two reinforcing loops interlock: A's action triggers B's response which triggers A's response."
        },
        "game_theory_mapping": "arms_race",
        "cdsp_template": "mutual_de_escalation"
    },
    "success_to_the_successful": {
        "description": "Resources flow to the winner, starving the loser, creating a self-reinforcing advantage.",
        "structure": {
            "required_loops": [
                {"type": "reinforcing", "has_delay": False, "role": "winner_loop"},
                {"type": "reinforcing", "has_delay": False, "role": "loser_loop"}
            ],
            "shared_variable_role": "resource_allocation",
            "key_pattern": "Two reinforcing loops share a resource pool; success in one diverts resources from the other."
        },
        "game_theory_mapping": "competitive_exclusion",
        "cdsp_template": "equity_vs_efficiency"
    },
    "accidental_adversaries": {
        "description": "Two allies inadvertently undermine each other through well-intentioned actions.",
        "structure": {
            "required_loops": [
                {"type": "reinforcing", "has_delay": False, "role": "partnership"},
                {"type": "balancing", "has_delay": True, "role": "side_effect_A"},
                {"type": "balancing", "has_delay": True, "role": "side_effect_B"}
            ],
            "shared_variable_role": "mutual_benefit",
            "key_pattern": "Central reinforcing loop of mutual benefit; each party's local optimization creates delayed side effects that hurt the other."
        },
        "game_theory_mapping": "coordination_failure",
        "cdsp_template": "joint_optimization"
    },
    "growth_and_underinvestment": {
        "description": "Growth approaches a limit that can be raised by investment, but investment is delayed until performance degrades.",
        "structure": {
            "required_loops": [
                {"type": "reinforcing", "has_delay": False, "role": "growth_engine"},
                {"type": "balancing", "has_delay": True, "role": "capacity_limit"},
                {"type": "balancing", "has_delay": True, "role": "investment_response"}
            ],
            "shared_variable_role": "capacity",
            "key_pattern": "Growth drives demand toward capacity; investment to raise capacity is delayed until performance visibly degrades."
        },
        "game_theory_mapping": "investment_timing",
        "cdsp_template": "proactive_vs_reactive_investment"
    },
    "drifting_goals": {
        "description": "Similar to eroding goals but with an external reference — the gap between actual and desired drifts as both adjust.",
        "structure": {
            "required_loops": [
                {"type": "balancing", "has_delay": False, "role": "goal_erosion"},
                {"type": "balancing", "has_delay": True, "role": "performance_improvement"}
            ],
            "shared_variable_role": "performance_gap",
            "key_pattern": "Performance gap triggers both goal reduction (fast) and genuine improvement (slow). Goals drift downward over time."
        },
        "game_theory_mapping": "reference_point_shift",
        "cdsp_template": "anchored_aspiration"
    }
}
