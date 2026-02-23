/**
 * Config - Application configuration and constants
 */

export const Config = {
  // Colors
  COLOUR_FOREGROUND: '#1a1a1a',
  COLOUR_BACKGROUND: '#ffffff',
  COLOUR_LINES: '#333333',
  COLOUR_SHAPES: '#666666',
  COLOUR_ARM: '#ff6600',
  COLOUR_NODE: '#0099ff',
  COLOUR_NODE_ACTIVE: '#ff0000',

  // Transparency
  ALPHA_SHAPES: 0.3,

  // Sizes
  NODE_RADIUS: 26,
  DEFAULT_BEACON_RADIUS: 400,

  // Timing
  TIMER_INTERVAL: 10, // milliseconds between timer ticks
  DEFAULT_PERIOD: 6000, // milliseconds (1 bar)
  DEFAULT_BPM: 120,

  // Animation
  ANIMATION_DURATION: 300, // milliseconds
  EASE_TYPE: 'easeInOutQuad'
}