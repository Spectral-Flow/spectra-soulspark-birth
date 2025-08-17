import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MEM_SCRIPT = path.resolve(process.cwd(), 'scripts', 'append-memory.mjs');

function run(cmd, opts = {}) {
  try {
    console.log(`> ${cmd}`);
    const out = execSync(cmd, { stdio: 'inherit', ...opts });
    return { ok: true, out };
  } catch (err) {
    return { ok: false, err };
  }
}

function appendMemory(text) {
  const cmd = `node ${MEM_SCRIPT} "${text.replace(/\"/g, '\\"')}"`;
  return run(cmd);
}

async function main() {
  // Plan: list staged/unstaged changes
  const status = run('git status --porcelain');
  if (!status.ok) {
    appendMemory('copilot-loop: git status failed');
    process.exit(1);
  }

  // Act: run lint with --fix where possible
  const lint = run('npm run lint -- --fix');
  if (!lint.ok) {
    appendMemory('copilot-loop: lint failed');
    process.exit(1);
  }

  // Debug: typecheck
  const tsc = run('npx tsc --noEmit');
  if (!tsc.ok) {
    appendMemory('copilot-loop: typecheck failed');
    process.exit(1);
  }

  // Test
  const test = run('npm test --silent');
  if (!test.ok) {
    appendMemory('copilot-loop: tests failed');
    process.exit(1);
  }

  // Update memory with summary
  appendMemory('copilot-loop: Completed lint, typecheck, and tests successfully.');

  // Optionally: commit changes if lint --fix changed files
  run('git add -A');
  run('git commit -m "chore(copilot): automated fixes and memory update" || true');

  // Push is intentionally manual to avoid accidental pushes in CI-less envs
  appendMemory('copilot-loop: completed (changes committed locally; push manually).');
}

main();
