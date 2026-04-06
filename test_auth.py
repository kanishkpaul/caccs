import urllib.request
import urllib.error
req = urllib.request.Request("https://openrouter.ai/api/v1/auth/key")
req.add_header("Authorization", "Bearer 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")
try:
    res = urllib.request.urlopen(req)
    print("Code:", res.getcode())
    print("Body:", res.read())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read())
except Exception as e:
    print("Error:", e)
