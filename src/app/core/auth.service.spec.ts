import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, SESSION_KEY, safeReturnUrl } from './auth.service';
import { Sesion } from './models';
export function session(token = 'token-a', rol: Sesion['rol'] = 'COMPRADOR'): Sesion {
  return { token, tokenType: 'Bearer', expiresIn: 3600, expiresAt: new Date(Date.now()+3600000).toISOString(), rol, usuario: { id: 'buyer-id', nombre: 'Ana', correo: 'ana@example.com', rol, activo: true } };
}
describe('AuthService persistence and contracts', () => {
  beforeEach(() => { localStorage.clear(); TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); });
  it('POST login persists the server session and logout removes it', () => {
    const auth = TestBed.inject(AuthService), http = TestBed.inject(HttpTestingController), value = session();
    auth.login('ana@example.com', 'long-password').subscribe();
    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual({ correo: 'ana@example.com', password: 'long-password' });
    req.flush(value); expect(auth.user()).toEqual(value.usuario); expect(JSON.parse(localStorage.getItem(SESSION_KEY)!)).toEqual(value);
    auth.logout(); expect(auth.session()).toBeNull(); expect(localStorage.getItem(SESSION_KEY)).toBeNull(); http.verify();
  });
  it('restores a valid persisted session', () => { const value = session(); localStorage.setItem(SESSION_KEY, JSON.stringify(value)); expect(TestBed.inject(AuthService).session()).toEqual(value); });
  it.each(['expired', 'inactive', 'role-mismatch', 'broken-json'])('rejects %s persistence', kind => {
    const value = session(); if(kind==='expired') value.expiresAt = '2000-01-01T00:00:00Z'; if(kind==='inactive') value.usuario.activo = false; if(kind==='role-mismatch') value.usuario.rol = 'VENDEDOR';
    localStorage.setItem(SESSION_KEY, kind==='broken-json' ? '{' : JSON.stringify(value)); expect(TestBed.inject(AuthService).session()).toBeNull();
  });
  it('clears a session that expires during use', () => { const auth=TestBed.inject(AuthService); auth.session.set({...session(), expiresAt:'2000-01-01T00:00:00Z'}); expect(auth.valid()).toBe(false); expect(auth.session()).toBeNull(); });
  it('retains in-memory login when storage is unavailable', () => { const auth=TestBed.inject(AuthService), spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('disabled');}); auth.login('a','b').subscribe(); TestBed.inject(HttpTestingController).expectOne('/api/auth/login').flush(session()); expect(auth.valid()).toBe(true); spy.mockRestore(); });
  it.each(['//external.test', '/login?x=1', '/registro', '/\\external.test', null])('rejects unsafe return URL %s', value => { expect(safeReturnUrl(value)).toBe('/catalogo'); });
});
