import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginaPrendas, Prenda, Publicacion } from './models';
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  search(q = '', page = 0, size = 12) { return this.http.get<PaginaPrendas>('/api/prendas', { params: new HttpParams().set('q', q.trim()).set('page', page).set('size', size) }); }
  detail(id: string) { return this.http.get<Prenda>(`/api/prendas/${encodeURIComponent(id)}`); }
  own(id: string) { return this.http.get<Prenda[]>(`/api/prendas/creador/${encodeURIComponent(id)}`); }
  publish(data: Publicacion) { return this.http.post<Prenda>('/api/prendas', data); }
  stock(id: string, variant: string, nuevoStock: number) { return this.http.patch<void>(`/api/prendas/${encodeURIComponent(id)}/variantes/${encodeURIComponent(variant)}/stock`, { nuevoStock }); }
  suspend(id: string) { return this.http.patch<void>(`/api/prendas/${encodeURIComponent(id)}/suspender`, {}); }
}
