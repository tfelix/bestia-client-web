export interface WeatherData {
  rainIntensity: number;
  sunBrigthness: number;
  lightningIntensity: number;
  thunderIntensity: number;
  thunderDistanceM: number;
}

export class GameData {
  public uiModal: string[] = [];
  public dayProgress: 0.1;
  public weather: WeatherData = {
    rainIntensity: 0,
    sunBrigthness: 1,
    lightningIntensity: 0,
    thunderIntensity: 0,
    thunderDistanceM: 0
  };
}
