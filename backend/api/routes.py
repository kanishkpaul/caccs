from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.extraction.narrative_parser import extract_causal_structure
from backend.extraction.graph_builder import build_causal_graph, graph_to_dict
from backend.extraction.loop_detector import detect_feedback_loops

from backend.archetypes.matcher import match_archetypes
from backend.archetypes.semantic_validator import validate_archetype_match
from backend.archetypes.compositor import detect_archetype_composition
from backend.archetypes.templates import ARCHETYPE_TEMPLATES

from backend.game_theory.game_formulator import formulate_stakeholder_game
from backend.game_theory.equilibria import compute_payoff_matrix, find_nash_equilibria, find_cooperative_solution
from backend.game_theory.mechanisms import suggest_mechanisms
from backend.game_theory.price_of_anarchy import compute_price_of_anarchy

from backend.cdsp.generator import generate_cdsp, generate_compound_cdsp
from backend.simulation.engine import run_simulation, SimulationConfig

import networkx as nx
import os
import json

router = APIRouter()

class ExtractRequest(BaseModel):
    narrative: str

class MatchRequest(BaseModel):
    graph: Dict[str, Any]
    loops: List[Dict[str, Any]]

class GameAnalysisRequest(BaseModel):
    stakeholders: List[Dict[str, Any]]
    shared_resources: List[str]
    graph: Dict[str, Any]
    archetype_match: Dict[str, Any]

class CdspRequest(BaseModel):
    archetype_match: Dict[str, Any]
    graph: Dict[str, Any]
    stakeholders: List[Dict[str, Any]]
    game_analysis: Dict[str, Any]

class SimulateRequest(BaseModel):
    cdsp: Dict[str, Any]
    config: Dict[str, Any]
    state_update_fn: str

def dict_to_graph(graph_dict):
    G = nx.DiGraph()
    for node in graph_dict.get("nodes", []):
        kwargs = {k:v for k,v in node.items() if k != "id"}
        G.add_node(node["id"], **kwargs)
    for edge in graph_dict.get("edges", []):
        kwargs = {k:v for k,v in edge.items() if k not in ["source", "target"]}
        G.add_edge(edge["source"], edge["target"], **kwargs)
    return G

@router.post("/extract")
def extract(req: ExtractRequest):
    extraction = extract_causal_structure(req.narrative)
    G = build_causal_graph(extraction)
    loops = detect_feedback_loops(G)
    return {
        "extraction": extraction,
        "graph": graph_to_dict(G),
        "loops": loops
    }

@router.post("/match-archetypes")
def match(req: MatchRequest):
    G = dict_to_graph(req.graph)
    matches = match_archetypes(G, req.loops)
    
    if matches:
        # validate the top match
        match_cfg = matches[0]
        arch_name = match_cfg.get("archetype")
        if arch_name in ARCHETYPE_TEMPLATES:
            validation = validate_archetype_match(
                cld_description=json.dumps(req.graph),
                archetype_name=arch_name,
                archetype_description=ARCHETYPE_TEMPLATES[arch_name].get("description", ""),
                loop_mapping=match_cfg
            )
            matches[0]["semantic_validation"] = validation
        
    compositions = detect_archetype_composition(matches, G)
    return {
        "matches": matches,
        "compositions": compositions
    }

@router.post("/game-analysis")
def game_analysis(req: GameAnalysisRequest):
    G = dict_to_graph(req.graph)
    game = formulate_stakeholder_game(req.stakeholders, req.shared_resources, G, req.archetype_match)
    payoffs = compute_payoff_matrix(game)
    nash = find_nash_equilibria(payoffs)
    coop = find_cooperative_solution(payoffs)
    poa = compute_price_of_anarchy(nash, coop)
    mechanisms = suggest_mechanisms(game, req.archetype_match.get("archetype", ""))
    
    return {
        "game": game,
        "payoff_matrix": payoffs.tolist() if hasattr(payoffs, "tolist") else payoffs,
        "nash_equilibria": nash,
        "cooperative_solution": coop,
        "price_of_anarchy": poa,
        "mechanisms": mechanisms
    }

@router.post("/generate-cdsp")
def generate_cdsp_endpoint(req: CdspRequest):
    G = dict_to_graph(req.graph)
    cdsp = generate_cdsp(req.archetype_match, G, req.stakeholders, req.game_analysis)
    return {"cdsp": cdsp}

@router.post("/simulate")
def simulate(req: SimulateRequest):
    try:
        config_copy = req.config.copy()
        policy_constraints = config_copy.pop("policy_constraints", {})
        conf = SimulationConfig(**config_copy)
        results = run_simulation(req.cdsp, conf, req.state_update_fn, policy_constraints)
        return {"results": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/archetypes")
def get_archetypes():
    return {"archetypes": ARCHETYPE_TEMPLATES}

@router.get("/examples")
def get_examples():
    examples_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "examples")
    
    narrative = ""
    config = {}
    state_update = ""
    
    try:
        with open(os.path.join(examples_dir, "microgrid_narrative.txt"), "r") as f:
            narrative = f.read()
    except Exception:
        pass
        
    try:
        with open(os.path.join(examples_dir, "microgrid_config.json"), "r") as f:
            config = json.load(f)
    except Exception:
        pass
        
    try:
        with open(os.path.join(examples_dir, "microgrid_state_update.py"), "r") as f:
            state_update = f.read()
    except Exception:
        pass
        
    return {
        "microgrid": {
            "narrative": narrative,
            "config": config,
            "state_update_fn": state_update
        }
    }
