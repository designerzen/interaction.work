#!/usr/bin/env node
/**
 * Release script - Increments version, creates git tag, and pushes to remote
 * Usage: node actions/release.mjs [patch|minor|major]
 * Default: patch
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(rootDir, 'apps/photosynth/package.json');

// Get version increment type from CLI argument
const bumpType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error(`Invalid bump type: ${bumpType}`);
  console.error('Usage: node actions/release.mjs [patch|minor|major]');
  process.exit(1);
}

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Parse current version
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  // Increment version based on bump type
  let newVersion;
  switch (bumpType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  console.log(`\n📦 Releasing PhotoSYNTH...`);
  console.log(`Current version: ${currentVersion}`);
  console.log(`New version: ${newVersion}`);
  
  // Update package.json with new version and timestamp
  packageJson.version = newVersion;
  packageJson.time = Date.now();
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n');
  console.log(`✅ Updated package.json`);
  
  // Change to root directory for git operations
  const originalCwd = process.cwd();
  process.chdir(rootDir);
  
  // Stage the changes
  execSync('git add apps/photosynth/package.json', { stdio: 'inherit' });
  
  // Create commit
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
  console.log(`✅ Created commit`);
  
  // Create git tag
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  console.log(`✅ Created git tag v${newVersion}`);
  
  // Push to remote
  execSync('git push origin main --tags', { stdio: 'inherit' });
  console.log(`✅ Pushed to remote with tags`);
  
  console.log(`\n🚀 Release v${newVersion} complete!`);
  console.log(`The GitHub Actions workflow will automatically build and publish.\n`);
  
  // Restore original directory
  process.chdir(originalCwd);
  
} catch (error) {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
}
