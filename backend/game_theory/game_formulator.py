import networkx as nx
import numpy as np


GAME_MAPPINGS = {
    "myopic_nash": {
        "description": "Fixes That Fail: stakeholders play a repeated game where the myopic Nash equilibrium is Pareto-dominated by the patient strategy.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "compute_price_of_anarchy": True,
            "relevant_concepts": ["discount_factor", "folk_theorem_threshold", "trigger_strategy"]
        }
    },
    "social_dilemma": {
        "description": "Tragedy of the Commons: N-player prisoner's dilemma over a common-pool resource.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "compute_price_of_anarchy": True,
            "mechanism_design": True,
            "relevant_concepts": ["vickrey_clarke_groves", "hardin_solution_space", "ostrom_principles"]
        }
    },
    "arms_race": {
        "description": "Escalation: two-player symmetric game where each player's best response is to escalate.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "compute_price_of_anarchy": True,
            "relevant_concepts": ["security_dilemma", "commitment_device", "de_escalation_equilibrium"]
        }
    },
    "competitive_exclusion": {
        "description": "Success to the Successful: winner-take-all dynamics where initial advantage compounds.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "relevant_concepts": ["matthew_effect", "rebalancing_mechanism", "fairness_constraint"]
        }
    },
    "optimal_stopping": {
        "description": "Limits to Growth: timing game — when to stop exploiting the growth engine.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "relevant_concepts": ["optimal_stopping_time", "resource_threshold"]
        }
    },
    "commitment_problem": {
        "description": "Shifting the Burden: players cannot credibly commit to the fundamental solution.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "relevant_concepts": ["credible_commitment", "time_inconsistency"]
        }
    },
    "ratchet_effect": {
        "description": "Eroding Goals: downward ratchet on aspirations under pressure.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "relevant_concepts": ["aspiration_anchoring", "reference_dependence"]
        }
    },
    "coordination_failure": {
        "description": "Accidental Adversaries: allies fail to coordinate, creating mutual harm.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "relevant_concepts": ["focal_point", "communication_mechanism"]
        }
    },
    "investment_timing": {
        "description": "Growth and Underinvestment: investment timing game with delayed payoffs.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "relevant_concepts": ["real_options", "proactive_investment"]
        }
    },
    "reference_point_shift": {
        "description": "Drifting Goals: reference points shift to accommodate poor performance.",
        "analysis": {
            "compute_nash": True,
            "compute_cooperative": True,
            "relevant_concepts": ["anchoring", "aspiration_dynamics"]
        }
    },
}


def formulate_stakeholder_game(
    stakeholders: list[dict],
    shared_resources: list[str],
    causal_graph: nx.DiGraph,
    archetype_match: dict
) -> dict:
    """Construct a game-theoretic model from the extracted system structure."""
    n_players = len(stakeholders)
    game = {
        "players": [s["id"] for s in stakeholders],
        "type": archetype_match.get("game_theory_mapping", "generic"),
        "description": GAME_MAPPINGS.get(
            archetype_match.get("game_theory_mapping", ""), {}
        ).get("description", ""),
        "shared_resources": shared_resources,
        "player_details": {},
    }

    for s in stakeholders:
        objectives = s.get("objectives", [])
        controls = s.get("controlled_variables", [])

        paths = []
        for ctrl in controls:
            for obj in objectives:
                if ctrl in causal_graph and obj in causal_graph:
                    try:
                        for path in nx.all_simple_paths(causal_graph, ctrl, obj, cutoff=5):
                            polarity = 1
                            for i in range(len(path) - 1):
                                edge = causal_graph[path[i]][path[i + 1]]
                                polarity *= 1 if edge["polarity"] == "+" else -1
                            paths.append({
                                "path": path,
                                "polarity": polarity,
                                "has_delay": any(
                                    causal_graph[path[i]][path[i + 1]]["delay"] != "none"
                                    for i in range(len(path) - 1)
                                )
                            })
                    except nx.NetworkXNoPath:
                        pass

        game["player_details"][s["id"]] = {
            "objectives": objectives,
            "controls": controls,
            "causal_paths": paths
        }

    return game
