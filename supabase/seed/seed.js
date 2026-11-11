// Sets the test passwords from PRD 10.4 on the users created by supabase/seed.sql.
// Passwords go through the Supabase Auth admin API, so they are never stored in SQL.
//
// Usage (after `npx supabase db reset`):
//   node --env-file=.env supabase/seed/seed.js
//
// Needs in .env: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
// It only runs against a local stack unless SEED_ALLOW_REMOTE=true is set.

const TEST_ACCOUNTS = [
  // Test-only passwords from PRD 10.4. Never real ones.
  { email: 'thandeka.m@example.com', password: 'TestResident1' },
  { email: 'nomsa.s@example.com', password: 'TestResident2' },
  { email: 'zanele.k@example.com', password: 'TestWardAdmin1' },
  { email: 'kagiso.m@example.com', password: 'TestFieldTeam1' },
];

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run: node --env-file=.env supabase/seed/seed.js');
  process.exit(1);
}

const { hostname } = new URL(url);
const isLocal = hostname === '127.0.0.1' || hostname === 'localhost';
if (!isLocal && process.env.SEED_ALLOW_REMOTE !== 'true') {
  console.error(`Refusing to seed ${url}: it is not a local stack. Set SEED_ALLOW_REMOTE=true if you really mean it.`);
  process.exit(1);
}

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
};

async function adminRequest(path, options = {}) {
  const response = await fetch(`${url}/auth/v1/admin${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  const { users } = await adminRequest('/users?per_page=1000');
  let failed = false;

  for (const account of TEST_ACCOUNTS) {
    const user = users.find((u) => u.email === account.email);
    if (!user) {
      console.error(`✗ ${account.email}: not found. Run npx supabase db reset first.`);
      failed = true;
      continue;
    }
    await adminRequest(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ password: account.password }),
    });
    console.log(`✓ ${account.email}: password set`);
  }

  if (failed) process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
