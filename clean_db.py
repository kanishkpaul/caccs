import sqlite3
import os

def clean_db():
    db_path = 'caccs.db'
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Find all narratives with 'battery' in title (case-insensitive in SQLite)
    cursor.execute("SELECT id, title FROM narratives WHERE title LIKE '%battery%'")
    rows = cursor.fetchall()

    if not rows:
        print("No duplicate narratives found for 'battery'.")
        conn.close()
        return

    # Keep exactly one entry, delete the rest
    keep_id = rows[0][0]
    to_delete = [r[0] for r in rows[1:]]

    if to_delete:
        cursor.executemany("DELETE FROM narratives WHERE id = ?", [(d,) for d in to_delete])
        conn.commit()
        print(f"Cleaned {len(to_delete)} duplicate battery narratives. Kept: {rows[0][1]} (ID: {keep_id})")
    else:
        print(f"Only one battery narrative exists: {rows[0][1]} (ID: {keep_id})")

    # Optional: Clean other duplicates in general (same title and narrative)
    cursor.execute("""
        SELECT title, narrative, COUNT(*) 
        FROM narratives 
        GROUP BY title, narrative 
        HAVING COUNT(*) > 1
    """)
    other_dupes = cursor.fetchall()
    
    for title, narr, count in other_dupes:
        cursor.execute("SELECT id FROM narratives WHERE title = ? AND narrative = ?", (title, narr))
        ids = [r[0] for r in cursor.fetchall()]
        to_del = ids[1:]
        cursor.executemany("DELETE FROM narratives WHERE id = ?", [(d,) for d in to_del])
        conn.commit()
        print(f"Deleted {len(to_del)} generic duplicates for narrative: '{title}'")

    conn.close()

if __name__ == "__main__":
    clean_db()
