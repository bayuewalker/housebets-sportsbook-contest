import { createHash } from 'node:crypto';

const repository = 'bayuewalker/housebets-sportsbook-contest';
const site = 'https://bayuewalker.github.io/housebets-sportsbook-contest/';

async function get(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HOUSE-LIVE-release-verification', 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}

try {
  // Pin the expected manifest to the branch head to avoid mixing releases.
  const head = await (await get(`https://api.github.com/repos/${repository}/commits/gh-pages`)).json();
  if (!/^[a-f0-9]{40}$/.test(head.sha)) throw new Error('Invalid publishing commit.');
  const expected = await (await get(`https://raw.githubusercontent.com/${repository}/${head.sha}/build-info.json`)).json();
  const actual = await (await get(`${site}build-info.json`)).json();
  if (actual.sourceCommit !== expected.sourceCommit ||
      JSON.stringify(Object.entries(actual.files ?? {}).sort()) !== JSON.stringify(Object.entries(expected.files ?? {}).sort())) {
    throw new Error('The public manifest does not match the current gh-pages release.');
  }
  if (!expected.files?.['index.html']) throw new Error('The release manifest has no index.html.');
  let verified = 0;
  for (const [path, checksum] of Object.entries(expected.files)) {
    // .nojekyll controls publishing; GitHub does not need to serve it publicly.
    if (path === '.nojekyll') continue;
    if (!/^[\w./-]+$/.test(path) || path.startsWith('/') || path.split('/').includes('..') || !/^[a-f0-9]{64}$/.test(checksum)) {
      throw new Error(`Invalid manifest entry: ${path}`);
    }
    const bytes = await (await get(`${site}${path}`)).arrayBuffer();
    const hash = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
    if (hash !== checksum) throw new Error(`Public asset checksum mismatch: ${path}`);
    verified++;
  }
  console.log(`PASS: ${verified} public assets match source ${expected.sourceCommit} (gh-pages ${head.sha}).`);
  console.log('Next: browser QA of all five routes at 1440px and 390px. Asset verification does not replace interaction tests.');
} catch (error) {
  console.error(`Pages verification failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error('Check Settings → Pages → Deploy from a branch → gh-pages → / (root), then inspect the Pages deployment status.');
  process.exitCode = 1;
}
