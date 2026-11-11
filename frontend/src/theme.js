// Single source of truth for the blue chart/UI palette. Change colours here only.
export const THEME = {
  primary: '#1D4ED8', dark: '#1E3A8A', medium: '#2563EB', sky: '#60A5FA', light: '#93C5FD',
  pale: '#DBEAFE', veryLight: '#EFF6FF', navy: '#172554',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', grid: '#E2E8F0',
  // Categorical series: ordered so neighbours differ strongly in lightness (readable in greyscale / CVD).
  series: ['#1D4ED8', '#93C5FD', '#172554', '#60A5FA', '#1E3A8A', '#BFDBFE', '#2563EB', '#3B82F6'],
  // Sequential ramp for heatmaps / choropleth-style fills (light = low, dark = high).
  ramp: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#60A5FA', '#2563EB', '#1E3A8A', '#172554'],
  // Redundant (non-colour) encodings for multi-series charts.
  symbols: ['circle', 'rect', 'triangle', 'diamond', 'roundRect', 'pin', 'arrow', 'circle'],
  dashes: ['solid', 'dashed', 'dotted', 'solid', 'dashed', 'dotted', 'solid', 'dashed'],
};
export const font = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
