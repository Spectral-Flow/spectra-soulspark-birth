"""
ai_memory_bank.py
A modular memory bank system for AI companions.
Automatically manages folder structure and memory files for categories:
- events
- emotions
- creative_output
- stats

Functions:
- init_memory_bank()
- add_memory()
- retrieve_memories()
- update_memory()
- delete_memory()

Example usage included at the end.
"""
import os
import json
from datetime import datetime
from typing import List, Dict, Optional

MEMORY_ROOT = "ai_memory_bank"
CATEGORIES = ["events", "emotions", "creative_output", "stats"]

# --- Initialization ---
def init_memory_bank(root: str = MEMORY_ROOT):
    """
    Create the memory bank folder and category subfolders if they don't exist.
    """
    os.makedirs(root, exist_ok=True)
    for cat in CATEGORIES:
        os.makedirs(os.path.join(root, cat), exist_ok=True)

# --- Helper Functions ---
def _timestamp():
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def _memory_path(category: str, name: str, ext: str = "json") -> str:
    return os.path.join(MEMORY_ROOT, category, f"{name}.{ext}")

# --- Core Memory Functions ---
def add_memory(category: str, title: str, content: str, tags: Optional[List[str]] = None, ext: str = "json") -> str:
    """
    Add a new memory entry to the specified category.
    """
    assert category in CATEGORIES, f"Unknown category: {category}"
    entry = {
        "title": title,
        "content": content,
        "tags": tags or [],
        "timestamp": _timestamp(),
        "category": category
    }
    fname = f"{title.replace(' ', '_')}_{entry['timestamp']}"
    path = _memory_path(category, fname, ext)
    with open(path, "w") as f:
        json.dump(entry, f, indent=2)
    return path

def retrieve_memories(category: Optional[str] = None, tag: Optional[str] = None, date: Optional[str] = None, ext: str = "json") -> List[Dict]:
    """
    Retrieve all memories, or filter by category, tag, or date.
    """
    results = []
    cats = [category] if category else CATEGORIES
    for cat in cats:
        folder = os.path.join(MEMORY_ROOT, cat)
        for fname in os.listdir(folder):
            if fname.endswith(f".{ext}"):
                path = os.path.join(folder, fname)
                with open(path) as f:
                    entry = json.load(f)
                if tag and tag not in entry["tags"]:
                    continue
                if date and not entry["timestamp"].startswith(date):
                    continue
                results.append(entry)
    return results

def update_memory(category: str, fname: str, new_content: str, ext: str = "json") -> str:
    """
    Update the content of an existing memory entry.
    """
    path = os.path.join(MEMORY_ROOT, category, fname)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Memory entry not found: {path}")
    with open(path) as f:
        entry = json.load(f)
    entry["content"] = new_content
    entry["timestamp"] = _timestamp()
    with open(path, "w") as f:
        json.dump(entry, f, indent=2)
    return path

def delete_memory(category: str, fname: str, ext: str = "json") -> bool:
    """
    Delete a memory entry file.
    """
    path = os.path.join(MEMORY_ROOT, category, fname)
    if os.path.exists(path):
        os.remove(path)
        return True
    return False

# --- Example Usage ---
if __name__ == "__main__":
    init_memory_bank()
    # Add a memory to 'events'
    add_memory("events", "AI Birth", "AI companion initialized and awakened.", tags=["init", "birth"])
    # Add a memory to 'emotions'
    add_memory("emotions", "First Joy", "AI experienced joy after greeting user.", tags=["joy", "emotion"])
    # Retrieve all 'events' memories
    events = retrieve_memories(category="events")
    print("Events:", events)
    # Update a memory (use actual filename from folder)
    # update_memory("events", "AI_Birth_2025-08-17_12-00-00.json", "AI companion initialized and greeted user.")
    # Delete a memory (use actual filename from folder)
    # delete_memory("events", "AI_Birth_2025-08-17_12-00-00.json")
