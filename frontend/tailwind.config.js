import colors from 'tailwindcss/colors';
import {THEME} from './src/theme.js';
// Remap Tailwind "stone" to the cool slate scale so existing classes pick up the blue/neutral theme.
export default {content:['./index.html','./src/**/*.{ts,tsx}'],theme:{extend:{colors:{
  stone:colors.slate,
  accent:{DEFAULT:THEME.primary,soft:THEME.pale,dark:THEME.dark},
  navy:THEME.navy,ink:THEME.text,paper:THEME.bg}}},plugins:[]};
