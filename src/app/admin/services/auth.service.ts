import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if there's a token in localStorage during initialization
    this.isAuthenticatedSubject.next(this.hasToken());
  }

  // In a real application, this would make an HTTP request to your backend
  login(username: string, password: string): Observable<boolean> {
    // Simulate HTTP request
    return of(username === 'admin' && password === 'marathon2025')
      .pipe(
        delay(800), // Simulate server delay
        tap(isValid => {
          if (isValid) {
            localStorage.setItem('admin_token', 'demo-token-123');
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    this.isAuthenticatedSubject.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('admin_token');
  }
} 