import { EventTrigger } from './EventTrigger';
import { WorldState } from '../WorldState';
import { UiModalMessage } from 'app/game/message';

export class Trigger01BlockHouseLeave extends EventTrigger {

  getTriggerName(): string {
    return '01_block_house_leave';
  }

  triggers() {
    if (WorldState.hasPlayerAllStartItems) {
      return;
    }

    if (!WorldState.hasPlayerAllStartItems) {
      const msg = new UiModalMessage('I can not leave until I have all my tools picked up which I need...');
      this.sendClient(msg);

      // 86, 92

    }
    // Check if player has all needed house items.
  }
}