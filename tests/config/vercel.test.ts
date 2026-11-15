// Issue #15: Vercel must serve index.html for every path, so direct visits and
// refreshes on /sign-up, /log-in etc. reach the single-page app (no 404).
type VercelConfig = { rewrites?: { source: string; destination: string }[] };

const found = import.meta.glob<VercelConfig>('../../vercel.json', { import: 'default', eager: true });
const config = Object.values(found)[0];

describe('vercel.json', () => {
  it('exists at the repo root', () => {
    expect(config).toBeDefined();
  });

  it('rewrites every path to /index.html', () => {
    expect(config?.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
  });
});
