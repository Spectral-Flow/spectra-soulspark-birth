"""
ai_memory_bank.py
A modular memory bank system for AI companions.
Automatically manages folders and files for memory categories (events, emotions, creative output, stats).
Provides functions to add, retrieve, update, and delete memories with filtering.
"""
import os
import json
from datetime import datetime
from typing import List, Dict, Optional, Any

# Root folder for all memories
MEMORY_ROOT = "ai_memories"
# Default categories for the AI companion
CATEGORIES = ["events", "emotions", "creative_output", "stats"]

def init_memory_bank(root: str = MEMORY_ROOT, categories: List[str] = CATEGORIES):
    """
    Create the memory bank folder and category subfolders if they don't exist.
    """
    os.makedirs(root, exist_ok=True)
    for cat in categories:
        os.makedirs(os.path.join(root, cat), exist_ok=True)

def _timestamp() -> str:
    """Return current timestamp as string."""
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def _memory_path(category: str, name: str, ext: str = "json") -> str:
    """Return full path for a memory file."""
    return os.path.join(MEMORY_ROOT, category, f"{name}.{ext}")

def add_memory(category: str, title: str, content: str, tags: Optional[List[str]] = None, metadata: Optional[Dict[str, Any]] = None) -> str:
    """
    Add a new memory entry to the specified category.
    Returns the file path of the saved memory.
    """
    assert category in CATEGORIES, f"Unknown category: {category}"
    entry = {
        "title": title,
        "content": content,
        "tags": tags or [],
        "timestamp": _timestamp(),
        "category": category,
        "metadata": metadata or {}
    }
    fname = f"{title.replace(' ', '_')}_{entry['timestamp']}"
    path = _memory_path(category, fname)
    with open(path, "w") as f:
        json.dump(entry, f, indent=2)
    return path

def retrieve_memories(category: Optional[str] = None, date: Optional[str] = None, tags: Optional[List[str]] = None) -> List[Dict]:
    """
    Retrieve all memories, or filter by category, date (YYYY-MM-DD), or tags.
    Returns a list of memory entries.
    """
    results = []
    cats = [category] if category else CATEGORIES
    for cat in cats:
        folder = os.path.join(MEMORY_ROOT, cat)
        for fname in os.listdir(folder):
            if fname.endswith(".json"):
                path = os.path.join(folder, fname)
                with open(path) as f:
                    entry = json.load(f)
                if date and not entry["timestamp"].startswith(date):
                    continue
                if tags and not any(tag in entry["tags"] for tag in tags):
                    continue
                results.append(entry)
    return results

def update_memory(category: str, fname: str, new_content: Optional[str] = None, new_tags: Optional[List[str]] = None, new_metadata: Optional[Dict[str, Any]] = None) -> str:
    """
    Update an existing memory entry's content, tags, or metadata.
    Returns the file path of the updated memory.
    """
    path = _memory_path(category, fname)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Memory entry not found: {path}")
    with open(path) as f:
        entry = json.load(f)
    if new_content:
        entry["content"] = new_content
    if new_tags:
        entry["tags"] = new_tags
    if new_metadata:
        entry["metadata"] = new_metadata
    entry["timestamp"] = _timestamp()  # Update timestamp
    with open(path, "w") as f:
        json.dump(entry, f, indent=2)
    return path

def delete_memory(category: str, fname: str) -> bool:
    """
    Delete a memory entry file. Returns True if deleted, False if not found.
    """
    path = _memory_path(category, fname)
    if os.path.exists(path):
        os.remove(path)
        return True
    return False

# --- Example Usage ---
if __name__ == "__main__":
    init_memory_bank()
    # Add a memory to 'events'
    add_memory("events", "AI Birth", "AI companion initialized.", tags=["init", "system"], metadata={"version": "1.0"})
    # Add a memory to 'emotions'
    add_memory("emotions", "First Joy", "AI experienced joy for the first time.", tags=["joy", "emotion"], metadata={"intensity": 0.8})
    # Retrieve all 'events' memories
    events = retrieve_memories(category="events")
    print("Events:", events)
    # Update a memory (use actual filename from folder)
    # update_memory("events", "AI_Birth_2025-08-17_12-00-00", new_content="AI companion boot sequence completed.")
    # Delete a memory (use actual filename from folder)
    # delete_memory("events", "AI_Birth_2025-08-17_12-00-00")
