import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Prenda } from './models';
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Prenda[]>('/api/favoritos'); }
  add(id: string) { return this.http.post<Prenda>(`/api/favoritos/${encodeURIComponent(id)}`, null); }
  remove(id: string) { return this.http.delete<void>(`/api/favoritos/${encodeURIComponent(id)}`); }
}
