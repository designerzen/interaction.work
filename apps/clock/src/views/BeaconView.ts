/**
 * BeaconView - Main circular metronome visualization with interactive beat nodes
 */
import { MetronomeModel } from '../models/MetronomeModel';
import { ArmView } from './ArmView';
import { Config } from '../utils/Config';
import { colorWithAlpha } from '../utils/Colors';
import { BeaconEvent } from '../events/BeaconEvent';

/**
 * Canvas-based beat node
 */
interface BeatNode {
  percentage: number;
  x: number;
  y: number;
  radius: number;
  isActive: boolean;
  triggerTime: number;
  willBeRemoved: boolean;
}

const TWO_PI: number = Math.PI * 2;

export class BeaconView extends EventTarget {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private size: number = Config.DEFAULT_BEACON_RADIUS;
  private nodes: BeatNode[] = [];
  private nodeMap: Map<string, BeatNode> = new Map();
  private arm: ArmView;
  private lines: HTMLCanvasElement;
  private linesCtx: CanvasRenderingContext2D;
  private metronome: MetronomeModel | null = null;
  
  private draggingNode: BeatNode | null = null;
  private freshNode: boolean = false;
  private userEngaged: boolean = false;
  public progress: number = 0;

  private rotationalOffset: number = Math.PI * 1.5;
  private nodeRadius: number = 13;

  constructor(container: HTMLElement, radius: number = Config.DEFAULT_BEACON_RADIUS) {
    super();
    
    this.container = container;
    // Make circle smaller than canvas to allow dragging space
    this.size = radius * 0.85;

    // Create main canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = radius * 2;
    this.canvas.height = radius * 2;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.cursor = 'pointer';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;

    // Create lines canvas
    this.lines = document.createElement('canvas');
    this.lines.width = radius * 2;
    this.lines.height = radius * 2;
    this.lines.style.position = 'absolute';
    this.lines.style.left = '0';
    this.lines.style.top = '0';
    this.lines.style.pointerEvents = 'none';

    const linesCtx = this.lines.getContext('2d');
    if (!linesCtx) throw new Error('Failed to get lines context');
    this.linesCtx = linesCtx;

    // Create arm (pass full radius, not reduced size)
    this.arm = new ArmView(radius, Config.COLOUR_ARM, Config.COLOUR_NODE_ACTIVE);

    // Setup pointer event listeners (works with mouse, touch, and pen)
    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    document.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
    document.addEventListener('pointerup', this.onPointerUp.bind(this), { passive: false });

    // Add to container
    this.container.style.position = 'relative';
    this.container.style.width = radius * 2 + 'px';
    this.container.style.height = radius * 2 + 'px';
    this.container.appendChild(this.canvas);
    this.container.appendChild(this.lines);
    this.container.appendChild(this.arm.getElement());

    this.drawCircle();
    
    // Start animation loop for rendering nodes and feedback
    this.startAnimationLoop();
  }

