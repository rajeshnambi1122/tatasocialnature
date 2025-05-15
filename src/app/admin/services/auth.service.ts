import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginResponse } from './login-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private apiUrl = 'https://tpmarathon-a8bvf2cpafbrake8.canadacentral-01.azurewebsites.net/halwaCityMarathon';

  constructor(private http: HttpClient) {
    // Check if there's a token in localStorage during initialization
    this.isAuthenticatedSubject.next(this.hasToken());
  }

  // Get HTTP options for API calls
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }),
      withCredentials: false
    };
  }

  // Method to set token directly (can be used to pass in a token from curl or elsewhere)
  setToken(token: string): boolean {
    if (token && token.length > 0) {
      localStorage.setItem('admin_token', token);
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      userName: username,
      passWord: password
    }, this.getHttpOptions()).pipe(
      map(response => {
        console.log('Login response:', response); // Log the response for debugging
        
        // Store token if received
        if (response && response.token) {
          const token = response.token;
          console.log('Storing token:', token);
          localStorage.setItem('admin_token', token);
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        
        // For the specific API response structure
        if (response && response.jwttoken) {
          const token = response.jwttoken;
          console.log('Storing JWT token:', token);
          localStorage.setItem('admin_token', token);
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        
        // If token is directly in response (as string)
        if (typeof response === 'string' && response.length > 0) {
          console.log('Storing string token:', response);
          localStorage.setItem('admin_token', response);
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        
        // If success flag is available, use it
        if (response && response.success !== undefined) {
          if (response.success) {
            // Some APIs might not return a token directly
            const token = response.token || 'authenticated';
            console.log('Storing success token:', token);
            localStorage.setItem('admin_token', token);
            this.isAuthenticatedSubject.next(true);
            return true;
          }
        }
        
        return false;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(false);
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