import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'https://halwacitymarathon-fzeubeexg9hybsfx.canadacentral-01.azurewebsites.net/halwaCityMarathon';
  private registerEndpoint = `${this.apiUrl}/register`;
  private registrationsEndpoint = `${this.apiUrl}/registrations`;

  constructor(private http: HttpClient) { }

  /**
   * Submit a new marathon registration
   * @param formData The registration form data including participant details and photo
   * @returns Observable of the API response
   */
  submitRegistration(formData: FormData): Observable<any> {
    // Note: For multipart/form-data, don't set Content-Type header explicitly
    // The browser will set it automatically with the correct boundary
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    // Log the form data for debugging
    console.log('Submitting registration with FormData:');
    formData.forEach((value, key) => {
      console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.type}, ${value.size} bytes)` : value}`);
    });

    return this.http.post<any>(this.registerEndpoint, formData, { headers });
  }

  /**
   * Get all registrations
   * @returns Observable of the registrations list
   */
  getRegistrations(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<any>(this.registrationsEndpoint, { headers });
  }
} 