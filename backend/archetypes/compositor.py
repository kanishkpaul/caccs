import json
import networkx as nx
from openai import OpenAI
from backend.config import OPENROUTER_API_KEY, OPENROUTER_MODEL

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)


def detect_archetype_composition(
    matches: list[dict],
    causal_graph: nx.DiGraph
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
                interaction = _classify_interaction(m1, m2, shared, causal_graph)
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


def _classify_interaction(m1: dict, m2: dict, shared: set, G: nx.DiGraph) -> dict:
    """Classify how two archetypes interact through shared variables."""
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
            model=OPENROUTER_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        text = response.choices[0].message.content or "{}"
        text = text.strip()
        if text.startswith("```json"): text = text[7:]
        elif text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        return json.loads(text.strip())
    except Exception:
        return {"interaction": "unknown", "explanation": "Classification failed", "policy_implication": "Manual review needed"}
