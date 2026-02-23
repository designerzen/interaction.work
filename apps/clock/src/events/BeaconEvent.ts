/**
 * BeaconEvent - Custom event for beat node interactions
 */

export class BeaconEvent extends Event {
  static readonly NEW_BEAT_REQUESTED = 'beacon-newBeatRequested';
  static readonly REMOVE_BEAT_REQUESTED = 'beacon-removeBeatRequested';
  static readonly REPOSITION_REQUESTED = 'beacon-repositionRequested';

  readonly value?: number;
  readonly original?: number;

  constructor(type: string, value?: number, original?: number) {
    super(type);
    this.value = value;
    this.original = original;
  }
}
