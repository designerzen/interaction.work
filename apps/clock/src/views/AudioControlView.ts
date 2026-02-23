/**
 * AudioControlView - Audio asset selector and volume control
 */

import { getAudioService } from '../services/AudioService';

export class AudioControlView extends EventTarget {
  private container: HTMLElement;
  private selectElement: HTMLSelectElement;
  private volumeSlider: HTMLInputElement;
  private volumeLabel: HTMLElement;

  
  /**
   * Get currently selected audio asset ID
   */
  get selectedAssetId(): string | null {
    const value = this.selectElement.value;
    return value === 'none' ? null : value;
  }

  /**
   * Set selected audio asset
   */
  set selectedAssetId(assetId: string | null) {
    this.selectElement.value = assetId || 'none';
  }

  /**
   * Get current volume (0-1)
   */
  get volume(): number {
    return parseInt(this.volumeSlider.value) / 100;
  }

  /**
   * Set volume (0-1)
   */
  set volume(volume: number) {
    const percentage = Math.round(volume * 100);
    this.volumeSlider.value = String(percentage);
    this.volumeLabel.textContent = percentage + '%';
  }

  
  constructor(container: HTMLElement) {
    super();
    this.container = container;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '16px';
    wrapper.style.backgroundColor = '#f5f5f5';
    wrapper.style.borderRadius = '4px';
    wrapper.style.marginBottom = '20px';

    // Audio asset selector
    const selectLabel = document.createElement('label');
    selectLabel.textContent = 'Click Sound:';
    selectLabel.style.fontWeight = 'bold';
    selectLabel.style.fontSize = '14px';

    this.selectElement = document.createElement('select');
    this.selectElement.style.padding = '8px';
    this.selectElement.style.borderRadius = '4px';
    this.selectElement.style.border = '1px solid #ccc';
    this.selectElement.style.fontFamily = 'inherit';
    this.selectElement.addEventListener('change', () => this.onAudioAssetSelected());

    // Volume control
    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = 'Volume:';
    volumeLabel.style.fontWeight = 'bold';
    volumeLabel.style.fontSize = '14px';

    const volumeContainer = document.createElement('div');
    volumeContainer.style.display = 'flex';
    volumeContainer.style.gap = '12px';
    volumeContainer.style.alignItems = 'center';

    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.value = '30';
    this.volumeSlider.style.flex = '1';
    this.volumeSlider.addEventListener('input', () => this.onVolumeChanged());

    this.volumeLabel = document.createElement('span');
    this.volumeLabel.textContent = '30%';
    this.volumeLabel.style.minWidth = '40px';
    this.volumeLabel.style.textAlign = 'right';
    this.volumeLabel.style.fontSize = '13px';

    volumeContainer.appendChild(this.volumeSlider);
    volumeContainer.appendChild(this.volumeLabel);

    // Assemble
    wrapper.appendChild(selectLabel);
    wrapper.appendChild(this.selectElement);
    wrapper.appendChild(volumeLabel);
    wrapper.appendChild(volumeContainer);

    this.container.appendChild(wrapper);
  }

  /**
   * Populate audio asset options
   */
  async populate(): Promise<void> {
    const audioService = getAudioService();
    
    try {
      // Load manifest if not already loaded
      if (!audioService.isReady) {
        console.log('Loading audio manifest...');
        await audioService.loadManifest();
        console.log('Manifest loaded successfully');
      }

      // Clear existing options
      this.selectElement.innerHTML = '';

      // Add "no click" option
      const noneOption = document.createElement('option');
      noneOption.value = 'none';
      noneOption.textContent = '— No Click —';
      this.selectElement.appendChild(noneOption);

      // Add audio assets
      const assets = audioService.assets;
      console.log('Audio assets:', assets);
      if (assets.length === 0) {
        console.warn('No audio assets found in manifest');
        const emptyOption = document.createElement('option');
        emptyOption.textContent = 'No audio assets available';
        emptyOption.disabled = true;
        this.selectElement.appendChild(emptyOption);
      } else {
        for (const asset of assets) {
          const option = document.createElement('option');
          option.value = asset.id;
          option.textContent = asset.name;
          this.selectElement.appendChild(option);
        }
      }

      this.selectElement.value = 'none';
    } catch (error) {
      console.error('Error populating audio controls:', error);
      const errorOption = document.createElement('option');
      errorOption.textContent = 'Error loading audio assets';
      errorOption.disabled = true;
      this.selectElement.appendChild(errorOption);
    }
  }

  /**
   * Handle audio asset selection
   */
  private async onAudioAssetSelected(): Promise<void> {
    const audioService = getAudioService();
    const selectedId = this.selectElement.value === 'none' ? null : this.selectElement.value;
    try {
      await audioService.resumeContext();
      await audioService.play(selectedId);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  /**
   * Handle volume change
   */
  private onVolumeChanged(): void {
    const audioService = getAudioService();
    const volume = parseInt(this.volumeSlider.value) / 100;
    audioService.volume = volume;
    this.volumeLabel.textContent = this.volumeSlider.value + '%';
  }

  /**
   * Get the container element
   */
  getElement(): HTMLElement {
    return this.container;
  }
}
