import json
import subprocess
import tempfile
import os


def sandboxed_state_update(state: dict, decision: dict, external: dict, update_fn_code: str) -> dict:
    """Execute state update in an isolated subprocess (for untrusted code)."""
    script = f"""
import json, sys

state = json.loads('''{json.dumps(state)}''')
decision = json.loads('''{json.dumps(decision)}''')
external = json.loads('''{json.dumps(external)}''')

{update_fn_code}

print(json.dumps(new_state))
"""

    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
        f.write(script)
        f.flush()
        temp_path = f.name

    try:
        result = subprocess.run(
            ['python', temp_path],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            raise RuntimeError(f"State update failed: {result.stderr}")
        return json.loads(result.stdout)
    except subprocess.TimeoutExpired:
        raise RuntimeError("State update timed out (>5s)")
    finally:
        try:
            os.unlink(temp_path)
        except OSError:
            pass
