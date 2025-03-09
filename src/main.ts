import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Enable JIT compilation
import '@angular/compiler';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
