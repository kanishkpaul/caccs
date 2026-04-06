import json
from google import genai
from backend.config import GEMINI_API_KEY, GEMINI_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

SEMANTIC_VALIDATION_PROMPT = """
Given this causal loop diagram:
{cld_description}

And this candidate archetype match: {archetype_name}
Archetype definition: {archetype_description}

Structural match mapped these loops:
{loop_mapping}

Question: Does the SEMANTIC MEANING of the identified loops genuinely correspond
to the archetype? The structural shape might match but the variables might not
make sense for this archetype.

Return JSON:
{{
  "valid": true or false,
  "confidence_adjustment": a float between -0.3 and +0.3,
  "rationale": "explanation"
}}
"""

VALIDATION_SCHEMA = {
    "type": "object",
    "properties": {
        "valid": {"type": "boolean"},
        "confidence_adjustment": {"type": "number"},
        "rationale": {"type": "string"}
    },
    "required": ["valid", "confidence_adjustment", "rationale"]
}


def validate_archetype_match(
    cld_description: str,
    archetype_name: str,
    archetype_description: str,
    loop_mapping: dict
) -> dict:
    """Use Gemini to semantically validate a structural archetype match."""
    prompt = SEMANTIC_VALIDATION_PROMPT.format(
        cld_description=cld_description,
        archetype_name=archetype_name,
        archetype_description=archetype_description,
        loop_mapping=json.dumps(loop_mapping, indent=2, default=str),
    )
    config = genai.types.GenerateContentConfig(
        system_instruction="You are a systems dynamics expert specializing in Senge's system archetypes.",
        temperature=0.2,
        response_mime_type="application/json",
        response_schema=VALIDATION_SCHEMA,
    )
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=config,
    )
    return json.loads(response.text)
