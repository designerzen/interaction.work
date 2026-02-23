/**
 * Colors - Utility functions for color manipulation
 */

/**
 * Convert hex color to RGB components
 * @param hex - Hex color string (e.g., '#ff0000' or 'ff0000')
 * @returns Object with r, g, b properties (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB components to CSS rgba string
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha value (0-1), default 1
 * @returns CSS rgba color string
 */
export function rgbToString(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Convert hex color to CSS rgba string with alpha
 * @param hex - Hex color string (e.g., '#ff0000')
 * @param alpha - Alpha value (0-1)
 * @returns CSS rgba color string
 */
export function colorWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  return rgbToString(rgb.r, rgb.g, rgb.b, alpha);
}

/**
 * Lighten a color by increasing brightness
 * @param hex - Hex color string
 * @param percent - Lightening percentage (0-100)
 * @returns Lightened hex color
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const r = Math.min(255, Math.floor(rgb.r * factor));
  const g = Math.min(255, Math.floor(rgb.g * factor));
  const b = Math.min(255, Math.floor(rgb.b * factor));
  return rgbToHex(r, g, b);
}

/**
 * Darken a color by decreasing brightness
 * @param hex - Hex color string
 * @param percent - Darkening percentage (0-100)
 * @returns Darkened hex color
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = 1 - percent / 100;
  const r = Math.max(0, Math.floor(rgb.r * factor));
  const g = Math.max(0, Math.floor(rgb.g * factor));
  const b = Math.max(0, Math.floor(rgb.b * factor));
  return rgbToHex(r, g, b);
}

/**
 * Convert RGB components to hex color string
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string (e.g., '#ff0000')
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Invert a color
 * @param hex - Hex color string
 * @returns Inverted hex color
 */
export function invert(hex: string): string {
  const rgb = hexToRgb(hex);
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}
