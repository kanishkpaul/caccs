import networkx as nx
from backend.archetypes.templates import ARCHETYPE_TEMPLATES


def match_archetypes(G: nx.DiGraph, loops: list[dict]) -> list[dict]:
    """Match detected loops against archetype templates. Returns ranked list."""
    matches = []

    for arch_name, arch in ARCHETYPE_TEMPLATES.items():
        required = arch["structure"]["required_loops"]
        score = 0.0
        mapping = {}
        matched = True

        for req_loop in required:
            candidates = [
                l for l in loops
                if l["type"] == req_loop["type"]
                and l["has_delay"] == req_loop["has_delay"]
            ]
            if not candidates:
                matched = False
                break
            best = max(candidates, key=lambda l: sum(
                G[l["variables"][i]][l["variables"][(i + 1) % len(l["variables"])]].get("confidence", 0.5)
                for i in range(len(l["variables"]))
                if G.has_edge(l["variables"][i], l["variables"][(i + 1) % len(l["variables"])])
            ) / max(len(l["variables"]), 1))
            mapping[req_loop["role"]] = best
            score += 1.0 / len(required)

        if not matched or score < 0.5:
            continue

        # Check shared variable constraint
        if len(mapping) >= 2:
            loop_var_sets = [set(m["variables"]) for m in mapping.values() if isinstance(m, dict)]
            if loop_var_sets:
                shared = set.intersection(*loop_var_sets)
                if shared:
                    score += 0.2
                    mapping["shared_variables"] = list(shared)

        mapping["archetype"] = arch_name
        mapping["confidence"] = min(score, 1.0)
        mapping["description"] = arch["description"]
        mapping["game_theory_mapping"] = arch["game_theory_mapping"]
        mapping["cdsp_template"] = arch["cdsp_template"]
        matches.append(mapping)

    return sorted(matches, key=lambda m: m["confidence"], reverse=True)
