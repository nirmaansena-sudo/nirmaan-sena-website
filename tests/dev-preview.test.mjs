import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { isIPv4 } from 'node:net';

const configUrl = new URL('../next.config.mjs', import.meta.url).href;

// Separate processes exercise the configuration at startup without changing
// NODE_ENV for any other test or reusing a cached configuration module.
function readConfig(mode) {
  const script = `
    const { default: config } = await import(${JSON.stringify(configUrl)});
    const rules = await config.headers();
    console.log(JSON.stringify({
      origins: config.allowedDevOrigins,
      headers: Object.fromEntries(rules.find(rule => rule.source === '/:path*').headers.map(({ key, value }) => [key, value]))
    }));
  `;
  return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
    env: { ...process.env, NODE_ENV: mode },
    encoding: 'utf8',
  }));
}

const assignedPrivateHosts = Object.values(networkInterfaces()).flat().filter((entry) => {
  if (!entry || entry.internal || !isIPv4(entry.address)) return false;
  const [first, second] = entry.address.split('.').map(Number);
  return first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}).map((entry) => entry.address);

test('phone and tablet development origins include this computer and no other hosts', () => {
  const { origins, headers } = readConfig('development');
  assert.deepEqual([...origins].sort(), [...new Set(['127.0.0.1', ...assignedPrivateHosts])].sort());
  assert.ok(origins.every(isIPv4), 'use exact host addresses, never wildcard domains');
  assert.match(headers['Content-Security-Policy'], /connect-src[^;]* ws: wss:/);
  assert.ok(!headers['Content-Security-Policy'].includes('upgrade-insecure-requests'), 'HTTP LAN previews must remain usable');
  assert.equal(headers['Strict-Transport-Security'], undefined);
});

test('production does not inherit LAN development hosts or relaxed script and connection policies', () => {
  const { origins, headers } = readConfig('production');
  assert.deepEqual(origins, ['127.0.0.1']);
  const csp = headers['Content-Security-Policy'];
  assert.ok(!csp.includes('unsafe-eval'));
  assert.ok(!/\b(?:ws|wss):/.test(csp));
  for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", 'upgrade-insecure-requests']) {
    assert.ok(csp.includes(directive), directive);
  }
  assert.equal(headers['Strict-Transport-Security'], 'max-age=31536000; includeSubDomains');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
});
