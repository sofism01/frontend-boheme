import { Component, input, output } from '@angular/core';
@Component({ selector: 'app-status', template: `
  @if (loading()) { <div class="status-panel" role="status"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando {{ subject() }}…</div> }
  @else if (error()) { <div class="status-panel" role="alert"><h2 class="h4">No pudimos cargar {{ subject() }}</h2><p>{{ error() }}</p><button class="btn btn-outline-dark" (click)="retry.emit()">Volver a intentar</button></div> }
  @else if (empty()) { <div class="status-panel"><span class="eyebrow">Un espacio para descubrir</span><h2 class="h3 mt-3">{{ emptyTitle() }}</h2><p class="text-secondary">{{ emptyText() }}</p><ng-content /></div> }
` })
export class StatusComponent { loading = input(false); error = input(''); empty = input(false); subject = input('contenido'); emptyTitle = input('Todavía no hay contenido'); emptyText = input('Cuando haya novedades, aparecerán aquí.'); retry = output<void>(); }
