import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { BagService } from '../core/bag.service';
import { OrdersService } from '../core/orders.service';
import { FavoritesService } from '../core/favorites.service';
import { NotificationsService } from '../core/notifications.service';
import { Bolsa, Pedido, Prenda } from '../core/models';
import { MoneyPipe } from '../shared/money.pipe';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({selector:'app-bolsa', imports:[RouterLink, MoneyPipe], template:`
<section class="container py-5"><p class="eyebrow">TU SELECCIÓN</p><h1>Bolsa de estilo</h1>
<p class="text-secondary">El inventario se comprueba al confirmar. Tu pedido no realiza un cobro.</p>
@if(loading()){<p role="status">Consultando tu bolsa…</p>}
@if(error()){<div class="alert alert-danger" role="alert">{{error()}} <button class="btn btn-sm btn-outline-dark" (click)="load()">Reintentar</button></div>}
@if(bag(); as b){
 @if(!b.lineas.length){<div class="p-5 border text-center"><h2>Tu bolsa está esperando</h2><p>Encuentra una prenda que hable de ti.</p><a routerLink="/catalogo" class="btn btn-dark">Explorar colección</a></div>}
 @else{<div class="table-responsive"><table class="table align-middle"><caption>Artículos de la bolsa</caption><thead><tr><th>Variante</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>
 @for(line of b.lineas;track line.varianteId){<tr><td class="text-break"><small>{{line.varianteId}}</small></td><td>{{line.cantidad}}</td><td>{{line.precioUnitario|money}}</td><td>{{line.subtotal|money}}</td></tr>}
 </tbody></table></div><div class="d-flex flex-wrap gap-3 justify-content-end align-items-center"><strong>Total {{total()|money}}</strong><button class="btn btn-outline-dark" [disabled]="busy()" (click)="clear()">Vaciar bolsa</button><button class="btn btn-dark" [disabled]="busy() || b.cerrada" (click)="confirm()">{{busy()?'Procesando…':'Confirmar pedido'}}</button></div>}}
@if(result();as p){<div class="alert alert-success mt-4" role="status"><h2 class="h4">Pedido confirmado</h2><p class="text-break">Referencia {{p.pedidoId}} · {{p.estado}}</p><p>Total {{p.total|money}}. No se ha realizado un cobro.</p><a routerLink="/pedidos" class="btn btn-dark">Ver mis pedidos</a></div>}
</section>`})
export class BolsaComponent{
 private readonly api=inject(BagService);private readonly auth=inject(AuthService);readonly notices=inject(NotificationsService);
 readonly bag=signal<Bolsa|null>(null);readonly loading=signal(false);readonly busy=signal(false);readonly error=signal('');readonly result=signal<Pedido|null>(null);
 readonly total=computed(()=>({monto:this.bag()?.lineas.reduce((s,l)=>s+l.subtotal.monto,0)??0,moneda:this.bag()?.lineas[0]?.subtotal.moneda??'COP'}));
 constructor(){this.load();}
 load(){const user=this.auth.user();if(!user)return;this.loading.set(true);this.error.set('');this.api.active(user.id).pipe(finalize(()=>this.loading.set(false))).subscribe({next:b=>this.bag.set(b),error:e=>{if(e.status===404)this.bag.set({bolsaId:'',clienteId:user.id,lineas:[],cerrada:false});else this.error.set(this.notices.error(e));}});}
 clear(){const b=this.bag();if(!b||this.busy())return;this.busy.set(true);this.api.clear(b.bolsaId).pipe(finalize(()=>this.busy.set(false))).subscribe({next:()=>{this.notices.show('Bolsa vaciada.');this.load();},error:e=>this.notices.error(e)});}
 confirm(){const b=this.bag();if(!b||this.busy()||!b.lineas.length)return;this.busy.set(true);this.api.confirm(b.bolsaId).pipe(finalize(()=>this.busy.set(false))).subscribe({next:p=>{this.result.set(p);this.bag.set(null);this.notices.show('Pedido confirmado. Puedes consultar sus artículos.');},error:e=>this.notices.error(e)});}
}

