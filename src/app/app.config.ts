import {
  ApplicationConfig,
  CompilerFactory,
  COMPILER_OPTIONS,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    {
      provide: CompilerFactory,
      useClass: JitCompilerFactory,
      deps: [COMPILER_OPTIONS],
    },
  ],
};
