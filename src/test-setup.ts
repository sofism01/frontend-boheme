import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
beforeEach(() => TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }));
afterEach(() => { TestBed.resetTestingModule(); localStorage.clear(); });
