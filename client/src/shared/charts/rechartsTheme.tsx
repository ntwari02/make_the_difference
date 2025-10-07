import { Theme } from '@mui/material/styles';

export const getTooltipProps = (theme: Theme) => ({
  contentStyle: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  labelStyle: { color: theme.palette.text.primary },
});

export const getGridProps = (theme: Theme) => ({
  strokeDasharray: '3 3',
  stroke: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  vertical: false,
});

export const getXAxisProps = (theme: Theme) => ({
  stroke: theme.palette.text.secondary,
  tick: { fill: theme.palette.text.secondary },
  axisLine: { stroke: theme.palette.divider },
});

export const getYAxisProps = (theme: Theme) => ({
  stroke: theme.palette.text.secondary,
  tick: { fill: theme.palette.text.secondary },
  axisLine: false,
});

export const getLegendStyle = (theme: Theme) => ({
  paddingTop: 16,
  color: theme.palette.text.primary,
});


