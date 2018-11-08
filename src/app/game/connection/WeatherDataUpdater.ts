import { EngineContext } from 'app/game/engine';
import { WeatherMessage, EngineEvents } from 'app/game/message';

export class WeatherDataUpdater {
  constructor(
    private readonly ctx: EngineContext
  ) {

    PubSub.subscribe(EngineEvents.IO_RECV_WEATHER_MSG, (_, msg) => this.onWeatherUpdateMessage(msg));
  }

  private onWeatherUpdateMessage(msg: WeatherMessage) {
    this.ctx.data.weather = msg.payload;
  }
}
