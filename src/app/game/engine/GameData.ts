export interface WeatherData {
  rainIntensity: number;
  sunBrigthness: number;
  lightningIntensity: number;
  thunderIntensity: number;
  thunderDistanceM: number;
}

export interface TileMapData {
  map: Phaser.Tilemaps.Tilemap;
  layers: Array<Phaser.Tilemaps.StaticTilemapLayer>;
}

export class GameData {
  public uiModal: string[] = [];
  public dayProgress: 0.1;
  public tilemap: TileMapData;
  public weather: WeatherData = {
    rainIntensity: 0,
    sunBrigthness: 1,
    lightningIntensity: 0,
    thunderIntensity: 0,
    thunderDistanceM: 0
  };
}
