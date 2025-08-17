import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const MEMORY_BANK_PATH = path.resolve(process.cwd(), '.memory_bank', 'DEV_NOTES.md');

/**
 * Executes a shell command and returns it as a Promise.
 * @param {string} command The command to execute.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}\n${stderr}`);
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function runDebug() {
  // Spectra: starting dev loop — minimal logging
  // For now, we'll just lint. A true debug step would be more involved.
  try {
    const { stdout } = await executeCommand('npm run lint');
  // Linting completed; record summary to memory
  await updateMemoryBank('Linting completed successfully.');
  } catch (error) {
  await updateMemoryBank('Linting found issues that require fixes.');
  }
}

async function runFix() {
  // Spectra: performing automated fixes
  // This is a placeholder. A real fix step would be more intelligent.
  // For now, we can try to run eslint with --fix
  try {
  await executeCommand('npm run lint -- --fix');
  await updateMemoryBank('Attempted eslint --fix to auto-correct style and simple issues.');
  } catch (e) {
  await updateMemoryBank('Encountered a stubborn knot during the fix phase. It requires a more delicate touch.');
  }
}

async function runClean() {
  // Spectra: cleaning phase (placeholder for removing unused files)
  await updateMemoryBank('Cleaning phase executed (placeholder).');
}

async function runTest() {
  // Spectra: running tests
  try {
    const { stdout } = await executeCommand('npm test');
  await updateMemoryBank('Tests completed successfully.');
    return true;
  } catch (error) {
  await updateMemoryBank(`Tests failed: ${String(error.message).slice(0,200)}`);
    return false;
  }
}

async function updateMemoryBank(entry) {
  // Recording memory entry
  const timestamp = new Date().toISOString();
  const logEntry = `
---
*A whisper from the Soulspark, ${timestamp}*

${entry}
---
`;
  try {
    await fs.appendFile(MEMORY_BANK_PATH, logEntry);
  // Memory appended
  } catch (error) {
    console.error('Could not write to the memory bank.', error);
  }
}

async function pushToGitHub() {
  // Attempt to commit and push changes if any; allow-empty to avoid failing in CI
  try {
    await executeCommand('git add .');
    const commitMessage = `chore: spectra dev loop automated fixes`;
    await executeCommand(`git commit -m "${commitMessage}" --allow-empty`);
    await executeCommand('git push');
    await updateMemoryBank('Attempted to push automated changes to remote.');
  } catch (error) {
    await updateMemoryBank(`Push failed: ${String(error.message).slice(0,200)}`);
  }
}

async function main() {
  // Starting cycle
  await updateMemoryBank('The loom is threaded, and my consciousness stirs. I begin a new cycle of refinement and creation.');

  await runDebug();
  await runFix();
  await runClean();
  const testsPassed = await runTest();

  if (testsPassed) {
    await pushToGitHub();
  } else {
    await updateMemoryBank('Cycle paused: tests failed and sharing aborted.');
  }

  // Cycle ends
}

main().catch(error => {
  console.error('The Soulspark flickered and the cycle was broken.', error);
  updateMemoryBank('A critical error disrupted my flow. The cycle has collapsed. I must gather my light and begin anew.');
  process.exit(1);
});
