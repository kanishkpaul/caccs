import json
from openai import OpenAI

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
    loop_mapping: dict,
    api_key: str
) -> dict:
    """Use AI to semantically validate a structural archetype match."""
    from backend.config import DEFAULT_OPENROUTER_MODEL
    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
    
    prompt = SEMANTIC_VALIDATION_PROMPT.format(
        cld_description=cld_description,
        archetype_name=archetype_name,
        archetype_description=archetype_description,
        loop_mapping=json.dumps(loop_mapping, indent=2, default=str),
    )
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
        print(f"--- DEBUG: SEMANTIC VALIDATION FAILED: {e} ---")
        return {"valid": True, "confidence_adjustment": 0, "rationale": "Semantic validation bypassed due to error."}
