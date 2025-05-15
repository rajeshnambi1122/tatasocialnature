import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'https://tpmarathon-a8bvf2cpafbrake8.canadacentral-01.azurewebsites.net/halwaCityMarathon/register';

  constructor(private http: HttpClient) { }

  /**
   * Submit a new marathon registration
   * @param formData The registration form data including participant details and photo
   * @returns Observable of the API response
   */
  submitRegistration(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
} 