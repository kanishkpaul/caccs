import json
from google import genai
from backend.config import GEMINI_API_KEY, GEMINI_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

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

Return ONLY valid JSON matching the schema below.
"""

EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "variables": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "label": {"type": "string"},
                    "description": {"type": "string"},
                    "category": {
                        "type": "string",
                        "enum": ["state", "flow", "decision", "external", "outcome"]
                    }
                },
                "required": ["id", "label", "category"]
            }
        },
        "relationships": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "source": {"type": "string"},
                    "target": {"type": "string"},
                    "polarity": {"type": "string", "enum": ["+", "-"]},
                    "delay": {"type": "string", "enum": ["none", "short", "long"]},
                    "confidence": {"type": "number"},
                    "rationale": {"type": "string"}
                },
                "required": ["source", "target", "polarity", "delay", "confidence"]
            }
        },
        "loops": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "type": {"type": "string", "enum": ["reinforcing", "balancing"]},
                    "variables": {"type": "array", "items": {"type": "string"}},
                    "description": {"type": "string"}
                },
                "required": ["name", "type", "variables"]
            }
        },
        "stakeholders": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "label": {"type": "string"},
                    "objectives": {"type": "array", "items": {"type": "string"}},
                    "controlled_variables": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["id", "label", "objectives"]
            }
        }
    },
    "required": ["variables", "relationships", "loops", "stakeholders"]
}


def extract_causal_structure(narrative: str) -> dict:
    """Extract causal variables, relationships, loops, and stakeholders from narrative text."""
    config = genai.types.GenerateContentConfig(
        system_instruction=EXTRACTION_SYSTEM_PROMPT,
        temperature=0.2,
        response_mime_type="application/json",
        response_schema=EXTRACTION_SCHEMA,
    )
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=narrative,
        config=config,
    )
    return json.loads(response.text)
