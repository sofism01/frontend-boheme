import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Prenda } from '../core/models';
import { MoneyPipe } from './money.pipe';
@Component({ selector: 'app-product-card', imports: [RouterLink, MoneyPipe], template: `
  <article class="card product-card h-100">
    <a [routerLink]="['/catalogo', product().prendaId]" class="product-visual" [attr.aria-label]="'Ver ' + product().nombre"><span class="visual-index">{{ index().toString().padStart(2, '0') }}</span><span class="visual-title">{{ product().nombre }}</span><span class="visual-note">Prenda de autor · Sin fotografía</span><span class="visual-arrow" aria-hidden="true">↗</span></a>
    <div class="d-flex justify-content-between align-items-start gap-3 mt-3"><h2 class="product-name"><a [routerLink]="['/catalogo', product().prendaId]">{{ product().nombre }}</a></h2><span class="price">{{ product().precioBase | money }}</span></div>
    <p class="small text-secondary mb-2 product-description">{{ product().descripcion }}</p>
    <div class="d-flex justify-content-between small"><span>{{ product().variantes.length }} variantes</span><span [class.text-secondary]="!product().disponibleParaLaVenta">{{ product().disponibleParaLaVenta ? 'En colección' : 'Venta suspendida' }}</span></div>
    <ng-content />
  </article>` })
export class ProductCardComponent { readonly product = input.required<Prenda>(); readonly index = input(1); }
