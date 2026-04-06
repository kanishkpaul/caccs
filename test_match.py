import json
from backend.extraction.narrative_parser import extract_causal_structure
from backend.extraction.graph_builder import build_causal_graph, graph_to_dict
from backend.extraction.loop_detector import detect_feedback_loops

from backend.api.routes import MatchRequest, match

def test():
    with open("examples/microgrid_narrative.txt", "r") as f:
        narrative = f.read()

    extraction = extract_causal_structure(narrative)
    G = build_causal_graph(extraction)
    loops = detect_feedback_loops(G)
    
    graph_dict = graph_to_dict(G)
    
    req = MatchRequest(graph=graph_dict, loops=loops)
    
    try:
        res = match(req)
        print("Success!", json.dumps(res, indent=2))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
