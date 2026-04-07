import networkx as nx


def build_causal_graph(extraction: dict) -> nx.DiGraph:
    """Build a signed directed graph from Gemini extraction."""
    G = nx.DiGraph()

    for var in extraction.get("variables", []):
        G.add_node(var.get("id"), label=var.get("label", var.get("id")), 
                   category=var.get("category", "variable"),
                   description=var.get("description", ""))

    for rel in extraction.get("relationships", []):
        G.add_edge(rel.get("source"), rel.get("target"),
                   polarity=rel.get("polarity", "+"),
                   delay=rel.get("delay", "none"),
                   confidence=rel.get("confidence", 1.0),
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
