import { Component } from '@angular/core';
import { PageContainerComponent } from './components/page-container/page-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PageContainerComponent],
  template: `<app-page-container></app-page-container>`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
