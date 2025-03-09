import { Component, OnInit } from '@angular/core';
import { ComponentViewerComponent } from './components/component-viewer/component-viewer.component';
import { CommonModule } from '@angular/common';
import testComponents from './components/test-components.json';

interface ComponentData {
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ComponentViewerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  components: ComponentData[] = [];

  ngOnInit() {
    this.components = testComponents.components;
  }
}
