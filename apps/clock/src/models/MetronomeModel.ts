/**
 * MetronomeModel - Core timing engine for the metronome
 * Manages beats as percentages of a bar and dispatches timing events
 */
import { MetronomeEvent } from '../events/MetronomeEvent';
import { CuePoint } from './CuePoint';

export class MetronomeModel extends EventTarget {
  // Start all metronomes from the same point in time
  static readonly EPOCH = new Date(2012, 11, 21, 0, 0, 0).getTime();

  private timer: number | null = null;
  private period: number = 6000; // Duration of one bar in milliseconds
  private beats: number[] = [];
  private cuePoints: CuePoint[] = [];
  private lastBarTimeStamp: number = 0;
  private timeAppStarted: number = performance.timeOrigin;
  private beatsCompleted: boolean = false;

  /**
   * Get the number of beats
   */
  get quantity(): number {
    return this.beats.length;
  }

  /**
   * Get/set BPM (beats per minute)
   */
  get bpm(): number {
    return Math.floor(60 / (this.period * 0.001));
  }

  set bpm(beatsPerMinute: number) {
    if (beatsPerMinute < 1) return;
    const seconds = 60 / beatsPerMinute;
    this.period = seconds * 1000;
    this.lastBarTimeStamp = this.determineStartTime();
    this.refresh();
  }

  constructor() {
    super();
  }

  /**
   * Get current time relative to application start
   */
  private getNow(): number {
    return performance.now() + this.timeAppStarted;
  }

  /**
   * Start the metronome
   */
  public start(): void {
    const now = Date.now();
    this.timeAppStarted = now - performance.now();

    this.lastBarTimeStamp = this.determineStartTime();
    
    if (this.cuePoints.length < 1) {
      this.refresh();
    }

    // Start the timer loop
    this.startTimerLoop();
  }

  /**
   * Stop the metronome
   */
  public stop(): void {
    if (this.timer !== null) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
  }

  /**
   * Load settings from a URL-style string
   * Format: ?p=6000&b=0,0.25,0.5,0.75
   */
  public loadSettings(settings: string, clear: boolean = false): void {
    let queryString = settings;
    
    if (settings.startsWith('?')) {
      queryString = settings.substring(1);
    }

    if (clear) {
      this.empty();
    }

    const queries = queryString.split('&');
    
    for (const query of queries) {
      const [key, value] = query.split('=');
      
      switch (key.toLowerCase()) {
        case 'p':
          this.period = parseFloat(value);
          break;
        case 'b':
          const entries = value.split(',');
          for (const beat of entries) {
            this.beats.push(parseFloat(beat));
          }
          this.beats.sort(this.sortBeats);
          this.refresh();
          break;
      }
    }
  }

  /**
   * Export settings as a URL-style string
   */
  public fetchSettings(): string {
    let settings = '?';
    settings += 'p=' + this.period;
    settings += '&b=' + this.beats.join(',');
    return settings;
  }

  /**
   * Add a beat at a given percentage of the bar
   */
  public addBeat(percentage: number, forceRefresh: boolean = false): void {
    this.beats.push(percentage);
    this.beats.sort(this.sortBeats);
    if (forceRefresh) this.refresh();
  }

  /**
   * Remove a beat by its percentage value
   */
  public removeBeat(percentage: number, forceRefresh: boolean = false): void {
    // Use fuzzy matching for floating point comparison
    console.log(`removeBeat attempting to remove ${percentage}, current beats:`, this.beats);
    const index = this.beats.findIndex(beat => Math.abs(beat - percentage) < 0.0001);
    console.log(`removeBeat found at index: ${index}`);
    if (index > -1) {
      this.beats.splice(index, 1);
      console.log(`Beat removed, beats now:`, this.beats);
      if (forceRefresh) {
        this.refresh();
        console.log(`After refresh, cuePoints:`, this.cuePoints.length, this.cuePoints.map(cp => cp.percentage));
      }
    } else {
      console.warn(`removeBeat failed to find beat matching ${percentage}`);
    }
  }

