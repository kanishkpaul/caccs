import json
import networkx as nx
from openai import OpenAI

def detect_archetype_composition(
    matches: list[dict],
    causal_graph: nx.DiGraph,
    api_key: str
) -> list[dict]:
    """Detect when multiple archetypes share variables or loops, creating compound dynamics."""
    if len(matches) < 2:
        return []

    compositions = []
    for i, m1 in enumerate(matches):
        for j, m2 in enumerate(matches):
            if i >= j:
                continue

            vars_1 = set()
            for key, loop in m1.items():
                if isinstance(loop, dict) and "variables" in loop:
                    vars_1.update(loop["variables"])

            vars_2 = set()
            for key, loop in m2.items():
                if isinstance(loop, dict) and "variables" in loop:
                    vars_2.update(loop["variables"])

            shared = vars_1 & vars_2
            if shared:
                interaction = _classify_interaction(m1, m2, shared, causal_graph, api_key)
                compositions.append({
                    "archetype_1": m1.get("archetype", "unknown"),
                    "archetype_2": m2.get("archetype", "unknown"),
                    "shared_variables": list(shared),
                    "interaction_type": interaction.get("interaction", "unknown"),
                    "explanation": interaction.get("explanation", ""),
                    "policy_implication": interaction.get("policy_implication", ""),
                    "compound_risk": "high" if interaction.get("interaction") == "amplifying" else "medium"
                })

    return compositions


def _classify_interaction(m1: dict, m2: dict, shared: set, G: nx.DiGraph, api_key: str) -> dict:
    """Classify how two archetypes interact through shared variables."""
    from backend.config import DEFAULT_OPENROUTER_MODEL
    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
    
    prompt = f"""
    You are a systems dynamics expert.
    Two system archetypes share variables {list(shared)} in a causal system.
    Archetype 1: {m1.get('archetype', 'unknown')}
    Archetype 2: {m2.get('archetype', 'unknown')}

    Classify their interaction as one of:
    - "amplifying": one archetype's negative effects worsen the other
    - "dampening": one archetype's structure constrains the other
    - "competing": both require contradictory interventions on shared variables
    - "independent": they share variables but don't meaningfully interact

    Return JSON: {{"interaction": "...", "explanation": "...", "policy_implication": "..."}}
    """
    try:
        response = client.chat.completions.create(
            model=DEFAULT_OPENROUTER_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        text = response.choices[0].message.content or "{}"
        text = text.strip()
        
        # Simple JSON extraction
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"--- DEBUG: COMPOSITOR INTERACTION CLASSIFICATION FAILED: {e} ---")
        return {"interaction": "unknown", "explanation": "Classification failed", "policy_implication": "Manual review needed"}
