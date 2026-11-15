import { Pipe, PipeTransform } from '@angular/core';
import { Dinero } from '../core/models';
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: Dinero | null | undefined): string { if (!value) return '—'; try { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: value.moneda, currencyDisplay: 'code', maximumFractionDigits: 2 }).format(value.monto); } catch { return `${value.monto} ${value.moneda}`; } }
}
