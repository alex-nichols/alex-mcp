#!/usr/bin/env ts-node
import { execSync } from 'child_process';

console.log('Building project...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('Build complete.');
} catch (e) {
  console.error('Build failed.');
  process.exit(1);
}
