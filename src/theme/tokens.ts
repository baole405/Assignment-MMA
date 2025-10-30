export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
} as const;

export const colors = {
  background: "#0F172A",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F4F6",
  primary: "#0061FF",
  onPrimary: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  danger: "#DC2626",
  warning: "#D97706",
  success: "#0F9D58",
} as const;

export const typography = {
  title: 20,
  body: 16,
  caption: 13,
} as const;

export const shadows = {
  medium: {
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const;

export type ThemeSpacing = keyof typeof spacing;
export type ThemeRadius = keyof typeof radius;
