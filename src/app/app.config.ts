import {
  ApplicationConfig,
  CompilerFactory,
  COMPILER_OPTIONS,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    {
      provide: CompilerFactory,
      useClass: JitCompilerFactory,
      deps: [COMPILER_OPTIONS],
    },
  ],
};
