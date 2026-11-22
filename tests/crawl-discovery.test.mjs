import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return readFileSync(path.join(root, rel), 'utf8');
}

function redirectRules(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

const SITEMAP_REDIRECT = '/sitemap.xml /sitemap-index.xml 301';

test('robots.txt is derived from the site URL and allows every crawler', async () => {
  const source = read('src/pages/robots.txt.ts');
  assert.match(source, /sitemap-index\.xml/);
  assert.match(source, /\bsite\b/);
  assert.doesNotMatch(source, /playbooks\.ai-slang\.com/);
  assert.doesNotMatch(source, /googlebot/i);

  const robotsModule = await import(
    pathToFileURL(path.join(root, 'src/pages/robots.txt.ts')).href
  );

  const production = robotsModule.robotsTxt(new URL('https://playbooks.ai-slang.com'));
  assert.match(production, /^User-agent: \*$/m);
  assert.match(production, /^Allow: \/$/m);
  assert.match(production, /^Sitemap: https:\/\/playbooks\.ai-slang\.com\/sitemap-index\.xml$/m);
  assert.doesNotMatch(production, /googlebot/i);
  assert.doesNotMatch(production, /^Disallow:/m);

  const preview = robotsModule.robotsTxt(new URL('https://branch.example'));
  assert.match(preview, /^Sitemap: https:\/\/branch\.example\/sitemap-index\.xml$/m);
});

test('_redirects permanently redirects /sitemap.xml without a second URL list', () => {
  for (const rel of ['public/_redirects', 'dist/_redirects']) {
    const file = path.join(root, rel);
    assert.ok(existsSync(file), `${rel} is missing. Run npm run build so public/ is copied to dist/.`);
    const rules = redirectRules(read(rel));
    assert.ok(
      rules.includes(SITEMAP_REDIRECT),
      `${rel} must contain "${SITEMAP_REDIRECT}". Found: ${rules.join(' | ') || '(none)'}`
    );
  }

  assert.equal(existsSync(path.join(root, 'public/sitemap.xml')), false);
  assert.equal(existsSync(path.join(root, 'dist/sitemap.xml')), false);
  assert.ok(
    existsSync(path.join(root, 'dist/sitemap-index.xml')),
    'dist/sitemap-index.xml is missing. The redirect target is the Astro sitemap index.'
  );
});

test('built robots.txt includes the Sitemap line for the configured site', async () => {
  const robotsPath = path.join(root, 'dist/robots.txt');
  assert.ok(existsSync(robotsPath), 'dist/robots.txt is missing. Run npm run build.');

  const site =
    process.env.SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    'https://grokbot-playbooks.pages.dev';
  const { robotsTxt } = await import(
    pathToFileURL(path.join(root, 'src/pages/robots.txt.ts')).href
  );
  const text = read('dist/robots.txt');
  const expected = robotsTxt(new URL(site));

  assert.equal(
    text,
    expected,
    `dist/robots.txt does not match robotsTxt() for ${site}.\n--- built ---\n${text}\n--- expected ---\n${expected}`
  );
  assert.match(text, /^Sitemap: \S+\/sitemap-index\.xml$/m);
  assert.equal(text.match(/^Sitemap:/gm)?.length, 1);
});
