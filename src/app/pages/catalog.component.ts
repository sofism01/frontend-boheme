import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap, Observable } from 'rxjs';
import { CatalogService } from '../core/catalog.service';
import { PaginaPrendas } from '../core/models';
import { ProductCardComponent } from '../shared/product-card.component';
import { StatusComponent } from '../shared/status.component';
import { AuthService } from '../core/auth.service';
import { FavoritesService } from '../core/favorites.service';
import { NotificationsService } from '../core/notifications.service';
@Component({ imports: [ReactiveFormsModule, ProductCardComponent, StatusComponent], template: `
  <section class="page-gutter page-section"><div class="section-heading"><div><span class="eyebrow">ELIGE CON IDENTIDAD</span><h1>La <em>colección.</em></h1></div><p>Prendas para hacerlas tuyas.<br>Descubre cada detalle.</p></div>
  <div class="catalog-toolbar"><div class="search-field"><label class="visually-hidden" for="search">Buscar prendas</label><input id="search" class="form-control" type="search" placeholder="Buscar por nombre o descripción" [formControl]="search"><span aria-hidden="true">⌕</span></div><div class="d-flex align-items-center gap-2"><label for="size" class="small text-nowrap">Por página</label><select id="size" class="form-select" [value]="size()" (change)="resize($event)"><option value="12">12</option><option value="24">24</option><option value="48">48</option></select></div></div>
  <div class="d-flex justify-content-between small text-secondary mb-4"><span aria-live="polite">{{ data()?.totalElements ?? 0 }} prendas encontradas</span><span>Ordenadas por nombre</span></div>
  <app-status [loading]="loading()" [error]="error()" [empty]="!data()?.content?.length" subject="la colección" emptyTitle="No hay prendas que coincidan" emptyText="Prueba con otra búsqueda o vuelve a explorar la colección." (retry)="reload()"><button class="btn btn-outline-dark" (click)="reset()">Limpiar búsqueda</button></app-status>
  @if (!loading() && !error()) { <div class="row g-4 g-lg-5">@for (item of data()?.content; track item.prendaId; let i = $index) { <div class="col-12 col-sm-6 col-lg-4"><app-product-card [product]="item" [index]="page() * size() + i + 1">@if(auth.user()?.rol === 'COMPRADOR'){<button class="btn btn-outline-dark w-100 mt-3" [attr.aria-pressed]="favoriteIds().includes(item.prendaId)" [disabled]="favoritePending().includes(item.prendaId) || favoriteLoading()" (click)="toggleFavorite(item.prendaId)">{{favoriteIds().includes(item.prendaId)?'♥ Quitar favorito':'♡ Guardar favorito'}}</button>}</app-product-card></div> }</div>
  @if ((data()?.totalPages ?? 0) > 1) { <nav aria-label="Paginación del catálogo" class="pagination-bar"><button class="btn btn-outline-dark" [disabled]="page() === 0" (click)="changePage(page()-1)">← Anterior</button><span>Página {{ page()+1 }} de {{ data()?.totalPages }}</span><button class="btn btn-outline-dark" [disabled]="page()+1 >= (data()?.totalPages ?? 0)" (click)="changePage(page()+1)">Siguiente →</button></nav> } }
  </section>` })
export class CatalogComponent {
  readonly auth=inject(AuthService);private readonly favorites=inject(FavoritesService);private readonly notices=inject(NotificationsService);readonly favoriteIds=signal<string[]>([]);readonly favoritePending=signal<string[]>([]);readonly favoriteLoading=signal(false);
  private readonly api = inject(CatalogService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly destroy = inject(DestroyRef);
  readonly search = new FormControl(this.route.snapshot.queryParamMap.get('q') || '', { nonNullable: true });
  readonly page = signal(0); readonly size = signal(12); readonly loading = signal(true); readonly error = signal(''); readonly data = signal<PaginaPrendas | null>(null);
  constructor() {
    if(this.auth.user()?.rol==='COMPRADOR'){this.favoriteLoading.set(true);this.favorites.list().subscribe({next:p=>{this.favoriteIds.set(p.map(x=>x.prendaId));this.favoriteLoading.set(false);},error:e=>{this.favoriteLoading.set(false);this.notices.error(e);}});}
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed()).subscribe(q => void this.router.navigate([], { relativeTo: this.route, queryParams: { q: q.trim() || null, page: 0 }, queryParamsHandling: 'merge' }));
    this.route.queryParamMap.pipe(tap(params => { const page = Number(params.get('page')); const size = Number(params.get('size') || 12); this.page.set(Number.isInteger(page) && page >= 0 ? page : 0); this.size.set([12,24,48].includes(size) ? size : 12); this.search.setValue(params.get('q') || '', { emitEvent: false }); this.loading.set(true); this.error.set(''); }), switchMap(params => this.api.search(params.get('q') || '', this.page(), this.size()).pipe(catchError(e => { this.error.set(e.error?.message || 'La colección no está disponible. Inténtalo de nuevo.'); return of(null); }))), takeUntilDestroyed(this.destroy)).subscribe(value => { this.data.set(value); this.loading.set(false); });
  }
  changePage(page: number) { void this.router.navigate([], { queryParams: { page }, queryParamsHandling: 'merge' }); }
  toggleFavorite(id:string){if(this.favoritePending().includes(id))return;const exists=this.favoriteIds().includes(id);this.favoritePending.update(p=>[...p,id]);const done=()=>this.favoritePending.update(p=>p.filter(x=>x!==id));((exists?this.favorites.remove(id):this.favorites.add(id)) as Observable<unknown>).subscribe({next:()=>{this.favoriteIds.update(p=>exists?p.filter(x=>x!==id):[...p,id]);done();this.notices.show(exists?'Prenda eliminada de favoritos.':'Prenda guardada en favoritos.');},error:e=>{done();this.notices.error(e);}});}
  resize(event: Event) { void this.router.navigate([], { queryParams: { size: Number((event.target as HTMLSelectElement).value), page: 0 }, queryParamsHandling: 'merge' }); }
  reset() { this.search.setValue(''); void this.router.navigate(['/catalogo']); }
  reload() { void this.router.navigate([], { queryParams: { refresh: Date.now() }, queryParamsHandling: 'merge' }); }
}

