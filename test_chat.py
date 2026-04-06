from backend.api.routes import chat_endpoint, ChatRequest
import traceback

def test():
    req = ChatRequest(
        prompt="hello",
        history=[],
        context={"foo": "bar"}
    )
    
    try:
        res = chat_endpoint(req)
        print("Success:", res)
    except Exception as e:
        print("Error:")
        traceback.print_exc()

if __name__ == "__main__":
    test()
