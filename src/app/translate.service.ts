import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private currentLanguage = new BehaviorSubject<string>('en');
  private translations: any = {};

  constructor(private http: HttpClient) {
    // Load saved language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.loadTranslations(savedLang).subscribe();
  }

  private loadTranslations(lang: string): Observable<any> {
    const path = `assets/i18n/${lang}.json`;
    return this.http.get(path).pipe(
      tap(data => {
        this.translations = data;
        this.currentLanguage.next(lang);
        localStorage.setItem('preferredLanguage', lang);
      }),
      catchError(error => {
        console.error(`Failed to load translations for ${lang}`, error);
        return of({});
      })
    );
  }

  setLanguage(lang: string): Observable<any> {
    if (lang !== this.currentLanguage.value) {
      return this.loadTranslations(lang);
    }
    return of(this.translations);
  }

  getTranslation(key: string): string {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  getCurrentLanguage(): Observable<string> {
    return this.currentLanguage.asObservable();
  }
} 