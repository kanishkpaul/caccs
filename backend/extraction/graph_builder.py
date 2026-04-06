import networkx as nx


def build_causal_graph(extraction: dict) -> nx.DiGraph:
    """Build a signed directed graph from Gemini extraction."""
    G = nx.DiGraph()

    for var in extraction["variables"]:
        G.add_node(var["id"], label=var["label"], category=var["category"],
                   description=var.get("description", ""))

    for rel in extraction["relationships"]:
        G.add_edge(rel["source"], rel["target"],
                   polarity=rel["polarity"],
                   delay=rel["delay"],
                   confidence=rel["confidence"],
                   rationale=rel.get("rationale", ""))

    return G


def graph_to_dict(G: nx.DiGraph) -> dict:
    """Serialize a networkx graph to a JSON-friendly dict."""
    nodes = []
    for node_id, data in G.nodes(data=True):
        nodes.append({"id": node_id, **data})

    edges = []
    for src, tgt, data in G.edges(data=True):
        edges.append({"source": src, "target": tgt, **data})

    return {"nodes": nodes, "edges": edges}
