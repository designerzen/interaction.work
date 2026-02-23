/**
 * TimelineColors - Color system following timeline state principles
 * 
 * Design Logic:
 * - PAST/DONE: Muted Grey (visual dismissal)
 * - CURRENTLY RUNNING: Pulsing Primary Blue (high visibility)
 * - FUTURE/PLANNED: Hatched or Outline (low visual weight)
 * - OVERDUE: Solid Red (demands attention)
 */

export enum TimelineState {
    PAST = 'past',
    RUNNING = 'running',
    FUTURE = 'future',
    OVERDUE = 'overdue'
}

export interface TimelineColorScheme {
    base: string;
    stroke: string;
    glow?: string;
    alpha?: number;
}

const COLORS = {
    past: {
        base: '#9ca3af',      // Muted grey
        stroke: '#6b7280',    // Slightly darker grey
        alpha: 0.6
    },
    running: {
        base: '#3b82f6',      // Primary blue
        stroke: '#2563eb',    // Darker blue
        glow: '#3b82f6'
    },
    future: {
        base: '#e5e7eb',      // Light grey for outline
        stroke: '#9ca3af',    // Grey stroke for definition
        alpha: 0.4
    },
    overdue: {
        base: '#ef4444',      // Solid red
        stroke: '#dc2626',    // Darker red
        glow: '#ef4444'
    }
};

/**
 * Get color scheme for a timeline state
 */
export function getTimelineColor(state: TimelineState): TimelineColorScheme {
    return COLORS[state];
}

/**
 * Determine timeline state based on beat position and progress
 * @param beatPosition - Beat position as percentage (0-1)
 * @param currentProgress - Current playback progress (0-1)
 * @param isPlaying - Whether the metronome is playing
 * @returns TimelineState
 */
export function determineTimelineState(
    beatPosition: number,
    currentProgress: number,
    isPlaying: boolean
): TimelineState {
    const epsilon = 0.02; // 2% tolerance for "current" detection
    
    // Currently running (within epsilon of current progress)
    if (isPlaying && Math.abs(beatPosition - currentProgress) < epsilon) {
        return TimelineState.RUNNING;
    }
    
    // Past/Done (beat is behind current progress)
    if (beatPosition < currentProgress - epsilon) {
        return TimelineState.PAST;
    }
    
    // Future/Planned (beat is ahead of current progress)
    if (beatPosition > currentProgress + epsilon) {
        return TimelineState.FUTURE;
    }
    
    // Default to running if within tolerance
    return TimelineState.RUNNING;
}

/**
 * Convert timeline color to canvas-compatible format
 */
export function toCanvasColor(hex: string, alpha?: number): string {
    // Parse hex to RGB
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    const a = alpha !== undefined ? alpha : 1;
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Create hatched pattern for future beats (low visual weight)
 * @param ctx - Canvas 2D context
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param radius - Circle radius
 */
export function drawHatchedCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    strokeColor: string = COLORS.future.stroke,
    strokeWidth: number = 2
): void {
    // Draw outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw hatching pattern
    ctx.strokeStyle = toCanvasColor(strokeColor, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Diagonal hatch lines
    const step = radius * 0.4;
    for (let offset = -radius * 2; offset < radius * 2; offset += step) {
        ctx.moveTo(x - radius + offset, y - radius);
        ctx.lineTo(x + radius + offset, y + radius);
    }
    ctx.stroke();
}

/**
 * Create pulsing animation data for running beats
 */
export function getPulseAnimation(
    time: number,
    frequency: number = 1.5
): { scale: number; alpha: number } {
    const pulse = Math.sin(time * frequency * Math.PI) * 0.5 + 0.5;
    return {
        scale: 1 + pulse * 0.2,
        alpha: 0.8 + pulse * 0.2
    };
}

/**
 * Create warning animation data for overdue beats
 */
export function getWarningAnimation(
    time: number,
    frequency: number = 2
): { glow: number; intensity: number } {
    const pulse = Math.sin(time * frequency * Math.PI) * 0.5 + 0.5;
    return {
        glow: pulse * 8,
        intensity: 0.7 + pulse * 0.3
    };
}
