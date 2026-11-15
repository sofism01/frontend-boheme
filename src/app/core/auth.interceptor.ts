import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationsService } from './notifications.service';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService), router = inject(Router), notices = inject(NotificationsService);
  const api = request.url === '/api' || request.url.startsWith('/api/');
  const credentials = request.url.startsWith('/api/auth/');
  const captured = api && !credentials ? auth.session() : null;
  const expire = () => {
    if (captured && auth.expire(captured.token)) {
      notices.show('Tu sesión terminó. Inicia sesión para continuar.', 'info');
      void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
    }
  };
  if (captured && !(Date.parse(captured.expiresAt) > Date.now())) expire();
  const token = captured && auth.session()?.token === captured.token ? captured.token : null;
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request).pipe(catchError(error => {
    if (api && !credentials && error.status === 401) expire();
    return throwError(() => error);
  }));
};
