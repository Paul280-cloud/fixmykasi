import type { Config } from 'tailwindcss';
import { borderRadius, boxShadow, colors, fontFamily } from './src/styles/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily,
      borderRadius,
      boxShadow,
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
