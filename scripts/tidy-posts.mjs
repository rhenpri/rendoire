// Tidy every post already in src/content/blog/:
//   - remove Medium's tracking pixel
//   - download remote images into src/assets/blog/<slug>/
//   - fold Medium tags into site topics
//   - fill in a description where one is missing or is an auto-truncated excerpt
//
// Safe to re-run; it only rewrites a file when something changed.
//
// Usage:
//   node scripts/tidy-posts.mjs            # tidy all posts
//   node scripts/tidy-posts.mjs --offline  # skip image downloads

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BLOG_DIR,
  cleanBody,
  describe,
  localizeImages,
  normalizeTags,
  parsePost,
  serializePost,
} from './lib/posts.mjs';

const offline = process.argv.includes('--offline');
let changed = 0;
const problems = [];

for (const file of readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f)).sort()) {
  const path = join(BLOG_DIR, file);
  const raw = readFileSync(path, 'utf8');
  const slug = file.replace(/\.mdx?$/, '');
  const { data, body: rawBody } = parsePost(raw);

  let body = cleanBody(rawBody);
  let cover = data.cover;
  if (!offline) {
    const res = await localizeImages({ slug, cover, body });
    ({ cover, body } = res);
    for (const f of res.failures) problems.push(`${slug}: ${f}`);
  }
  if (cover) data.cover = cover;

  data.tags = normalizeTags(data.tags ?? []);

  // An excerpt the importer cut off mid-sentence ends in an ellipsis; a
  // description someone wrote by hand does not, and is left alone.
  const d = (data.description ?? '').trim();
  if (!d || d.endsWith('…') || d.endsWith('...')) data.description = describe(body, data.title);

  const next = serializePost(data, body);
  if (next !== raw) {
    writeFileSync(path, next, 'utf8');
    changed += 1;
    console.log(`  ✓ ${file}`);
  }
}

console.log(`\n${changed} post(s) updated.`);
if (problems.length) {
  console.log(`\n${problems.length} image(s) could not be downloaded and still point at the remote URL:`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
