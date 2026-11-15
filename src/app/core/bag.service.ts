import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError, switchMap } from 'rxjs';
import { Bolsa, Pedido } from './models';
@Injectable({ providedIn: 'root' })
export class BagService {
  private readonly http = inject(HttpClient);
  active(id: string) { return this.http.get<Bolsa>(`/api/bolsas/activas/${encodeURIComponent(id)}`); }
  create(clienteId: string) { return this.http.post<Bolsa>('/api/bolsas', { clienteId }); }
  ensure(id: string) { return this.active(id).pipe(catchError(error => error.status === 404 ? this.create(id) : throwError(() => error))); }
  add(bag: string, varianteId: string, cantidad: number) { return this.http.post<Bolsa>(`/api/bolsas/${encodeURIComponent(bag)}/items`, { varianteId, cantidad }); }
  addForUser(user: string, variant: string, amount: number) { return this.ensure(user).pipe(switchMap(bag => this.add(bag.bolsaId, variant, amount))); }
  clear(bag: string) { return this.http.delete<void>(`/api/bolsas/${encodeURIComponent(bag)}/items`); }
  confirm(bag: string) { return this.http.post<Pedido>(`/api/bolsas/${encodeURIComponent(bag)}/confirmar-pedido`, null); }
}
