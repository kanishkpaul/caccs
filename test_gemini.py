from google import genai
import inspect

print(inspect.signature(genai.types.Part.from_text))

try:
    p = genai.types.Part.from_text("hello")
    print("from_text works!", p)
except Exception as e:
    print("from_text exception:", e)

try:
    p = genai.types.Part.from_text(text="hello")
    print("from_text kwargs works!", p)
except Exception as e:
    print("from_text kwargs exception:", e)

try:
    p = genai.types.Part(text="hello")
    print("Part(text=) works!", p)
except Exception as e:
    print("Part(text=) exception:", e)
