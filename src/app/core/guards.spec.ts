import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard, guestGuard, roleGuard } from './guards';
describe('route guards',()=>{
  const run=(guard:CanActivateFn,role='COMPRADOR')=>TestBed.runInInjectionContext(()=>guard({data:{role}} as unknown as ActivatedRouteSnapshot,{url:'/compras?tab=bolsa'} as RouterStateSnapshot));
  const login=(rol:'COMPRADOR'|'VENDEDOR')=>TestBed.inject(AuthService).session.set({token:'jwt',tokenType:'Bearer',expiresIn:3600,expiresAt:new Date(Date.now()+3600000).toISOString(),rol,usuario:{id:'id',nombre:'Ana',correo:'a@b.co',rol,activo:true}});
  beforeEach(()=>{localStorage.clear();TestBed.configureTestingModule({providers:[provideHttpClient(),provideRouter([])]});});
  it('redirects anonymous access with returnUrl',()=>{expect(TestBed.inject(Router).serializeUrl(run(authGuard) as any)).toBe('/login?returnUrl=%2Fcompras%3Ftab%3Dbolsa');});
  it('allows an authenticated session',()=>{login('COMPRADOR');expect(run(authGuard)).toBe(true);});
  it('rejects an expired session',()=>{login('COMPRADOR');TestBed.inject(AuthService).session.update(s=>({...s!,expiresAt:'2000-01-01T00:00:00Z'}));expect(run(authGuard)).not.toBe(true);});
  it('allows guests and redirects authenticated guests',()=>{expect(run(guestGuard)).toBe(true);login('VENDEDOR');expect(TestBed.inject(Router).serializeUrl(run(guestGuard) as any)).toBe('/catalogo');});
  it.each(['COMPRADOR','VENDEDOR'] as const)('allows only matching %s role',rol=>{login(rol);expect(run(roleGuard,rol)).toBe(true);expect(TestBed.inject(Router).serializeUrl(run(roleGuard,rol==='COMPRADOR'?'VENDEDOR':'COMPRADOR') as any)).toBe('/acceso-denegado');});
});
