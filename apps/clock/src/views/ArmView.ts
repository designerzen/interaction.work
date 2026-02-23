/**
 * ArmView - Rotating progress indicator arm
 */

export class ArmView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public radius: number;
  private color: string;
  private originalColor: string;
  private rotation: number = 0;
  private targetRotation: number = 0;
  private activeColor: string;

  constructor(radius: number, color: string, activeColor: string) {
    this.radius = radius;
    this.color = color;
    this.originalColor = color;
    this.activeColor = activeColor;

    // Create canvas for drawing
    this.canvas = document.createElement('canvas');
    this.canvas.width = radius * 2;
    this.canvas.height = radius * 2;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.pointerEvents = 'none';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    this.draw();
  }

  /**
   * Update rotation based on progress (0-1)
   */
  update(progress: number): void {
    // Normalize progress to 0-1 and convert to radians
    const normalizedProgress = progress % 1;
    // Add Math.PI / 2 offset to align with node positions
    this.targetRotation = normalizedProgress * Math.PI * 2;
    
    // Direct rotation without easing to avoid oscillation
    this.rotation = this.targetRotation;
    this.draw();
  }

  /**
   * Trigger the arm (visual feedback on beat)
   */
  trigger(): void {
    this.color = this.activeColor;
    this.draw();

    setTimeout(() => {
      this.color = this.originalColor;
      this.draw();
    }, 100);
  }

  /**
   * Draw the arm on canvas
   */
  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context state
    this.ctx.save();

    // Translate to center
    const centerX = this.radius;
    const centerY = this.radius;
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.rotation);

    // Draw arm line
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.radius * 0.1);
    this.ctx.lineTo(0, -this.radius * 0.95);
    this.ctx.stroke();

    // Draw center circle
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Restore context state
    this.ctx.restore();
  }

  /**
   * Get the canvas element
   */
  getElement(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Set canvas size
   */
  setSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.draw();
  }
}
