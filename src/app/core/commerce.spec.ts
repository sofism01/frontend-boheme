import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { BagService } from './bag.service';
import { FavoritesService } from './favorites.service';
import { Publicacion, PaginaPrendas } from './models';
describe('real commerce HTTP contracts',()=>{
  let http:HttpTestingController;
  beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});http=TestBed.inject(HttpTestingController);});
  afterEach(()=>http.verify());
  it('sends trimmed q and zero-based page/size and preserves pagination metadata',()=>{
    const next=vi.fn();TestBed.inject(CatalogService).search('  lino %_!  ',2,24).subscribe(next);
    const r=http.expectOne(r=>r.url==='/api/prendas');expect(r.request.method).toBe('GET');expect(r.request.params.keys().sort()).toEqual(['page','q','size']);expect(r.request.params.get('q')).toBe('lino %_!');expect(r.request.params.get('page')).toBe('2');expect(r.request.params.get('size')).toBe('24');
    const page:PaginaPrendas={content:[],page:2,size:24,totalPages:2,totalElements:30};r.flush(page);expect(next).toHaveBeenCalledWith(page);
  });
  it('POST publication uses flat money fields and server-generated IDs',()=>{
    const value:Publicacion={creadorId:'seller',nombre:'Camisa',descripcion:'Lino',precioBase:150000,moneda:'COP',stockTotal:2,variantes:[{sku:'LIN-M',tipoTalla:'M',stockDisponible:2}]};
    const next=vi.fn();TestBed.inject(CatalogService).publish(value).subscribe(next);const r=http.expectOne('/api/prendas');expect(r.request.method).toBe('POST');expect(r.request.body).toEqual(value);r.flush({...value,prendaId:'generated',variantes:[{...value.variantes[0],varianteId:'variant-generated'}]},{status:201,statusText:'Created'});expect(next.mock.calls[0][0].prendaId).toBe('generated');
  });
  it('creates a missing active bag then POSTs only variant and amount',()=>{
    TestBed.inject(BagService).addForUser('buyer','variant',2).subscribe();const active=http.expectOne('/api/bolsas/activas/buyer');expect(active.request.method).toBe('GET');active.flush({},{status:404,statusText:'Not Found'});
    const create=http.expectOne('/api/bolsas');expect(create.request.method).toBe('POST');expect(create.request.body).toEqual({clienteId:'buyer'});create.flush({bolsaId:'bag',clienteId:'buyer',lineas:[],cerrada:false},{status:201,statusText:'Created'});
    const add=http.expectOne('/api/bolsas/bag/items');expect(add.request.method).toBe('POST');expect(add.request.body).toEqual({varianteId:'variant',cantidad:2});add.flush({bolsaId:'bag'});
  });
  it('reuses an existing bag',()=>{TestBed.inject(BagService).addForUser('buyer','variant',1).subscribe();http.expectOne('/api/bolsas/activas/buyer').flush({bolsaId:'existing'});http.expectNone('/api/bolsas');http.expectOne('/api/bolsas/existing/items').flush({});});
  it.each([401,403,500])('does not create a bag on %s',status=>{const error=vi.fn();TestBed.inject(BagService).ensure('buyer').subscribe({error});http.expectOne('/api/bolsas/activas/buyer').flush({},{status,statusText:'Failure'});http.expectNone('/api/bolsas');expect(error.mock.calls[0][0].status).toBe(status);});
  it('confirms bag with a bodyless POST',()=>{TestBed.inject(BagService).confirm('bag').subscribe();const r=http.expectOne('/api/bolsas/bag/confirmar-pedido');expect(r.request.method).toBe('POST');expect(r.request.body).toBeNull();r.flush({pedidoId:'order'},{status:201,statusText:'Created'});});
  it('lists, adds and removes favorites without client identity in the payload',()=>{
    const service=TestBed.inject(FavoritesService);service.list().subscribe();http.expectOne('/api/favoritos').flush([]);
    service.add('prenda').subscribe();const add=http.expectOne('/api/favoritos/prenda');expect(add.request.method).toBe('POST');expect(add.request.body).toBeNull();add.flush({prendaId:'prenda'},{status:201,statusText:'Created'});
    service.remove('prenda').subscribe();const remove=http.expectOne('/api/favoritos/prenda');expect(remove.request.method).toBe('DELETE');remove.flush(null,{status:204,statusText:'No Content'});
  });
  it('propagates duplicate favorite conflict',()=>{const error=vi.fn();TestBed.inject(FavoritesService).add('prenda').subscribe({error});http.expectOne('/api/favoritos/prenda').flush({message:'Ya es favorita'},{status:409,statusText:'Conflict'});expect(error.mock.calls[0][0].status).toBe(409);});
});
