#!/usr/bin/env node
// Refresh the long-lived Instagram token (they last 60 days). Run monthly.
//   IG_ACCESS_TOKEN=... node scripts/instagram/refresh-token.mjs [--set-secret]
// --set-secret stores the new token as the repo secret IG_ACCESS_TOKEN using the gh CLI
// (needs GH_TOKEN with permission to write secrets, i.e. a fine-grained PAT, not the default Actions token).

import { spawnSync } from 'node:child_process';

const token = process.env.IG_ACCESS_TOKEN;
if (!token) {
  console.error('IG_ACCESS_TOKEN is not set.');
  process.exit(1);
}
const url = new URL('https://graph.instagram.com/refresh_access_token');
url.searchParams.set('grant_type', 'ig_refresh_token');
url.searchParams.set('access_token', token);
const res = await fetch(url);
const json = await res.json();
if (!res.ok || !json.access_token) {
  console.error('Refresh failed:', json.error?.message ?? JSON.stringify(json));
  process.exit(1);
}
const days = Math.round(json.expires_in / 86400);
console.log(`Token refreshed, valid for about ${days} days.`);
if (process.argv.includes('--set-secret')) {
  const r = spawnSync('gh', ['secret', 'set', 'IG_ACCESS_TOKEN'], { input: json.access_token, stdio: ['pipe', 'inherit', 'inherit'] });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log('Repository secret IG_ACCESS_TOKEN updated.');
} else {
  console.log('Run again with --set-secret to store it, or copy the new token yourself.');
}
