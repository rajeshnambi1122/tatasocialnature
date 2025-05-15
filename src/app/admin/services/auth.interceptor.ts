import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('admin_token');
    
    if (token) {
      // Add token to both direct API requests and proxy requests
      if (request.url.includes('tpmarathon-a8bvf2cpafbrake8.canadacentral-01.azurewebsites.net') || 
          request.url.startsWith('/api')) {
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
        
        return next.handle(authReq);
      }
    }
    
    return next.handle(request);
  }
} 