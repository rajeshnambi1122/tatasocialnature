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
  private userRoleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  public userRole$ = this.userRoleSubject.asObservable();

  private apiUrl = 'https://tpmarathon-a8bvf2cpafbrake8.canadacentral-01.azurewebsites.net/halwaCityMarathon';

  constructor(private http: HttpClient) {
    // Check if there's a token in localStorage during initialization
    this.isAuthenticatedSubject.next(this.hasToken());
    this.userRoleSubject.next(this.getUserRole());
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
  setToken(token: string, role?: string): boolean {
    if (token && token.length > 0) {
      localStorage.setItem('admin_token', token);
      if (role) {
        localStorage.setItem('user_role', role);
        this.userRoleSubject.next(role);
      }
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse | string>(`${this.apiUrl}/login`, {
      userName: username,
      passWord: password
    }, this.getHttpOptions()).pipe(
      // Add a minimum delay to ensure the loading spinner is visible
      delay(800),
      map(response => {
        console.log('Login response:', response); // Log the response for debugging
        
        // Store token if received
        if (response && typeof response === 'object' && response.token) {
          const token = response.token;
          console.log('Storing token:', token);
          localStorage.setItem('admin_token', token);
          
          // Store role if available
          if (response.role) {
            localStorage.setItem('user_role', response.role);
            this.userRoleSubject.next(response.role);
          }
          
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        
        // For the specific API response structure
        if (response && typeof response === 'object' && response.jwttoken) {
          const token = response.jwttoken;
          console.log('Storing JWT token:', token);
          localStorage.setItem('admin_token', token);
          
          // Store role if available
          if (response.role) {
            localStorage.setItem('user_role', response.role);
            this.userRoleSubject.next(response.role);
          }
          
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
        if (response && typeof response === 'object' && response.success !== undefined) {
          if (response.success) {
            // Some APIs might not return a token directly
            const token = response.token || 'authenticated';
            console.log('Storing success token:', token);
            localStorage.setItem('admin_token', token);
            
            // Store role if available
            if (response.role) {
              localStorage.setItem('user_role', response.role);
              this.userRoleSubject.next(response.role);
            }
            
            this.isAuthenticatedSubject.next(true);
            return true;
          }
        }
        
        return false;
      }),
      catchError(error => {
        console.error('Login error:', error);
        // Add delay on error as well to show the spinner
        return of(false).pipe(delay(800));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_role');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('admin_token');
  }
  
  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }
  
  isTataAdmin(): boolean {
    return this.getUserRole() === 'Tata Admin';
  }
} 