@Component({selector:'app-pedidos',imports:[MoneyPipe,RouterLink],template:`
<section class="container py-5"><p class="eyebrow">TU HISTORIA</p><h1>Mis pedidos</h1><p class="text-secondary">Una selección propia, prenda a prenda.</p>
@if(loading()){<p role="status">Consultando pedidos…</p>}
@if(error()){<div class="alert alert-danger">{{error()}} <button class="btn btn-outline-dark btn-sm" (click)="load()">Reintentar</button></div>}
@if(!loading()&&!error()&&!orders().length){<div class="p-5 border text-center"><h2>Aún no tienes pedidos</h2><a routerLink="/catalogo" class="btn btn-dark mt-3">Descubrir colección</a></div>}
@for(p of orders();track p.pedidoId){<article class="card mb-4"><div class="card-body p-4"><div class="d-flex flex-wrap justify-content-between gap-2"><h2 class="h5 text-break">Pedido {{p.pedidoId}}</h2><span class="badge text-bg-light align-self-start">{{p.estado}}</span></div><p class="small text-secondary">{{p.fechaCreacion}} UTC</p><div class="table-responsive"><table class="table"><thead><tr><th>Prenda</th><th>Talla</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>@for(l of p.lineas;track l.varianteId){<tr><td>{{l.nombrePrenda}}<small class="d-block text-secondary">{{l.sku}}</small></td><td>{{l.tipoTalla}}</td><td>{{l.cantidad}}</td><td>{{l.subtotal|money}}</td></tr>}</tbody></table></div><p class="text-end fw-bold mb-0">Total {{p.total|money}}</p></div></article>}
</section>`})
export class PedidosComponent{
 private readonly api=inject(OrdersService);private readonly notices=inject(NotificationsService);readonly orders=signal<Pedido[]>([]);readonly loading=signal(true);readonly error=signal('');
 constructor(){this.load();}load(){this.loading.set(true);this.error.set('');this.api.list().pipe(finalize(()=>this.loading.set(false))).subscribe({next:p=>this.orders.set(p),error:e=>this.error.set(this.notices.error(e))});}
}

@Component({selector:'app-favoritos',imports:[ProductCardComponent,RouterLink],template:`
<section class="container py-5"><p class="eyebrow">GUARDADO PARA TI</p><h1>Mis favoritos</h1><p class="text-secondary">Prendas que quieres volver a encontrar.</p>
@if(loading()){<p role="status">Consultando favoritos…</p>}
@if(error()){<div class="alert alert-danger">{{error()}} <button class="btn btn-outline-dark btn-sm" (click)="load()">Reintentar</button></div>}
@if(!loading()&&!error()&&!items().length){<div class="p-5 border text-center"><h2>Tu lista comienza con un encuentro</h2><p>Guarda las prendas que más te gusten desde la colección.</p><a routerLink="/catalogo" class="btn btn-dark">Explorar colección</a></div>}
<div class="row g-4">@for(p of items();track p.prendaId;let i=$index){<div class="col-12 col-sm-6 col-lg-4"><app-product-card [product]="p" [index]="i+1"><button class="btn btn-outline-dark w-100 mt-3" [disabled]="pending().includes(p.prendaId)" (click)="remove(p.prendaId)">♥ Quitar de favoritos</button></app-product-card></div>}</div>
</section>`})
export class FavoritosComponent{
 private readonly api=inject(FavoritesService);private readonly notices=inject(NotificationsService);readonly items=signal<Prenda[]>([]);readonly loading=signal(true);readonly error=signal('');readonly pending=signal<string[]>([]);
 constructor(){this.load();}load(){this.loading.set(true);this.error.set('');this.api.list().pipe(finalize(()=>this.loading.set(false))).subscribe({next:p=>this.items.set(p),error:e=>this.error.set(this.notices.error(e))});}
 remove(id:string){if(this.pending().includes(id))return;this.pending.update(p=>[...p,id]);this.api.remove(id).pipe(finalize(()=>this.pending.update(p=>p.filter(x=>x!==id)))).subscribe({next:()=>{this.items.update(p=>p.filter(x=>x.prendaId!==id));this.notices.show('Prenda eliminada de favoritos.');},error:e=>this.notices.error(e)});}
}
