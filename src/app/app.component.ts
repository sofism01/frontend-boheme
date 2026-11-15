import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { NotificationsService } from './core/notifications.service';
@Component({ selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive], template: `
  <a href="#main" class="skip-link">Saltar al contenido</a>
  <div class="announcement">Prendas de autor. Una forma propia de vestir.</div>
  <header class="site-header"><nav class="navbar navbar-expand-lg container-fluid page-gutter" aria-label="Navegación principal">
    <a class="navbar-brand wordmark" routerLink="/" (click)="menu.set(false)">bohème<span>ARMARIO DE AUTOR</span></a>
    <button type="button" class="navbar-toggler" aria-controls="main-nav" [attr.aria-expanded]="menu()" [attr.aria-label]="menu() ? 'Cerrar menú' : 'Abrir menú'" (click)="menu.set(!menu())"><span class="navbar-toggler-icon"></span></button>
    <div id="main-nav" class="collapse navbar-collapse" [class.show]="menu()"><div class="navbar-nav ms-auto align-items-lg-center gap-lg-3" (click)="menu.set(false)">
      <a class="nav-link" routerLink="/catalogo" routerLinkActive="active">Colección</a>
      @if (auth.user()?.rol === 'COMPRADOR') { <a class="nav-link" routerLink="/favoritos" routerLinkActive="active">Favoritos</a><a class="nav-link" routerLink="/pedidos" routerLinkActive="active">Mis pedidos</a><a class="nav-link" routerLink="/bolsa" routerLinkActive="active">Bolsa ↗</a> }
      @if (auth.user()?.rol === 'VENDEDOR') { <a class="nav-link" routerLink="/vendedor" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active">Mi taller</a><a class="nav-link" routerLink="/vendedor/publicar" routerLinkActive="active">Publicar prenda</a> }
      @if (auth.user(); as user) { <span class="nav-user">{{ user.nombre }}</span><button class="btn btn-sm btn-outline-dark" (click)="logout()">Salir</button> }
      @else { <a class="nav-link" routerLink="/login">Iniciar sesión</a><a class="btn btn-dark btn-sm ms-lg-2" routerLink="/registro">Crear cuenta</a> }
    </div></div>
  </nav></header>
  <div class="notification-stack" aria-live="polite" aria-atomic="false">@for (notice of notices.messages(); track notice.id) { <div class="alert shadow-sm d-flex align-items-start gap-3" [class]="'alert alert-' + notice.kind" [attr.role]="notice.kind === 'danger' ? 'alert' : 'status'"><span>{{ notice.text }}</span><button class="btn-close ms-auto flex-shrink-0" aria-label="Cerrar notificación" (click)="notices.dismiss(notice.id)"></button></div> }</div>
  <main id="main" tabindex="-1"><router-outlet /></main>
  <footer class="site-footer page-gutter"><div class="d-flex flex-wrap justify-content-between gap-4"><a class="wordmark" routerLink="/">bohème</a><p class="mb-0">Descubre. Elige. Viste a tu manera.</p><a routerLink="/catalogo">Explorar la colección ↗</a></div><div class="footer-bottom">Un encuentro entre prendas y personas.</div></footer>
` })
export class AppComponent { readonly auth = inject(AuthService); readonly notices = inject(NotificationsService); readonly router = inject(Router); readonly menu = signal(false); logout() { this.auth.logout(); this.notices.show('Has cerrado sesión.', 'info'); void this.router.navigate(['/']); } }
