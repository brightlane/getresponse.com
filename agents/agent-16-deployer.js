// agents/agent-16-deployer.js
// Agent‑16 – Auto‑deployer (GitHub Pages)
// Runs after the pipeline and deploys output/html/ → docs/ → GitHub Pages

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Sync output/html → docs/
 *
 * @param {string} srcDir
 * @param {string} destDir
 */
function syncOutputToDocs(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    if (fs.lstatSync(src).isDirectory()) {
      syncOutputToDocs(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  console.log(`✅ Deployer: synced ${srcDir} → ${destDir}`);
}

/**
 * Commit and push to GitHub (for GitHub Pages via /docs)
 */
function commitAndPush() {
  const branch = 'main';
  const docsDir = path.join(__dirname, '..', 'docs');

  try {
    // 1. Add changes
    execSync('git add .', { cwd: __dirname });
    console.log('✅ Deployer: git add .');

    // 2. Commit
    const commitMsg = '🤖 Agent‑16: auto‑deploy new site builds';
    execSync(`git commit -m "${commitMsg}"`, {
      cwd: __dirname,
    });
    console.log('✅ Deployer: git commit');

    // 3. Push to GitHub
    execSync('git push origin main', {
      cwd: __dirname,
    });
    console.log('✅ Deployer: git push origin main → GitHub Pages will rebuild');

  } catch (err) {
    console.error('❌ Deployer: git push failed:', err.message);
    throw err;
  }
}

/**
 * Main entry – run after pipeline
 */
function runDeployer() {
  const rootDir = path.join(__dirname, '..');
  const srcDir = path.join(rootDir, 'output', 'html'); // where Agent‑9 writes
  const destDir = path.join(rootDir, 'docs');          // GitHub Pages source

  if (!fs.existsSync(srcDir)) {
    throw new Error(`❌ Deployer: missing srcDir ${srcDir}`);
  }

  // 1. Sync output/html → docs
  syncOutputToDocs(srcDir, destDir);

  // 2. If you run this in CI (GitHub Actions, etc.), don’t commit
  //    In local dev, you can run this manually:
  // commitAndPush();

  console.log('✅ Deployer done. Run git add/commit/push manually or in CI.');
}

module.exports = {
  syncOutputToDocs,
  commitAndPush,
  runDeployer,
};
