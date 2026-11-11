// Design tokens from docs/PRD.md section 9.1.
export const colors = {
  primary: '#005D28', // Coat of Arms Green: buttons, links, active tabs
  secondary: '#531A17', // Heritage Brown: header bar, headings
  accent: '#D8A851', // Gold: accent lines, icons. Only dark text on it.
  urgent: '#EF4718', // Orange: urgent label, dark text only
  background: '#FFFFFF',
  surface: '#F8F6F1', // Warm grey: page sections, table stripes
  text: {
    DEFAULT: '#1C1C1C',
    secondary: '#5C5650',
  },
  error: '#B42318',
  success: '#1E7B34',
  warning: '#87451A', // Ochre Brown
  status: {
    received: '#5C5650',
    viewed: '#825B32',
    assigned: '#531A17',
    scheduled: '#87451A',
    'in-progress': '#B46E12',
    fixed: '#005D28',
    closed: '#1C1C1C',
    reopened: '#B42318',
  },
} as const;

export const fontFamily = {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
};

export const borderRadius = {
  card: '12px',
  input: '8px',
  button: '8px',
  photo: '8px',
};

export const boxShadow = {
  card: '0 1px 3px rgba(16, 24, 40, 0.1)',
};
