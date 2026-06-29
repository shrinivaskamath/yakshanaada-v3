// Color tokens ported from the React Native app (components/theme.tsx) so the
// web version matches the native look.

export type ThemeName = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textOnSurface: string;
  headerBackground: string;
  headerIcon: string;
  accent: string;
  border: string;
  drawerBackground: string;
  drawerActiveBackground: string;
  drawerText: string;
  blockBackground: string;
  blockText: string;
  disabled: string;
  statusBar: string;
  timelineBackground: string;
  timelineGuide: string;
}

export const darkColors: ThemeColors = {
  background: '#212121',
  surface: '#424242',
  text: '#ffffff',
  textOnSurface: '#ffffff',
  headerBackground: '#000000',
  headerIcon: '#ffffff',
  accent: '#961A1D',
  border: '#ffffff',
  drawerBackground: '#121212',
  drawerActiveBackground: '#2a2a2a',
  drawerText: '#ffffff',
  blockBackground: '#dddddd',
  blockText: '#000000',
  disabled: '#666666',
  statusBar: '#000000',
  timelineBackground: '#1a1a1a',
  timelineGuide: '#3a3a3a',
};

export const lightColors: ThemeColors = {
  background: '#fafafa',
  surface: '#e6e6e6',
  text: '#1a1a1a',
  textOnSurface: '#1a1a1a',
  headerBackground: '#ffffff',
  headerIcon: '#961A1D',
  accent: '#961A1D',
  border: '#1a1a1a',
  drawerBackground: '#ffffff',
  drawerActiveBackground: '#f0dada',
  drawerText: '#1a1a1a',
  blockBackground: '#ffffff',
  blockText: '#1a1a1a',
  disabled: '#cccccc',
  statusBar: '#961A1D',
  timelineBackground: '#fafafa',
  timelineGuide: '#e0e0e0',
};

export const themeColors: Record<ThemeName, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
