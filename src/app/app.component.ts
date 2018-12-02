import * as LOG from 'loglevel';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Bestia Browsergame';

  constructor() {
    LOG.setDefaultLevel('DEBUG');

    LOG.getLogger('Entity').setDefaultLevel('INFO');
  }
}
