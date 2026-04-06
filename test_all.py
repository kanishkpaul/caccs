from openai import OpenAI
import os

client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key="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")

try:
    print("Testing chat completion...")
    response = client.chat.completions.create(
        model="minimax/minimax-m2.5:free",
        messages=[{"role": "user", "content": "hi"}],
    )
    print("Chat works!", response.choices[0].message.content)
except Exception as e:
    import traceback
    traceback.print_exc()

try:
    print("Testing JSON structured...")
    response = client.chat.completions.create(
        model="minimax/minimax-m2.5:free",
        messages=[{"role": "user", "content": "return random json"}],
        response_format={"type": "json_object"}
    )
    print("JSON works!", response.choices[0].message.content)
except Exception as e:
    import traceback
    traceback.print_exc()