  /**
   * Animation loop for node rendering and feedback
   */
  private startAnimationLoop(): void {
    const animate = () => {
      this.drawCircle();
      this.connectNodes(true);
      this.drawNodes();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  /**
   * Draw all nodes on canvas
   */
  private drawNodes(): void {
    const now = performance.now();
    const nodesToDraw = [...this.nodes];
    
    // Include dragging node if it exists
    if (this.draggingNode) {
      nodesToDraw.push(this.draggingNode);
    }
    
    if (nodesToDraw.length === 0) {
      console.warn(`[BeaconView.drawNodes] No nodes to draw!`);
    }
    
    for (const node of nodesToDraw) {
      // Check if feedback should still be showing
      if (node.isActive && now - node.triggerTime > 100) {
        node.isActive = false;
      }

      // Draw node circle
      let fillColor = Config.COLOUR_NODE;
      if (node.isActive) {
        fillColor = Config.COLOUR_NODE_ACTIVE;
      } else if (node.willBeRemoved) {
        fillColor = '#ff0000'; // Red when will be removed
      }
      
      if (isNaN(node.x) || isNaN(node.y)) {
        console.warn(`[BeaconView.drawNodes] Node has invalid coordinates!`, node);
      }
      
      this.ctx.fillStyle = fillColor;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, this.nodeRadius, 0, TWO_PI);
      this.ctx.fill();

      // Draw shadow
      this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  /**
   * Populate with beats from a metronome model
   */
  populate(model: MetronomeModel, clear: boolean = false): void {
    this.metronome = model;
    const beats = model.getBeats();

    if (clear) {
      this.empty();
    }

    for (const beat of beats) {
      this.addNode(beat);
    }

    this.connectNodes();
  }

  /**
   * Add a beat node (only adds to array if not a fresh node)
   */
  addNode(percentage: number, position: boolean = true, store: boolean = true): BeatNode {
    let x = 0;
    let y = 0;

    if (position) {
     const coords = this.getCanvasCoords(percentage, this.size);
     x = coords.x;
     y = coords.y;
    }

    const node: BeatNode = {
      percentage,
      x,
      y,
      radius: this.nodeRadius,
      isActive: false,
      triggerTime: 0,
      willBeRemoved: false
    };

    // Only add to array if not a fresh node (fresh nodes are added on finalize)
    if (!store) {
      // Fresh node - don't add yet
      return node;
    }

    this.nodes.push(node);

    if (store) {
      const key = percentage.toFixed(6);
      this.nodeMap.set(key, node);
    }

    this.sortBeats();

    return node;
  }

  /**
   * Finalize and add a beat node to the array
   */
  private finalizeNode(node: BeatNode): void {
    this.nodes.push(node);
    this.sortBeats();
  }

  /**
   * Remove a beat node
   */
  removeNode(node: BeatNode, sort: boolean = true): void {
    const index = this.nodes.indexOf(node);
    if (index > -1) {
      this.nodes.splice(index, 1);
    }

    const key = node.percentage.toFixed(6);
    this.nodeMap.delete(key);

    if (sort) {
      this.sortBeats();
    }
  }

  /**
   * Clear all nodes
   */
  empty(): void {
    while (this.nodes.length > 0) {
      const node = this.nodes.pop();
      if (node) {
        const key = node.percentage.toFixed(6);
        this.nodeMap.delete(key);
      }
    }
  }

  /**
   * Sort beats by percentage
   */
  private sortBeats(): void {
    this.nodes.sort((a, b) => a.percentage - b.percentage);
  }

  /**
   * Connect nodes with lines (on lines canvas)
   */
  private connectNodes(destination: boolean = true): void {
    this.linesCtx.clearRect(0, 0, this.lines.width, this.lines.height);

    if (this.nodes.length < 2) return;

    this.linesCtx.strokeStyle = Config.COLOUR_LINES;
    this.linesCtx.lineWidth = 3;
    this.linesCtx.fillStyle = colorWithAlpha(Config.COLOUR_SHAPES, Config.ALPHA_SHAPES);

    this.linesCtx.beginPath();

    let count = 0;
    for (const node of this.nodes) {
      // Nodes use x/y (container-relative)
      if (count === 0) {
        this.linesCtx.moveTo(node.x, node.y);
      } else {
        this.linesCtx.lineTo(node.x, node.y);
      }
      count++;
    }

    // Close path back to first node
    this.linesCtx.lineTo(this.nodes[0].x, this.nodes[0].y);
    this.linesCtx.fill();
    this.linesCtx.stroke();
  }

  /**
   * Update arm and progress
   */
  update(progress: number): void {
    this.arm.update(progress);
    this.progress = progress;
  }

  /**
   * Trigger a beat at a given percentage
   */
  beat(progress: number): void {

    // Find the closest beat node (within tolerance)
    const tolerance = 0.1;
    let closestNode = null;
    let closestDistance = Infinity;

    if (this.nodes.length === 0) {
      this.arm.trigger();
      this.progress = progress;
      return;
    }

    // Log all nodes and their distances
    const nodeDistances: Array<{percentage: number, distance: number}> = [];
    
    for (const node of this.nodes) {
      // Calculate distance accounting for circular wrap-around
      let distance = Math.abs(node.percentage - progress);
      if (distance > 0.5) {
        distance = 1.0 - distance;
      }
      
      nodeDistances.push({percentage: node.percentage, distance});
      
      if (distance < closestDistance) {
        closestDistance = distance;
        if (distance < tolerance) {
          closestNode = node;
        }
      }
    }

    // Log which node triggered (if any)
    if (closestNode) {
      console.log(`Progress ${progress.toFixed(3)}: Triggered node at ${closestNode.percentage.toFixed(3)} (distance: ${closestDistance.toFixed(4)})`);
      closestNode.isActive = true;
      closestNode.triggerTime = performance.now();
    } else if (nodeDistances.length > 0) {
      console.log(`Progress ${progress.toFixed(3)}: No node in tolerance. Closest: ${JSON.stringify(nodeDistances.map(n => ({p: n.percentage.toFixed(3), d: n.distance.toFixed(4)})))}`);
    }

    this.arm.trigger();
    this.progress = progress;
  }

  /**
   * Trigger on bar completion
   */
  bar(muted: boolean = false): void {
    if (muted) {
      this.arm.trigger();
    }
  }

  /**
   * Draw the background circle
   */
  private drawCircle(): void {
    const canvasSize = this.canvas.width / 2; // Original full radius for centering
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = Config.COLOUR_FOREGROUND;
    this.ctx.beginPath();
    this.ctx.arc(canvasSize, canvasSize, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Determine angle from cursor position (relative to center)
   * Maps: top = 0, right = 0.25, bottom = 0.5, left = 0.75
   */
  private determineRatioFromCursor(xco: number, yco: number): number {
    // Calculate angle using atan2 (handles all quadrants)
    let angle = Math.atan2(yco, xco); // Returns -π to π
    
    // Normalize to 0-2π
    if (angle < 0) {
      angle += TWO_PI;
    }
    
    // Rotate so 0 is at top (add π/2 to compensate for canvas Y-axis)
    angle += Math.PI / 2;
    if (angle >= TWO_PI) {
      angle -= TWO_PI;
    }
    
    // Convert to ratio (0-1)
    let ratio = angle / TWO_PI;
    
    // Clamp to valid range
    ratio = Math.max(0, Math.min(1, ratio));
    
    return ratio;
  }

  /**
   * Quantize percentage to common rhythm divisions
   */
  private quantize(percentage: number, factor: number = 2): number {
    const quantity = this.nodes.length * factor;
    const fraction = 1 / quantity;
    return Math.floor(percentage / fraction) * fraction;
  }

  /**
   * Calculate canvas coordinates from a ratio and distance from center
   */
  private getCanvasCoords(ratio: number, distance: number): { x: number; y: number } {
    const angle = (ratio * TWO_PI) - Math.PI / 2;
    const circleX = Math.cos(angle) * distance;
    const circleY = Math.sin(angle) * distance;
    const canvasCenter = this.canvas.width / 2;
    return {
      x: circleX + canvasCenter,
      y: circleY + canvasCenter
    };
  }

  /**
   * Pointer down handler (mouse, touch, or pen)
   */
  private onPointerDown(e: PointerEvent): void {
    this.userEngaged = true;

    // Get coordinates relative to canvas center
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const canvasCenter = this.canvas.width / 2;
    const x = canvasX - canvasCenter;
    const y = canvasY - canvasCenter;
    
    // Container-relative coordinates
    const containerX = canvasX;
    const containerY = canvasY;

    // Check if clicking on an existing node
    let existing: BeatNode | null = null;
    for (const node of this.nodes) {
      const dx = containerX - node.x;
      const dy = containerY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= this.nodeRadius) {
        existing = node;
        break;
      }
    }

    if (existing) {
      this.draggingNode = existing;
      this.freshNode = false;
    } else {
      // Calculate initial ratio from cursor position
      const ratio = this.determineRatioFromCursor(x, y);
      
      // Create new node at cursor position
      this.draggingNode = this.addNode(ratio, true, false);
      this.freshNode = true;
    }

    this.onPointerMove(e);
  }

  /**
   * Pointer move handler (dragging)
   */
  private onPointerMove(e: PointerEvent): void {
    if (!this.draggingNode || !this.userEngaged) return;

    const rect = this.canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const canvasCenter = this.canvas.width / 2;
    const x = canvasX - canvasCenter;
    const y = canvasY - canvasCenter;

    if (e.shiftKey || e.ctrlKey) {
      const distance = Math.sqrt(x * x + y * y);
      let ratio = this.determineRatioFromCursor(x, y);

      if (e.shiftKey && e.ctrlKey) {
        ratio = this.quantize(ratio, 1);
      } else if (e.ctrlKey) {
        ratio = this.quantize(ratio, 2);
      } else if (e.shiftKey) {
        ratio = this.quantize(ratio, 4);
      }

      // Position node at quantized location
      const coords = this.getCanvasCoords(ratio, distance);
      this.draggingNode.x = coords.x;
      this.draggingNode.y = coords.y;
      this.draggingNode.percentage = ratio;
    } else {
      // Free dragging
      const distance = Math.sqrt(x * x + y * y);
      const removalThreshold = this.size + 60;
      
      if (distance < this.size) {
        // Inside circle - constrain to circle
        const ratio = this.determineRatioFromCursor(x, y);
        this.draggingNode.percentage = ratio;
        
        const coords = this.getCanvasCoords(ratio, this.size);
        this.draggingNode.x = coords.x;
        this.draggingNode.y = coords.y;
        this.draggingNode.willBeRemoved = false;
      } else {
        // Outside circle - move freely with cursor
        this.draggingNode.x = canvasX;
        this.draggingNode.y = canvasY;
        
        // Set willBeRemoved flag if beyond removal threshold
        if (!this.freshNode && distance > removalThreshold) {
          this.draggingNode.willBeRemoved = true;
        } else {
          this.draggingNode.willBeRemoved = false;
        }
      }
    }

    if (!this.freshNode) {
      this.connectNodes();
    }
  }

  /**
   * Pointer up handler (release)
   */
  private onPointerUp(e: PointerEvent): void {
    if (!this.draggingNode) return;

    this.userEngaged = false;

    const rect = this.canvas.getBoundingClientRect();
    const canvasCenter = this.canvas.width / 2;
    const x = e.clientX - rect.left - canvasCenter;
    const y = e.clientY - rect.top - canvasCenter;

    const distance = Math.sqrt(x * x + y * y);
    let ratio = this.draggingNode.percentage;

    // Check if dragged far outside the circle - if so, remove
    const removalThreshold = this.size + 60;
    console.log(`[BeaconView.onPointerUp] distance: ${distance}, threshold: ${removalThreshold}, isFreshNode: ${this.freshNode}, nodePercentage: ${ratio}`);
    if (!this.freshNode && distance > removalThreshold) {
      console.log(`[BeaconView.onPointerUp] REMOVING NODE - distance exceeded threshold`);
      this.removeNode(this.draggingNode);
      this.dispatchEvent(new BeaconEvent(BeaconEvent.REMOVE_BEAT_REQUESTED, ratio));
      this.connectNodes();
      this.draggingNode = null;
      return;
    }
    console.log(`[BeaconView.onPointerUp] Node will be REPOSITIONED, not removed`);
    console.log(`[BeaconView.onPointerUp] Node is in array at index:`, this.nodes.indexOf(this.draggingNode));
    
    // For fresh nodes, calculate ratio from cursor
    // For existing nodes, ratio was already updated during onPointerMove
    if (this.freshNode) {
      // Calculate initial ratio from cursor position
      ratio = this.determineRatioFromCursor(x, y);
      
      // Apply quantization
      if (e.shiftKey && e.ctrlKey) {
        ratio = this.quantize(ratio, 1);
      } else if (e.ctrlKey) {
        ratio = this.quantize(ratio, 2);
      } else if (e.shiftKey) {
        ratio = this.quantize(ratio, 4);
      }
    } else {
      // Existing node - use ratio already set during drag
      ratio = this.draggingNode.percentage;
    }

    // Emit event and update map
    if (this.freshNode) {
      // For new nodes, add to array and map
      const coords = this.getCanvasCoords(ratio, this.size);
      this.draggingNode.x = coords.x;
      this.draggingNode.y = coords.y;
      this.draggingNode.percentage = ratio;
      
      this.finalizeNode(this.draggingNode);
      const key = ratio.toFixed(6);
      this.nodeMap.set(key, this.draggingNode);
      this.dispatchEvent(new BeaconEvent(BeaconEvent.NEW_BEAT_REQUESTED, ratio));
    } else {
      // For existing nodes, check if position actually changed
      const oldRatio = this.draggingNode.percentage;
      
      // Position may have already been updated during drag, but check for change
      if (Math.abs(ratio - oldRatio) > 0.001) {
        // Position changed - update map and emit event
        const oldKey = oldRatio.toFixed(6);
        const newKey = ratio.toFixed(6);
        this.nodeMap.delete(oldKey);
        this.nodeMap.set(newKey, this.draggingNode);
        this.dispatchEvent(new BeaconEvent(BeaconEvent.REPOSITION_REQUESTED, ratio, oldRatio));
      }
    }

    this.draggingNode = null;
    console.log(`[BeaconView.onPointerUp] Complete. Total nodes in array:`, this.nodes.length);
    
    // Clear willBeRemoved flag on all nodes
    for (const node of this.nodes) {
      node.willBeRemoved = false;
    }
    
    this.connectNodes();
  }

  /**
   * Set canvas size
   */
  setSize(width: number, height: number): number {
    const radius = Math.min(width, height) / 2;
    this.canvas.width = width;
    this.canvas.height = height;
    this.lines.width = width;
    this.lines.height = height;
    this.arm.setSize(width, height);
    
    // Update size first, then reposition nodes
    this.size = radius * 0.85;
    
    for (const node of this.nodes) {
      const coords = this.getCanvasCoords(node.percentage, this.size);
      node.x = coords.x;
      node.y = coords.y;
    }
    this.drawCircle();
    this.connectNodes();
    return radius;
  }
}
