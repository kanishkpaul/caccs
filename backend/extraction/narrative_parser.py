import json
from openai import OpenAI
from backend.config import OPENROUTER_API_KEY, OPENROUTER_MODEL

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

EXTRACTION_SYSTEM_PROMPT = """
You are a systems dynamics expert. Given a natural language description of a system,
extract ALL causal variables and causal relationships.

Rules:
1. Variables should be noun phrases representing measurable or observable quantities.
   Examples: "battery state of health", "service shortfall", "operator pressure"
2. Each relationship has:
   - source variable
   - target variable
   - polarity: "+" (same direction) or "-" (opposite direction)
   - delay: "none", "short", "long" (is the effect immediate or delayed?)
   - confidence: 0.0-1.0 (how explicitly stated is this relationship?)
3. Identify ALL feedback loops. A loop is a cycle in the directed graph.
   For each loop, state whether it is REINFORCING (even number of - edges or all +)
   or BALANCING (odd number of - edges).
4. Be exhaustive. Extract implicit relationships too.
5. Normalize variable names to snake_case.

Return ONLY valid JSON matching this schema structure:
{
  "variables": [{"id": "", "label": "", "description": "", "category": "state|flow|decision|external|outcome"}],
  "relationships": [{"source": "", "target": "", "polarity": "+|-", "delay": "none|short|long", "confidence": 1.0, "rationale": ""}],
  "loops": [{"name": "", "type": "reinforcing|balancing", "variables": [""], "description": ""}],
  "stakeholders": [{"id": "", "label": "", "objectives": [""], "controlled_variables": [""]}]
}
"""

def extract_causal_structure(narrative: str) -> dict:
    """Extract causal variables, relationships, loops, and stakeholders from narrative text."""
    response = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": narrative}
        ],
        temperature=0.2
    )
    text = response.choices[0].message.content or "{}"
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return json.loads(text.strip())
