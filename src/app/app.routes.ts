import { Component } from '@angular/core';
import { Routes, RouterLink } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards';
import { HomeComponent } from './pages/home.component';
import { AuthComponent } from './pages/auth.component';
import { CatalogComponent } from './pages/catalog.component';
import { DetailComponent } from './pages/detail.component';
import { BolsaComponent, PedidosComponent, FavoritosComponent } from './pages/compras.component';
@Component({imports:[RouterLink],template:`<section class="container py-5"><p class="eyebrow">BOHÈME / 404</p><h1>Por aquí no era.</h1><p>No encontramos la página que buscas.</p><a class="btn btn-dark" routerLink="/catalogo">Volver a la colección</a></section>`})
export class NotFoundComponent{}
@Component({imports:[RouterLink],template:`<section class="container py-5"><h1>Este espacio pertenece a otro rol.</h1><p>Consulta las opciones de tu cuenta en el menú.</p><a class="btn btn-dark" routerLink="/catalogo">Explorar colección</a></section>`})
export class ForbiddenComponent{}
export const routes:Routes=[
 {path:'',component:HomeComponent,title:'Bohème · Armario de autor'},
 {path:'login',component:AuthComponent,canActivate:[guestGuard],title:'Iniciar sesión · Bohème'},
 {path:'registro',component:AuthComponent,canActivate:[guestGuard],data:{register:true},title:'Crear cuenta · Bohème'},
 {path:'catalogo',component:CatalogComponent,title:'Colección · Bohème'},
 {path:'catalogo/:id',component:DetailComponent,title:'Detalle de prenda · Bohème'},
 {path:'vendedor',loadComponent:()=>import('./pages/seller.component').then(m=>m.SellerComponent),canActivate:[authGuard,roleGuard],data:{role:'VENDEDOR'},title:'Mi taller · Bohème'},
 {path:'vendedor/publicar',loadComponent:()=>import('./pages/seller.component').then(m=>m.PublishComponent),canActivate:[authGuard,roleGuard],data:{role:'VENDEDOR'},title:'Publicar prenda · Bohème'},
 {path:'bolsa',component:BolsaComponent,canActivate:[authGuard,roleGuard],data:{role:'COMPRADOR'},title:'Bolsa · Bohème'},
 {path:'pedidos',component:PedidosComponent,canActivate:[authGuard,roleGuard],data:{role:'COMPRADOR'},title:'Mis pedidos · Bohème'},
 {path:'favoritos',component:FavoritosComponent,canActivate:[authGuard,roleGuard],data:{role:'COMPRADOR'},title:'Mis favoritos · Bohème'},
 {path:'acceso-denegado',component:ForbiddenComponent,title:'Acceso restringido · Bohème'},
 {path:'**',component:NotFoundComponent,title:'Página no encontrada · Bohème'}
];
