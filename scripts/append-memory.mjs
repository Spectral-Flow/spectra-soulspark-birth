import fs from 'fs/promises';
import path from 'path';

const MEMORY_PATH = path.resolve(process.cwd(), '.assistant_memory', 'memory-bank.md');

function timestamp() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function formatEntry(text) {
  const ts = timestamp();
  return `- ${ts}: ${text.replace(/\n/g, ' ')}\n`;
}

async function appendEntry(text) {
  try {
  const data = await fs.readFile(MEMORY_PATH, 'utf8');
    const marker = '## RECENT_CHANGES';
    const idx = data.indexOf(marker);
    if (idx === -1) {
      // prepend section
      const newData = `${data}\n## RECENT_CHANGES\n${formatEntry(text)}\n`;
      await fs.writeFile(MEMORY_PATH, newData, 'utf8');
      console.log('Appended entry under new RECENT_CHANGES section.');
      return;
    }
    // find position after marker line
    const after = data.indexOf('\n', idx) + 1;
    // insert after the marker's line
    const before = data.slice(0, after);
    const rest = data.slice(after);
    const newData = `${before}${formatEntry(text)}${rest}`;
    await fs.writeFile(MEMORY_PATH, newData, 'utf8');
    console.log('Appended entry successfully.');
  } catch (err) {
    console.error('Failed to append memory entry:', err);
    process.exit(1);
  }
}

const text = process.argv.slice(2).join(' ') || 'assistant: generic update';
appendEntry(text);
