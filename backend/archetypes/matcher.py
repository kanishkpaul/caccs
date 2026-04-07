import networkx as nx
from backend.archetypes.templates import ARCHETYPE_TEMPLATES


def match_archetypes(G: nx.DiGraph, loops: list[dict]) -> list[dict]:
    """Match detected loops against archetype templates. Returns ranked list."""
    matches = []

    # Auto-detect has_delay from graph edges if missing
    for l in loops:
        if "has_delay" not in l:
            has_delay = False
            vars = l.get("variables", [])
            for i in range(len(vars)):
                u = vars[i]
                v = vars[(i + 1) % len(vars)]
                if G.has_edge(u, v):
                    if G[u][v].get("delay") in ["short", "long"]:
                        has_delay = True
                        break
            l["has_delay"] = has_delay

    for arch_name, arch in ARCHETYPE_TEMPLATES.items():
        required = arch["structure"]["required_loops"]
        score = 0.0
        mapping = {}
        matched = True

        for req_loop in required:
            # SOFT MATCHING: Prioritize loop type, reward has_delay matches
            candidates = [
                l for l in loops
                if l.get("type", "").lower() == req_loop["type"].lower()
            ]
            
            if not candidates:
                matched = False
                break
            
            # Sub-score each candidate: Type is base 1.0, matching delay adds 0.5
            def score_candidate(l):
                s = 1.0
                if l.get("has_delay", False) == req_loop.get("has_delay", False):
                    s += 0.5
                return s

            best = max(candidates, key=score_candidate)
            mapping[req_loop["role"]] = best
            
            # Assign partial credit if delay doesn't match
            if best.get("has_delay", False) == req_loop.get("has_delay", False):
                score += 1.0 / len(required)
            else:
                # Still a match, but lower confidence
                score += 0.7 / len(required)

        if not matched or score < 0.4:
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
