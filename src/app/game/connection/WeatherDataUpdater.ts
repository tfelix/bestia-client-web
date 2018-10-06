import { EngineContext } from 'app/game/engine';
import { WeatherMessage } from 'app/game/message';

import { Topics } from './Topics';

export class WeatherDataUpdater {
  constructor(
    private readonly ctx: EngineContext
  ) {

    PubSub.subscribe(Topics.IO_RECV_WEATHER_MSG, (_, msg) => this.onWeatherUpdateMessage(msg));
  }

  private onWeatherUpdateMessage(msg: WeatherMessage) {
    this.ctx.data.weather = msg.payload;
  }
}
