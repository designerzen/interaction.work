/**
 * App - Main application controller
 */

import { MetronomeModel } from './models/MetronomeModel';
import { BeaconView } from './views/BeaconView';
import { getAudioService } from './services/AudioService';
import { MetronomeEvent } from './events/MetronomeEvent';
import { BeaconEvent } from './events/BeaconEvent';

export class App {
  
  private metronome: MetronomeModel;
  private beacon: BeaconView;
  private container: HTMLElement;
  private isPlaying: boolean = false;

  constructor(containerId: string = 'app') {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }
    this.container = container;

    // Create beacon container (for canvas-based visualization)
    const beaconContainer = document.createElement('div');
    beaconContainer.style.width = '100%';
    beaconContainer.style.height = '100%';
    container.appendChild(beaconContainer);

    // Initialize models and views
    this.metronome = new MetronomeModel();
    this.beacon = new BeaconView(beaconContainer, 400);
    
    // Audio control and presets are now in HTML
    // No need to create them dynamically here

    // Wire up events
    this.setupEventListeners();

    // Initialize audio service
    this.initializeAudio();

    // Start with a default beat pattern
    this.setDefaultBeats();
  }

  /**
   * Initialize audio service
   * Audio controls are now handled in HTML/index.html
   */
  private async initializeAudio(): Promise<void> {
    try {
      const audioService = getAudioService();
      await audioService.loadManifest();
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  /**
   * Setup event listeners between model and view
   */
  private setupEventListeners(): void {
    
    this.metronome.addEventListener(MetronomeEvent.PROGRESS, (e: Event) => {
      const event = e as MetronomeEvent;
      this.beacon.update(event.progress);
    });

    this.metronome.addEventListener(MetronomeEvent.EVERY_BEAT, (e: Event) => {
      const event = e as MetronomeEvent;
      this.beacon.beat(event.progress);
      this.onBeat(event.progress);
    });

    this.metronome.addEventListener(MetronomeEvent.EVERY_BAR, (e: Event) => {
      const event = e as MetronomeEvent;
      this.beacon.bar();
      this.onBar();
    });

    // Beacon view events (using native EventTarget API)
    this.beacon.addEventListener(BeaconEvent.NEW_BEAT_REQUESTED, (e: Event) => {
      const event = e as BeaconEvent;
      if (event.value !== undefined) {
        this.metronome.addBeat(event.value, true);
      }
    });

    this.beacon.addEventListener(BeaconEvent.REMOVE_BEAT_REQUESTED, (e: Event) => {
      const event = e as BeaconEvent;
      if (event.value !== undefined) {
        console.log(`[App] REMOVE_BEAT_REQUESTED fired with value:`, event.value);
        console.log(`[App] Beats before removal:`, this.metronome.getBeats());
        this.metronome.removeBeat(event.value, true);
        console.log(`[App] Beats after removal:`, this.metronome.getBeats());
      }
    });

    this.beacon.addEventListener(BeaconEvent.REPOSITION_REQUESTED, (e: Event) => {
      const event = e as BeaconEvent;
      if (event.original !== undefined && event.value !== undefined) {
        this.metronome.updateBeat(event.original, event.value, true);
      }
    });

    // Presets are now handled in HTML/index.html
  }

  /**
   * Set default beat pattern (4/4)
   */
  private setDefaultBeats(): void {
    this.metronome.addBeat(0);      // Beat 1
    this.metronome.addBeat(0.25);   // Beat 2
    this.metronome.addBeat(0.5);    // Beat 3
    this.metronome.addBeat(0.75);   // Beat 4
    
    this.beacon.populate(this.metronome, true);
  }

  /**
   * Apply a timing preset
   */
  private applyPreset(preset: any): void {
    // Clear existing beats
    this.metronome.empty();
    
    // Add preset beats
    for (const beat of preset.beats) {
      this.metronome.addBeat(beat);
    }
    
    // Set BPM
    this.metronome.bpm = preset.bpm;
    
    // Update beacon visualization
    this.beacon.populate(this.metronome, true);
    
    console.log(`Applied preset: ${preset.name} (${preset.bpm} BPM)`);
  }

  /**
   * Start the metronome
   */
  start(): void {
    if (!this.isPlaying) {
      this.metronome.start();
      this.isPlaying = true;
    }
  }

  /**
   * Stop the metronome
   */
  stop(): void {
    if (this.isPlaying) {
      this.metronome.stop();
      this.isPlaying = false;
    }
  }

  /**
   * Toggle play/stop
   */
  toggle(): void {
    this.isPlaying ? this.stop() : this.start();
  }

  /**
   * Set BPM
   */
  setBPM(bpm: number): void {
    this.metronome.bpm = bpm;
  }

  /**
   * Get BPM
   */
  getBPM(): number {
    return this.metronome.bpm;
  }

  /**
   * Load settings from URL query string
   */
  loadSettings(query: string): void {
    this.metronome.loadSettings(query, true);
    this.beacon.populate(this.metronome, true);
  }

  /**
   * Get current settings as query string
   */
  getSettings(): string {
    return this.metronome.fetchSettings();
  }

  /**
   * Called on each beat
   */
  private async onBeat(progress: number): Promise<void> {
    const audioService = getAudioService();
    // Get selected audio from HTML form
    const clickSoundSelect = document.getElementById('clickSound') as HTMLSelectElement;
    const selectedAssetId = clickSoundSelect?.value === 'none' ? null : clickSoundSelect?.value;
    
    if (selectedAssetId) {
      try {
        await audioService.resumeContext();
        await audioService.play(selectedAssetId);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    console.log('Beat at', Math.round(progress * 100) + '%');
  }

  /**
   * Called on bar completion
   */
  private onBar(): void {
    // Trigger visual feedback here
    console.log('Bar completed');
  }

  /**
   * Resize handler
   */
  handleResize(width: number, height: number): void {
    this.beacon.setSize(width, height);
  }

  /**
   * Get metronome model
   */
  getMetronome(): MetronomeModel {
    return this.metronome;
  }

  /**
   * Get beacon view
   */
  getBeacon(): BeaconView {
    return this.beacon;
  }
}
