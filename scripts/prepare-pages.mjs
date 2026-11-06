import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative } from 'node:path';

// Local preparation only. GitHub publishing uses gh-pages / (root).
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim();
if (dirty) throw new Error('Commit tracked source changes before preparing a traceable Pages release.');
const output = resolve('.pages');
await readFile('dist/index.html');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp('dist', output, { recursive: true });
await writeFile(resolve(output, '.nojekyll'), '');
const files = {};
async function walk(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name);
    if (item.isDirectory()) await walk(path);
    else files[relative(output, path).replaceAll('\\', '/')] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
}
await walk(output);
await writeFile(resolve(output, 'build-info.json'), JSON.stringify({ sourceCommit, files }, null, 2) + '\n');
console.log(`Prepared ${Object.keys(files).length} static files in .pages/ from ${sourceCommit}`);
