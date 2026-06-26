export const theme = {
  colors: {
    background: '#f6f7f9',
    surface: '#ffffff',
    border: '#d9dee8',
    text: '#1f2937',
    muted: '#6b7280',
    accent: '#0f766e',
    accentLight: 'rgba(15, 118, 110, 0.12)',
    accentUltraLight: 'rgba(15, 118, 110, 0.04)',

    // Semantic status tones
    status: {
      urgent: {
        border: '#fecdd3',
        bg: '#fff5f5',
        text: '#b42318',
        badgeBg: 'rgba(180, 35, 24, 0.12)',
      },
      warning: {
        border: '#fef08a',
        bg: '#fffdf5',
        text: '#d97706',
        label: '#946200',
        icon: '#b45309',
        badgeBg: 'rgba(183, 121, 31, 0.12)',
      },
      info: {
        border: '#ccfbf1',
        bg: '#f0fdfa',
        text: '#0f766e',
      },
      error: {
        text: '#cf2f2f',
        icon: '#dc2626',
      },
    },

    // Slate palette for stale states and generic neutral styling
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
    },
  },
  shadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
};

export type AppTheme = typeof theme;
