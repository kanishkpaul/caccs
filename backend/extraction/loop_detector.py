import networkx as nx


def detect_feedback_loops(G: nx.DiGraph) -> list[dict]:
    """Detect all simple cycles and classify as reinforcing/balancing."""
    cycles = list(nx.simple_cycles(G))
    loops = []
    for cycle in cycles:
        if len(cycle) < 2:
            continue
        neg_count = 0
        for i in range(len(cycle)):
            src, tgt = cycle[i], cycle[(i + 1) % len(cycle)]
            edge_data = G.get_edge_data(src, tgt)
            if edge_data and edge_data.get("polarity") == "-":
                neg_count += 1
        loop_type = "balancing" if neg_count % 2 == 1 else "reinforcing"
        loops.append({
            "variables": cycle,
            "type": loop_type,
            "negative_edges": neg_count,
            "has_delay": any(
                G.get_edge_data(cycle[i], cycle[(i + 1) % len(cycle)], {}).get("delay", "none") != "none"
                for i in range(len(cycle))
            )
        })
    return loops
