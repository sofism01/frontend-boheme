import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  readonly messages = signal<{ id: number; text: string; kind: 'success' | 'danger' | 'info' }[]>([]);
  private sequence = 0;
  show(text: string, kind: 'success' | 'danger' | 'info' = 'success') { const id = ++this.sequence; this.messages.update(m => [...m.slice(-3), { id, text, kind }]); setTimeout(() => this.dismiss(id), 6000); }
  dismiss(id: number) { this.messages.update(m => m.filter(x => x.id !== id)); }
  error(error: unknown): string {
    const e = error as HttpErrorResponse;
    const message = e.status === 0 ? 'No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.' : e.error?.message || (e.status === 404 ? 'No encontramos el recurso solicitado.' : e.status === 403 ? 'Tu cuenta no tiene permiso para realizar esta acción.' : 'No pudimos completar la operación. Inténtalo de nuevo.');
    this.show(message, 'danger'); return message;
  }
}
