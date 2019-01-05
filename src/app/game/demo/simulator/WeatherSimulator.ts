import { WeatherData } from 'app/game/engine';
import { WeatherMessage, EngineEvents } from 'app/game/message';
import { Simulator } from './Simulator';

export class WeatherSimulator implements Simulator {

  public start() {
    const date = new Date();
    const isRaining = false; // date.getDay() % 2 === 0;
    let dayBrightness = Math.abs(Math.abs(date.getHours() / 24 - 0.5) * 2 - 1);
    if (dayBrightness < 0.6) {
      dayBrightness = 0.6;
    }

    const weatherData: WeatherData = {
      rainIntensity: 0,
      sunBrigthness: dayBrightness,
      lightningIntensity: 0,
      thunderIntensity: 0,
      thunderDistanceM: 0,
    };

    if (isRaining) {
      weatherData.rainIntensity = Math.random() * 2;
      weatherData.lightningIntensity = Math.random() * 1;
      weatherData.thunderIntensity = 0.5;
      weatherData.thunderDistanceM = Math.random() * 1200;
    }

    const weatherMessage = new WeatherMessage(weatherData);
    this.sendClient(weatherMessage);
  }

  public update() {
    // no op.
  }

  private sendClient(msg: any) {
    PubSub.publish(EngineEvents.IO_RECV_MSG, msg);
  }
}
