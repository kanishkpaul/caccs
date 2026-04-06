import networkx as nx
from backend.cdsp.templates import CDSP_TEMPLATES


def generate_cdsp(
    archetype_match: dict,
    causal_graph: nx.DiGraph,
    stakeholders: list[dict],
    game_analysis: dict
) -> dict:
    """Auto-generate a cDSP formulation from archetype match and causal graph."""
    template_name = archetype_match.get("cdsp_template", "short_vs_long_tradeoff")
    template = CDSP_TEMPLATES.get(template_name, CDSP_TEMPLATES["short_vs_long_tradeoff"])

    state_vars = [n for n, d in causal_graph.nodes(data=True) if d.get("category") == "state"]
    external_vars = [n for n, d in causal_graph.nodes(data=True) if d.get("category") == "external"]
    decision_vars = [n for n, d in causal_graph.nodes(data=True) if d.get("category") == "decision"]
    outcome_vars = [n for n, d in causal_graph.nodes(data=True) if d.get("category") == "outcome"]
    flow_vars = [n for n, d in causal_graph.nodes(data=True) if d.get("category") == "flow"]

    cdsp = {
        "template": template_name,
        "template_description": template["description"],
        "given": {
            "state_variables": state_vars,
            "external_inputs": external_vars,
            "stakeholders": [s["id"] for s in stakeholders],
            "weights": {s["id"]: f"w_{s['id']}" for s in stakeholders}
        },
        "find": {
            "decision_variables": decision_vars,
            "deviation_variables": {
                **{f"d_plus_{o}": f"overachievement of {o}" for o in outcome_vars},
                **{f"d_minus_{o}": f"underachievement of {o}" for o in outcome_vars}
            }
        },
        "satisfy": {"goals": [], "constraints": [], "bounds": []},
        "minimize": "",
        "mechanism_adjustments": []
    }

    # Generate goals from stakeholder objectives
    for s in stakeholders:
        for obj in s.get("objectives", []):
            cdsp["satisfy"]["goals"].append({
                "stakeholder": s["id"],
                "target_variable": obj,
                "equation": f"{obj} + d_minus_{obj} - d_plus_{obj} = T_{obj}",
                "description": f"Service level target for {s.get('label', s['id'])}"
            })

    # Resource balance constraint
    if flow_vars or decision_vars:
        cdsp["satisfy"]["constraints"].append({
            "type": "resource_balance",
            "equation": f"sum({', '.join(decision_vars)}) <= sum({', '.join(external_vars)}) + resource_discharge",
            "description": "Total allocation cannot exceed available supply"
        })

    # Non-negativity bounds
    for dv in decision_vars:
        cdsp["satisfy"]["bounds"].append({
            "variable": dv,
            "lower": 0,
            "upper": None,
            "description": f"{dv} >= 0"
        })

    # Add mechanism-based constraints
    for mechanism in game_analysis.get("mechanisms", []):
        cdsp["mechanism_adjustments"].append({
            "source": mechanism["name"],
            "constraint": mechanism.get("implementation", ""),
            "description": mechanism["description"]
        })

    # Objective function
    objective_terms = []
    for s in stakeholders:
        for obj in s.get("objectives", []):
            objective_terms.append(f"w_{s['id']} * d_minus_{obj} / T_{obj}")
    cdsp["minimize"] = " + ".join(objective_terms) if objective_terms else "sum of weighted deviations"

    return cdsp


def generate_compound_cdsp(
    archetype_matches: list[dict],
    compositions: list[dict],
    causal_graph: nx.DiGraph,
    stakeholders: list[dict]
) -> dict:
    """Generate a compound cDSP that integrates multiple archetype tensions."""
    compound_cdsp = {
        "archetypes": [m.get("archetype", "unknown") for m in archetype_matches],
        "given": {},
        "find": {},
        "satisfy": {"goals": [], "constraints": [], "bounds": []},
        "minimize": "",
        "interaction_constraints": []
    }

    seen_goals = set()
    for match in archetype_matches:
        individual = generate_cdsp(match, causal_graph, stakeholders, {})
        for goal in individual["satisfy"]["goals"]:
            key = goal["target_variable"]
            if key not in seen_goals:
                compound_cdsp["satisfy"]["goals"].append(goal)
                seen_goals.add(key)
        compound_cdsp["satisfy"]["constraints"].extend(individual["satisfy"]["constraints"])

    for comp in compositions:
        if comp.get("interaction_type") == "competing":
            compound_cdsp["interaction_constraints"].append({
                "type": "competing_intervention",
                "shared_variables": comp["shared_variables"],
                "constraint": "Pareto constraint - cannot improve one archetype's objective without worsening the other.",
                "meta_weight": "w_meta"
            })

    return compound_cdsp
