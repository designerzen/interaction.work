/**
 * MetronomeEvent - Custom event extending native Event with progress data
 */

export class MetronomeEvent extends Event {
  static readonly PROGRESS = 'metronome-progress';
  static readonly PATTERN_UPDATE = 'metronome-patternUpdate';
  static readonly EVERY_BAR = 'metronome-everyBar';
  static readonly EVERY_BEAT = 'metronome-everyBeat';

  readonly progress: number;

  constructor(type: string, progress: number, options?: EventInit) {
    super(type, options);
    this.progress = progress;
  }
}
