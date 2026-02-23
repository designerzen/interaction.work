/**
 * PresetThumbnailGenerator - Generates procedural thumbnail images for timing presets
 * Creates visual representations of beat patterns using canvas
 */

export interface PresetPattern {
  name: string;
  beats: number[];
  bpm: number;
}

export class PresetThumbnailGenerator {
  /**
   * Generate a thumbnail canvas for a preset pattern
   */
  static generateThumbnail(preset: PresetPattern, width: number = 120, height: number = 120): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    
    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw the circular beat pattern
    this.drawBeatCircle(ctx, preset.beats, width, height);
    
    // Draw BPM text
    this.drawBPMText(ctx, preset.bpm, width, height);
    
    return canvas;
  }

  /**
   * Draw beats arranged in a circle
   */
  private static drawBeatCircle(
    ctx: CanvasRenderingContext2D,
    beats: number[],
    width: number,
    height: number
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Draw circle outline
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw beats
    beats.forEach((beatPercentage) => {
      const angle = beatPercentage * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // First beat (1) is accented
      const isFirst = beatPercentage === 0;
      const size = isFirst ? 10 : 6;
      const color = isFirst ? '#ff6b6b' : '#4ecdc4';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect for accent beat
      if (isFirst) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }

  /**
   * Draw BPM text
   */
  private static drawBPMText(
    ctx: CanvasRenderingContext2D,
    bpm: number,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${bpm} BPM`, width / 2, height - 6);
  }

  /**
   * Generate data URL from canvas for use as image src
   */
  static canvasToDataUrl(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }
}
