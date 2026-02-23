/**
 * PieChart - Canvas drawing utilities for pie charts and wedges
 */

export class PieChart {
  /**
   * Draw a pie segment
   */
  static drawSegment(
    ctx: CanvasRenderingContext2D,
    radius: number,
    percent: number = 0,
    color: string = '#FF0000',
    opacity: number = 1,
    startAngle: number = 0,
    xpos: number = 0,
    ypos: number = 0,
    step: number = 10
  ): void {
    if (percent > 1) percent = 1;

    const endAngle = startAngle + 360 * percent;

    ctx.clearRect(xpos - radius, ypos - radius, radius * 2, radius * 2);
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    const degreesPerRadian = Math.PI / 180;
    let startRad = startAngle * degreesPerRadian;
    const endRad = endAngle * degreesPerRadian;
    const stepRad = step * degreesPerRadian;

    ctx.moveTo(xpos, ypos);
    let theta = startRad;
    while (theta < endRad) {
      ctx.lineTo(xpos + radius * Math.cos(theta), ypos + radius * Math.sin(theta));
      theta += Math.min(stepRad, endRad - theta);
    }

    ctx.lineTo(xpos + radius * Math.cos(endRad), ypos + radius * Math.sin(endRad));
    ctx.lineTo(xpos, ypos);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * Draw a wedge (arc with lines from center)
   */
  static drawWedge(
    ctx: CanvasRenderingContext2D,
    radius: number,
    percent: number,
    color: string = '#FF0000',
    opacity: number = 1,
    sx: number = 0,
    sy: number = 0,
    startAngle: number = -90,
    track: boolean = true
  ): void {
    let arc = 360 * percent;
    if (track) startAngle -= arc;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy);

    if (Math.abs(arc) > 360) {
      arc = 360;
    }

    const numOfSegs = Math.ceil(Math.abs(arc) / 45);
    let segAngle = arc / numOfSegs;
    segAngle = (segAngle / 180) * Math.PI;
    let angle = (startAngle / 180) * Math.PI;

    // Calculate start point
    let ax = sx + Math.cos(angle) * radius;
    let ay = sy + Math.sin(angle) * radius;

    ctx.lineTo(ax, ay);

    for (let i = 0; i < numOfSegs; i++) {
      angle += segAngle;
      const angleMid = angle - segAngle / 2;
      const bx = sx + Math.cos(angle) * radius;
      const by = sy + Math.sin(angle) * radius;
      const cx = sx + Math.cos(angleMid) * (radius / Math.cos(segAngle / 2));
      const cy = sy + Math.sin(angleMid) * (radius / Math.cos(segAngle / 2));

      // Approximate quadratic curve with cubic bezier
      ctx.bezierCurveTo(cx, cy, cx, cy, bx, by);
    }

    ctx.lineTo(sx, sy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
