import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { AuthService, safeReturnUrl } from '../core/auth.service';
import { NotificationsService } from '../core/notifications.service';
import { Rol } from '../core/models';
export const passwordBytes = (control: AbstractControl) => new TextEncoder().encode(control.value || '').length > 72 ? { bytes: true } : null;
@Component({ imports: [ReactiveFormsModule, RouterLink], template: `
  <section class="auth-layout page-gutter"><div class="auth-intro"><span class="eyebrow">TU ESPACIO EN BOHÈME</span><h1>{{ register ? 'Hazlo' : 'Qué bueno' }}<br><em>{{ register ? 'tuyo.' : 'verte.' }}</em></h1><p>{{ register ? 'Crea una cuenta para descubrir prendas o compartir tus creaciones.' : 'Vuelve a tus favoritos, tu bolsa y tus próximas elecciones.' }}</p><a class="text-link" routerLink="/catalogo">Explorar la colección ↗</a></div><div class="auth-form"><h2 class="h3 mb-4">{{ register ? 'Crear cuenta' : 'Iniciar sesión' }}</h2>
  <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
    @if (register) { <label for="nombre" class="form-label">Nombre</label><input id="nombre" class="form-control" formControlName="nombre" autocomplete="name" maxlength="100" [attr.aria-invalid]="invalid('nombre')"><p class="field-error">@if (invalid('nombre')) { Escribe tu nombre (máximo 100 caracteres). }</p> }
    <label for="correo" class="form-label">Correo electrónico</label><input id="correo" class="form-control" type="email" formControlName="correo" autocomplete="email" maxlength="254" [attr.aria-invalid]="invalid('correo')"><p class="field-error">@if (invalid('correo')) { Escribe un correo electrónico válido. }</p>
    <label for="password" class="form-label">Contraseña</label><input id="password" class="form-control" type="password" formControlName="password" [autocomplete]="register ? 'new-password' : 'current-password'" [attr.aria-invalid]="invalid('password')" aria-describedby="password-help"><p id="password-help" class="small text-secondary mt-2">{{ register ? 'Al menos 12 caracteres. Máximo 72 bytes UTF-8.' : 'Usa la contraseña de tu cuenta.' }}</p><p class="field-error">@if (invalid('password')) { {{ register ? 'Usa entre 12 y 72 caracteres, sin superar 72 bytes UTF-8.' : 'Escribe tu contraseña (máximo 72 bytes UTF-8).' }} }</p>
    @if (register) { <label class="form-label" for="rol">Quiero participar como</label><select id="rol" class="form-select mb-4" formControlName="rol"><option value="COMPRADOR">Comprador · descubrir y elegir</option><option value="VENDEDOR">Vendedor · publicar mis prendas</option></select> }
    @if (error()) { <div class="alert alert-danger" role="alert">{{ error() }} @for (detail of details(); track detail) { <div class="small mt-1">{{ detail }}</div> }</div> }
    <button class="btn btn-dark w-100" [disabled]="busy()" type="submit">{{ busy() ? 'Un momento…' : register ? 'Crear mi cuenta' : 'Entrar a mi cuenta' }}</button>
    <p class="small mt-4">{{ register ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?' }} <a [routerLink]="register ? '/login' : '/registro'">{{ register ? 'Inicia sesión' : 'Crea tu cuenta' }}</a></p>
  </form></div></section>` })
export class AuthComponent {
  private readonly auth = inject(AuthService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly notices = inject(NotificationsService); private readonly fb = inject(FormBuilder);
  readonly register = this.route.snapshot.data['register'] === true;
  readonly busy = signal(false); readonly error = signal(''); readonly details = signal<string[]>([]);
  readonly form = this.fb.nonNullable.group({ nombre: ['', this.register ? [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)] : []], correo: ['', [Validators.required, Validators.email, Validators.maxLength(254), Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]], password: ['', [Validators.required, Validators.maxLength(72), passwordBytes, ...(this.register ? [Validators.minLength(12)] : [])]], rol: ['COMPRADOR' as Rol, Validators.required] });
  invalid(field: keyof typeof this.form.controls) { const c = this.form.controls[field]; return c.touched && c.invalid; }
  submit() { this.form.markAllAsTouched(); if (this.form.invalid || this.busy()) return; this.busy.set(true); this.error.set(''); this.details.set([]); const value = this.form.getRawValue();
    const operation: Observable<unknown> = this.register ? this.auth.register({ ...value, nombre: value.nombre.trim(), correo: value.correo.trim() }) : this.auth.login(value.correo.trim(), value.password);
    operation.pipe(finalize(() => this.busy.set(false))).subscribe({ next: () => { if (this.register) { this.notices.show('Tu cuenta está lista. Inicia sesión para continuar.'); void this.router.navigate(['/login']); } else { this.notices.show('Has iniciado sesión.'); void this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'))); } }, error: e => { this.error.set(e.error?.message || (e.status === 0 ? 'No hay conexión con el servidor.' : 'No pudimos acceder. Revisa tus datos.')); this.details.set(Object.values(e.error?.details || {})); } });
  }
}
