import {ApplicationConfig, InjectionToken, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {ROOT_ROUTES} from './app.routes';
import {environment} from '../environments/environment';
import {provideHttpClient} from '@angular/common/http';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

export const API_REMOTE_SERVICE_URL = new InjectionToken<string>("API_REMOTE_SERVICE_URL");

export const getRemoteServiceBaseUrl = (): string | null => {
  return environment.remoteServiceBaseUrl;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideHttpClient(),
    provideRouter(ROOT_ROUTES),
    {
      provide: API_REMOTE_SERVICE_URL,
      useFactory: getRemoteServiceBaseUrl
    },
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
