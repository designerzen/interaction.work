
/**
 * CuePoint - A timestamp and its associated beat percentage
 */
export class CuePoint {
  timestamp: number;
  percentage: number;

  constructor(timestamp: number, percentage: number) {
    this.timestamp = timestamp;
    this.percentage = percentage;
  }
}