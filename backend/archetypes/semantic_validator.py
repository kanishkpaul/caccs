import json
from openai import OpenAI
from backend.config import OPENROUTER_API_KEY, OPENROUTER_MODEL

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

SEMANTIC_VALIDATION_PROMPT = """
You are a systems dynamics expert specializing in Senge's system archetypes.
Given this causal loop diagram:
{cld_description}

And this candidate archetype match: {archetype_name}
Archetype definition: {archetype_description}

Structural match mapped these loops:
{loop_mapping}

Question: Does the SEMANTIC MEANING of the identified loops genuinely correspond
to the archetype? The structural shape might match but the variables might not
make sense for this archetype.

Return ONLY valid JSON matching this schema exactly:
{{
  "valid": true,
  "confidence_adjustment": 0.0,
  "rationale": "explanation"
}}
"""

def validate_archetype_match(
    cld_description: str,
    archetype_name: str,
    archetype_description: str,
    loop_mapping: dict
) -> dict:
    """Use Groq to semantically validate a structural archetype match."""
    prompt = SEMANTIC_VALIDATION_PROMPT.format(
        cld_description=cld_description,
        archetype_name=archetype_name,
        archetype_description=archetype_description,
        loop_mapping=json.dumps(loop_mapping, indent=2, default=str),
    )
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