  /**
   * Update an existing beat's position
   */
  public updateBeat(original: number, percentage: number, forceRefresh: boolean = false): void {
    // Use fuzzy matching for floating point comparison
    const index = this.beats.findIndex(beat => Math.abs(beat - original) < 0.0001);
    if (index > -1) {
      this.beats[index] = percentage;
      this.beats.sort(this.sortBeats);
    }
    if (forceRefresh) this.refresh();
  }

  /**
   * Clear all beats and cue points
   */
  empty(): void {
    this.beats = [];
    this.cuePoints = [];
  }

  /**
   * Clone this metronome model
   */
  clone(): MetronomeModel {
    const snapshot = new MetronomeModel();
    snapshot.loadSettings(this.fetchSettings());
    return snapshot;
  }

  /**
   * Get all beats as an array
   */
  getBeats(): number[] {
    return [...this.beats];
  }

  /**
   * Determine the start time for synchronization
   */
  private determineStartTime(): number {
    const now = this.getNow();
    const timeSinceEpoch = now - MetronomeModel.EPOCH;
    const elapsed = timeSinceEpoch % this.period;
    const lastTick = now - elapsed;
    return lastTick;
  }

  /**
   * Sort beats comparator function
   */
  private sortBeats = (x: number, y: number): number => {
    return x < y ? -1 : x > y ? 1 : 0;
  };

  /**
   * Refresh cue points for the current bar
   */
  private refresh(): void {
    this.updateCuePoints(this.lastBarTimeStamp);
  }

  /**
   * Update cue points for a given timestamp
   */
  private updateCuePoints(timeStamp: number): void {
    this.cuePoints = this.createCuePoints(timeStamp);
  }

  /**
   * Create cue points for a given timestamp
   */
  private createCuePoints(timeStamp: number, now: number = -1): CuePoint[] {
    const points: CuePoint[] = [];
    const factor = 4;
    
    if (now < 0) {
      now = this.getNow() - factor;
    }

    for (const beat of this.beats) {
      const point = this.createCuePoint(timeStamp, beat);
      if (point.timestamp >= now) {
        points.push(point);
      }
    }

    return points;
  }

  /**
   * Create a single cue point
   */
  private createCuePoint(timeStamp: number, percentage: number): CuePoint {
    return new CuePoint(timeStamp + percentage * this.period, percentage);
  }

  /**
   * Increment to next bar's cue points
   */
  private incrementCuePoints(now: number = -1): void {
    this.lastBarTimeStamp += this.period;
    this.cuePoints = this.createCuePoints(this.lastBarTimeStamp, 0);
  }

  /**
   * Main timer loop - runs on requestAnimationFrame
   */
  private startTimerLoop(): void {
    const loop = () => {
      this.onTimer();
      this.timer = requestAnimationFrame(loop);
    };
    this.timer = requestAnimationFrame(loop);
  }

  /**
   * Timer tick handler
   */
  private onTimer(): void {
    const time = this.getNow();
    const elapsed = time - this.lastBarTimeStamp;
    let progress = elapsed / this.period;
    const barOccurred = elapsed >= this.period;

    // Handle all cue points that have been reached (prevents rapid repeats)
    while (this.cuePoints.length > 0 && time >= this.cuePoints[0].timestamp) {
      const cuePoint = this.cuePoints.shift()!;
      progress = cuePoint.percentage;
      this.dispatchEvent(new MetronomeEvent(MetronomeEvent.EVERY_BEAT, progress));
    }

    // Dispatch progress event
    this.dispatchEvent(new MetronomeEvent(MetronomeEvent.PROGRESS, progress));

    // Check if bar has completed
    if (barOccurred && this.cuePoints.length === 0) {
      this.incrementCuePoints(time);
      // Recalculate progress after incrementing cue points
      const newElapsed = this.getNow() - this.lastBarTimeStamp;
      progress = newElapsed / this.period;
      this.dispatchEvent(new MetronomeEvent(MetronomeEvent.EVERY_BAR, progress));
    }
  }
}
