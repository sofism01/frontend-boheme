import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CatalogComponent } from './catalog.component';
describe('catalog query orchestration',()=>{
  let params:BehaviorSubject<ReturnType<typeof convertToParamMap>>, component:CatalogComponent, http:HttpTestingController;
  const navigate=vi.fn();
  beforeEach(()=>{vi.useFakeTimers();vi.clearAllMocks();localStorage.clear();params=new BehaviorSubject(convertToParamMap({q:'lino',page:'2',size:'24'}));TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),{provide:ActivatedRoute,useValue:{snapshot:{queryParamMap:params.value},queryParamMap:params}},{provide:Router,useValue:{navigate}}]});http=TestBed.inject(HttpTestingController);component=TestBed.runInInjectionContext(()=>new CatalogComponent());});
  afterEach(()=>{http.verify({ignoreCancelled:true});vi.useRealTimers();});
  it('debounces typing for 300ms and resets pagination',()=>{http.expectOne(r=>r.url==='/api/prendas').flush({content:[]});component.search.setValue('l');vi.advanceTimersByTime(200);component.search.setValue('  lino nuevo  ');vi.advanceTimersByTime(299);expect(navigate).not.toHaveBeenCalled();vi.advanceTimersByTime(1);expect(navigate).toHaveBeenCalledTimes(1);expect(navigate.mock.calls[0][1].queryParams).toEqual({q:'lino nuevo',page:0});});
  it('cancels stale HTTP request when query changes and preserves newest page',()=>{const old=http.expectOne(r=>r.url==='/api/prendas');params.next(convertToParamMap({q:'algodon',page:'1',size:'12'}));expect(old.cancelled).toBe(true);const latest=http.expectOne(r=>r.url==='/api/prendas');expect(latest.request.params.get('q')).toBe('algodon');expect(latest.request.params.get('page')).toBe('1');latest.flush({content:[],page:1,size:12,totalElements:13,totalPages:2});expect(component.data()?.totalElements).toBe(13);expect(component.loading()).toBe(false);});
  it('normalizes malformed pagination and size from URL',()=>{http.expectOne(r=>r.url==='/api/prendas').flush({content:[]});params.next(convertToParamMap({page:'-1',size:'1000'}));const r=http.expectOne(r=>r.url==='/api/prendas');expect(r.request.params.get('page')).toBe('0');expect(r.request.params.get('size')).toBe('12');r.flush({content:[]});});
  it('continues searching after an HTTP error',()=>{http.expectOne(r=>r.url==='/api/prendas').flush({message:'Sin conexion'},{status:503,statusText:'Unavailable'});expect(component.error()).toBe('Sin conexion');params.next(convertToParamMap({q:'nuevo'}));http.expectOne(r=>r.url==='/api/prendas').flush({content:[],totalElements:0,totalPages:0,page:0,size:12});expect(component.error()).toBe('');expect(component.loading()).toBe(false);});
});
