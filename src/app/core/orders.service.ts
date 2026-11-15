import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pedido } from './models';
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Pedido[]>('/api/pedidos'); }
  detail(id: string) { return this.http.get<Pedido>(`/api/pedidos/${encodeURIComponent(id)}`); }
}
