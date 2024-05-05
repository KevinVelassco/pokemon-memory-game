export interface GameSettings {
  rows: number;
  columns: number;
  numberOfLives: number;
  victoriesWithoutLosing?: number;
  blackImage?: boolean;
}
