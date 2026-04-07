import sqlite3
try:
    conn = sqlite3.connect('caccs.db')
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cur.fetchall()
    print(f"Tables: {tables}")
    if ('narratives',) in tables:
        cur.execute("SELECT COUNT(*) FROM narratives")
        count = cur.fetchone()[0]
        print(f"Narratives count: {count}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
