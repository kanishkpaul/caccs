import urllib.request
import json
data = json.loads(urllib.request.urlopen("https://openrouter.ai/api/v1/models").read())
minimax_models = [m["id"] for m in data["data"] if "minimax" in m["id"].lower()]
with open("models.txt", "w") as f:
    f.write("\n".join(minimax_models))
