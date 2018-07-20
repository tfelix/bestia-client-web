export class GameData {
  public uiModal: string[] = [];
  public weather = {
    rain: 0,
    sun: 1,
    lightning: 0,
    thunder: {
      intensity: 0,
      distance: 0
    },
    brightness: 0
  };
}
