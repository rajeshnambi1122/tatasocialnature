import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('admin_token');
    
    if (token) {
      // Add token to API requests
      if (request.url.includes('tpmarathon-a8bvf2cpafbrake8.canadacentral-01.azurewebsites.net/halwaCityMarathon/')) {
        console.log('Adding auth token to request:', request.url);
        
        // Create headers with CORS headers
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
        });

        const authReq = request.clone({
          headers: headers,
          withCredentials: false
        });
        
        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            // Handle 401 Unauthorized errors by redirecting to login
            if (error.status === 401) {
              console.error('Unauthorized access, redirecting to login', error);
              localStorage.removeItem('admin_token');
              this.router.navigate(['/admin/login']);
            }
            return throwError(() => error);
          })
        );
      }
    }
    
    return next.handle(request);
  }
} 