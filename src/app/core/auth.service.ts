import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { LoginRequest, Registro, Sesion, Usuario } from './models';
export const SESSION_KEY = 'boheme.session';
export function safeReturnUrl(value: string | null): string { return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !/^\/(login|registro)(\/|\?|$)/.test(value) ? value : '/catalogo'; }
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly session = signal<Sesion | null>(this.restore());
  readonly user = computed(() => this.session()?.usuario ?? null);
  readonly authenticated = computed(() => !!this.session());
  private expirationHandled = false;
  login(correo: string, password: string) { const body: LoginRequest = { correo, password }; return this.http.post<Sesion>('/api/auth/login', body).pipe(tap(s => { this.expirationHandled = false; this.session.set(s); try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* Session remains usable in memory. */ } })); }
  register(data: Registro) { return this.http.post<Usuario>('/api/auth/register', data); }
  logout() { this.session.set(null); try { localStorage.removeItem(SESSION_KEY); } catch { /* Storage may be disabled. */ } }
  valid() { const s = this.session(); if (s && Date.parse(s.expiresAt) > Date.now()) return true; this.logout(); return false; }
  expire(token: string): boolean { if (this.expirationHandled || this.session()?.token !== token) return false; this.expirationHandled = true; this.logout(); return true; }
  private restore(): Sesion | null {
    try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as Sesion | null;
      if (s?.token && s.usuario?.id && s.usuario.activo && ['COMPRADOR', 'VENDEDOR'].includes(s.rol) && s.usuario.rol === s.rol && Date.parse(s.expiresAt) > Date.now()) return s;
      localStorage.removeItem(SESSION_KEY);
    } catch { /* Invalid persisted session is ignored. */ }
    return null;
  }
}
