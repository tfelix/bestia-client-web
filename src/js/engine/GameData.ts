export class GameData {
  public uiModal: string[] = [];
  public dayProgress: 0.1;
  public weather = {
    rain: 1,
    sun: 1,
    lightning: 0,
    thunder: {
      intensity: 0,
      distance: 0
    },
    brightness: 1
  };
}
