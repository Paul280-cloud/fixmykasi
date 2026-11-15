import { colors } from '../../src/styles/tokens';

// WCAG 2.x contrast audit of every colour token (PR #41 review). It only
// reports: pairs below 4.5:1 are printed, not failed, so the design can decide.

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: Rgb): number {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Tailwind "bg-token/10" is the token at 10 % opacity over white.
function overWhite(rgb: Rgb, alpha: number): Rgb {
  return rgb.map((v) => Math.round(v * alpha + 255 * (1 - alpha))) as Rgb;
}

function flatten(tree: object, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]: [string, unknown]) => {
    const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key;
    return typeof value === 'string' ? [[name, value] as [string, string]] : flatten(value as object, name);
  });
}

// Source text of every file in src, read through Vite.
const sources = import.meta.glob<string>('../../src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const tokens = new Map(flatten(colors));

// Every tinted background in the code, e.g. bg-primary/10, bg-error/10.
function tintedBackgrounds(): [string, string][] {
  const found = new Set<string>();
  for (const text of Object.values(sources)) {
    for (const match of text.matchAll(/\bbg-([a-z-]+)\/(\d+)\b/g)) {
      if (tokens.has(match[1])) found.add(`${match[1]}/${match[2]}`);
    }
  }
  return [...found].sort().map((cls) => {
    const [name, pct] = cls.split('/');
    const [r, g, b] = overWhite(hexToRgb(tokens.get(name)!), Number(pct) / 100);
    return [`bg-${cls}`, `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`];
  });
}

describe('Colour contrast audit', () => {
  it('computes WCAG contrast correctly', () => {
    expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrast(hexToRgb('#777777'), [255, 255, 255])).toBeCloseTo(4.48, 2);
  });

  it('lists every text colour below 4.5:1 on white and on tinted backgrounds', () => {
    const backgrounds: [string, string][] = [
      ['white', '#FFFFFF'],
      ['bg-surface', colors.surface],
      ...tintedBackgrounds(),
    ];
    const textColours = [...tokens].filter(
      ([name]) => !['background', 'surface', 'border', 'disabled'].includes(name),
    );

    const failing: string[] = [];
    for (const [bgName, bg] of backgrounds) {
      for (const [name, hex] of textColours) {
        const ratio = contrast(hexToRgb(hex), hexToRgb(bg));
        if (ratio < 4.5) failing.push(`${name} ${hex} on ${bgName} ${bg}: ${ratio.toFixed(2)}:1`);
      }
    }
    console.log(
      `Backgrounds checked: ${backgrounds.map(([n, h]) => `${n} ${h}`).join(', ')}\n` +
        `Below 4.5:1 (${failing.length}):\n  ${failing.join('\n  ') || 'none'}`,
    );
    expect(backgrounds.length).toBeGreaterThan(1);
  });
});
