/**
 * PresetsPanel - Shows classic timing pattern presets with thumbnail previews
 */

import { getAllPresets, type TimingPreset } from '../models/TimingPresets';
import { PresetThumbnailGenerator } from '../utils/PresetThumbnailGenerator';

export class PresetsPanel extends EventTarget {
  static readonly PRESET_SELECTED = 'presetSelected';

  private container: HTMLElement;
  private presetGrid: HTMLElement;
  private selectedPresetId: string | null = null;

  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.presetGrid = document.createElement('div');

    this.setupPanel();
    this.populatePresets();
  }

  /**
   * Setup the panel structure and styles
   */
  private setupPanel(): void {
    // Main container
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '16px';
    wrapper.style.backgroundColor = '#f5f5f5';
    wrapper.style.borderRadius = '4px';
    wrapper.style.marginBottom = '20px';

    // Title
    const title = document.createElement('h3');
    title.textContent = 'Timing Presets';
    title.style.margin = '0 0 8px 0';
    title.style.fontSize = '14px';
    title.style.fontWeight = 'bold';
    title.style.color = '#333';

    // Grid container
    this.presetGrid.style.display = 'grid';
    this.presetGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    this.presetGrid.style.gap = '12px';

    wrapper.appendChild(title);
    wrapper.appendChild(this.presetGrid);
    this.container.appendChild(wrapper);
  }

  /**
   * Populate the grid with preset cards
   */
  private populatePresets(): void {
    const presets = getAllPresets();

    presets.forEach((preset) => {
      const card = this.createPresetCard(preset);
      this.presetGrid.appendChild(card);
    });
  }

  /**
   * Create a preset card with thumbnail
   */
  private createPresetCard(preset: TimingPreset): HTMLElement {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '8px';
    card.style.padding = '8px';
    card.style.border = '2px solid transparent';
    card.style.borderRadius = '4px';
    card.style.backgroundColor = '#fff';
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.2s ease';
    card.setAttribute('data-preset-id', preset.id);

    // Hover effect
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = '#4ecdc4';
      card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      card.style.transform = 'translateY(-2px)';
    });

    card.addEventListener('mouseleave', () => {
      if (this.selectedPresetId !== preset.id) {
        card.style.borderColor = 'transparent';
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
      }
    });

    // Click handler
    card.addEventListener('click', () => {
      this.selectPreset(preset, card);
    });

    // Thumbnail
    const thumbnail = document.createElement('img');
    const canvas = PresetThumbnailGenerator.generateThumbnail(
      {
        name: preset.name,
        beats: preset.beats,
        bpm: preset.bpm,
      },
      120,
      120
    );
    thumbnail.src = PresetThumbnailGenerator.canvasToDataUrl(canvas);
    thumbnail.style.width = '100%';
    thumbnail.style.height = 'auto';
    thumbnail.style.borderRadius = '2px';
    thumbnail.style.display = 'block';

    // Name
    const name = document.createElement('div');
    name.textContent = preset.name;
    name.style.fontWeight = 'bold';
    name.style.fontSize = '13px';
    name.style.textAlign = 'center';
    name.style.color = '#333';

    // Description
    const description = document.createElement('div');
    description.textContent = preset.description;
    description.style.fontSize = '11px';
    description.style.color = '#666';
    description.style.textAlign = 'center';
    description.style.lineHeight = '1.3';

    card.appendChild(thumbnail);
    card.appendChild(name);
    card.appendChild(description);

    return card;
  }

  /**
   * Select a preset and dispatch event
   */
  private selectPreset(preset: TimingPreset, card: HTMLElement): void {
    // Clear previous selection
    const previousSelected = this.presetGrid.querySelector('[data-selected="true"]') as HTMLElement;
    if (previousSelected) {
      previousSelected.removeAttribute('data-selected');
      previousSelected.style.borderColor = 'transparent';
      previousSelected.style.backgroundColor = '#fff';
    }

    // Mark as selected
    this.selectedPresetId = preset.id;
    card.setAttribute('data-selected', 'true');
    card.style.borderColor = '#ff6b6b';
    card.style.backgroundColor = '#fff5f5';

    // Dispatch event
    const event = new CustomEvent(PresetsPanel.PRESET_SELECTED, {
      detail: { preset },
    });
    this.dispatchEvent(event);
  }

  /**
   * Get the selected preset ID
   */
  getSelectedPresetId(): string | null {
    return this.selectedPresetId;
  }
}
