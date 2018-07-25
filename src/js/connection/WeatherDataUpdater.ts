import { EngineContext } from 'engine';
import { WeatherMessage } from 'message/WeatherDataMessage';

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
