import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = (_, state) => inject(AuthService).valid() || inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
export const guestGuard: CanActivateFn = () => !inject(AuthService).valid() || inject(Router).createUrlTree(['/catalogo']);
export const roleGuard: CanActivateFn = (route) => inject(AuthService).user()?.rol === route.data['role'] || inject(Router).createUrlTree(['/acceso-denegado']);
