import json
from openai import OpenAI

def extract_causal_structure(narrative: str, api_key: str) -> dict:
    """Extract causal variables, relationships, loops, and stakeholders from narrative text."""
    from backend.config import DEFAULT_OPENROUTER_MODEL
    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)

    extraction_system_prompt = """
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

    response = client.chat.completions.create(
        model=DEFAULT_OPENROUTER_MODEL,
        messages=[
            {"role": "system", "content": extraction_system_prompt},
            {"role": "user", "content": narrative}
        ],
        temperature=0.2
    )
    content = response.choices[0].message.content or "{}"
    print(f"--- DEBUG: LLM RAW CONTENT ---\n{content[:1000]}...\n-----------------------------")
    
    # Advanced JSON extraction
    def find_json_block(text):
        # Try finding markdown code block first
        import re
        code_block = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
        if code_block:
            return code_block.group(1).strip()
            
        # Otherwise find first { or [ and match to matching last } or ]
        start_idx = -1
        for i, char in enumerate(text):
            if char in '{[':
                start_idx = i
                break
        
        if start_idx == -1: return text
        
        # Simple balanced bracket finder
        stack = []
        opener = text[start_idx]
        closer = '}' if opener == '{' else ']'
        
        for i in range(start_idx, len(text)):
            if text[i] == opener:
                stack.append(opener)
            elif text[i] == closer:
                if stack: stack.pop()
                if not stack:
                    return text[start_idx:i+1]
        
        return text[start_idx:]

    cleaned_content = find_json_block(content)
    
    try:
        return json.loads(cleaned_content)
    except json.JSONDecodeError as e:
        print(f"--- DEBUG: JSON DECODE ERROR: {e} ---")
        # Final desperate attempt: remove any non-json characters before { and after }
        import re
        try:
            fallback_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', cleaned_content)
            if fallback_match:
                return json.loads(fallback_match.group(1))
        except:
            pass
        return {"variables": [], "relationships": [], "loops": [], "stakeholders": []}

