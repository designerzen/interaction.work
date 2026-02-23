/**
 * AudioService - Manages audio playback with gain control
 * Loads audio manifest and handles playback of audio assets
 */

import audioManifest from '../assets/audio-manifest.json';
import click00 from '../assets/click_00.wav';
import click01 from '../assets/click_01.wav';
import click02 from '../assets/click_02.wav';
import click03 from '../assets/click_03.wav';
import click04 from '../assets/click_04.wav';
import click05 from '../assets/click_05.wav';
import click06 from '../assets/click_06.wav';
import click07 from '../assets/click_07.wav';
import click08 from '../assets/click_08.wav';
import click09 from '../assets/click_09.wav';
import click10 from '../assets/click_10.wav';
import click11 from '../assets/click_11.wav';
import korgIn from '../assets/korg_in.wav';

interface AudioAsset {
  id: string;
  name: string;
  path: string;
}

interface AudioManifest {
  version: string;
  assets: AudioAsset[];
}

// Map of asset IDs to imported audio URLs
const audioUrlMap: Record<string, string> = {
  click_00: click00,
  click_01: click01,
  click_02: click02,
  click_03: click03,
  click_04: click04,
  click_05: click05,
  click_06: click06,
  click_07: click07,
  click_08: click08,
  click_09: click09,
  click_10: click10,
  click_11: click11,
  korg_in: korgIn,
};

export class AudioService {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private manifest: AudioManifest | null = null;
  private currentAudioAssetId: string | null = null;
  private isLoaded: boolean = false;

  constructor() {
    // Create audio context on first user interaction if needed
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.3; // Default volume at 30%
  }

  /**
   * Load the audio manifest (assets are lazy-loaded on selection)
   */
  async loadManifest(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Use imported manifest
      this.manifest = audioManifest as AudioManifest;
      console.log('Manifest loaded:', this.manifest);
      console.log('Audio files will be loaded on-demand when selected');
      
      this.isLoaded = true;
      console.log('Audio manifest fully loaded');
    } catch (error) {
      console.error('Error loading audio manifest:', error);
      throw error;
    }
  }

  /**
   * Load a single audio file and cache it
   */
  private async loadAudioFile(id: string): Promise<void> {
    if (this.audioCache.has(id)) {
      console.log(`Asset already cached: ${id}`);
      return;
    }

    try {
      // Get the URL from the map
      const audioUrl = audioUrlMap[id];
      if (!audioUrl) {
        throw new Error(`No audio URL found for asset: ${id}`);
      }

      console.log(`Loading audio file: ${id} from ${audioUrl}`);
      
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error(`Failed to load audio file: ${id} (${response.status})`);
      
      const arrayBuffer = await response.arrayBuffer();
      console.log(`Decoding audio: ${id} (${arrayBuffer.byteLength} bytes)`);
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error(`Received empty ArrayBuffer for ${id}`);
      }
      
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.audioCache.set(id, audioBuffer);
      console.log(`Successfully cached audio: ${id} (${audioBuffer.length} samples, ${audioBuffer.duration}s)`);
    } catch (error) {
      console.error(`Error loading audio file ${id}:`, error);
      throw error;
    }
  }

  /**
   * Play audio asset by ID (lazy loads if not cached)
   */
  async play(assetId: string | null): Promise<void> {
    if (!assetId || assetId === 'none') {
      console.log('No audio asset selected');
      this.currentAudioAssetId = null;
      return;
    }

    try {
      console.log(`Attempting to play: ${assetId}`);

      // Load the file if not already cached
      if (!this.audioCache.has(assetId)) {
        console.log(`Loading audio file on-demand: ${assetId}`);
        await this.loadAudioFile(assetId);
      }

      const audioBuffer = this.audioCache.get(assetId);
      if (!audioBuffer) {
        console.warn(`Audio asset not found in cache: ${assetId}`);
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);
      source.start(0);
      this.currentAudioAssetId = assetId;
      console.log(`Successfully played: ${assetId}`);
    } catch (error) {
      console.error(`Error playing audio asset ${assetId}:`, error);
    }
  }

  /**
   * Get current volume (0.0 to 1.0)
   */
  get volume(): number {
    return this.gainNode.gain.value;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  set volume(volume: number) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = clampedVolume;
  }

  /**
   * Get all available audio assets
   */
  get assets(): AudioAsset[] {
    return this.manifest?.assets || [];
  }

  /**
   * Get currently selected audio asset ID
   */
  get currentAssetId(): string | null {
    return this.currentAudioAssetId;
  }

  /**
   * Check if service is loaded
   */
  get isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Resume audio context if suspended
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

// Singleton instance
let audioServiceInstance: AudioService | null = null;

export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}
