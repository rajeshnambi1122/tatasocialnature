import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  dob: Date;
  aadharNumber: string;
  bloodGroup: string;
  emergencyContact: string;
  eventType: string; // marathon, kidathon, kingwalkathon, walkathon_disabled, drawing, poetry
  tshirtSize?: string; // S, M, L, XL, XXL
  category: string; // This can be derived from eventType for backwards compatibility
  registrationDate: Date;
  photo?: string; // URL to photo or base64 encoded string
  pledgeAgree: boolean;
  medicalConditions?: string;
  toString(): string;
}

// API response interface
export interface RegistrationResponse {
  registrations: any[];
  totalCount: number;
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private apiUrl = 'https://tpmarathon-a8bvf2cpafbrake8.canadacentral-01.azurewebsites.net/halwaCityMarathon';

  constructor(private http: HttpClient) { }

  // Helper to get HTTP options with auth token
  private getHttpOptions() {
    const token = localStorage.getItem('admin_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Access-Control-Allow-Origin': '*'
      }),
      withCredentials: false
    };
  }

  getParticipants(): Observable<Participant[]> {
    console.log('Getting participants with token:', localStorage.getItem('admin_token'));
    
    return this.http.get<any>(`${this.apiUrl}/registrations`, this.getHttpOptions())
      .pipe(
        map(response => {
          // Log the raw response to understand its structure
          console.log('Raw API Response:', response);
          
          // Check for different possible response structures
          let registrations: any[] = [];
          
          // Case 1: Standard structure with registrations array
          if (response && response.registrations) {
            console.log('Found standard registrations array');
            registrations = response.registrations;
          }
          // Case 2: Direct array response
          else if (Array.isArray(response)) {
            console.log('Found direct array response');
            registrations = response;
          }
          // Case 3: Response with content property as shown in example
          else if (response && response.content) {
            console.log('Found content property');
            if (Array.isArray(response.content)) {
              registrations = response.content;
            } else {
              // Handle single object in content
              registrations = [response.content];
            }
          }
          // Case 4: Response with message.content structure as shown in example
          else if (response && response.message && response.message.content) {
            console.log('Found message.content structure');
            if (Array.isArray(response.message.content)) {
              registrations = response.message.content;
            } else {
              // Handle single object in message.content
              registrations = [response.message.content];
            }
          }
          // Case 5: Nested data property
          else if (response && response.data) {
            console.log('Found data property');
            registrations = response.data;
          }
          // Case 6: Response has unexpected structure, log it
          else {
            console.log('Unexpected response structure. Response keys:', Object.keys(response));
            // Try to find an array property that might contain registrations
            const arrayProps = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayProps.length > 0) {
              console.log('Found potential registration arrays:', arrayProps);
              registrations = response[arrayProps[0]];
            }
          }
          
          // If we found registrations data, map it
          if (registrations && registrations.length > 0) {
            console.log(`Mapping ${registrations.length} registrations`);
            return registrations.map((reg: any) => this.mapToParticipant(reg));
          }
          
          console.log('No registrations data found in response');
          return [];
        }),
        catchError(error => {
          console.error('Error fetching registrations:', error);
          return of([]);
        })
      );
  }

  getParticipant(id: number): Observable<Participant | undefined> {
    return this.http.get<any>(`${this.apiUrl}/registrations/${id}`, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response && response.success && response.registration) {
            return this.mapToParticipant(response.registration);
          }
          return undefined;
        }),
        catchError(error => {
          console.error(`Error fetching participant ${id}:`, error);
          return of(undefined);
        })
      );
  }

  searchParticipants(query: string): Observable<Participant[]> {
    const params = new HttpParams().set('query', query);
    const options = this.getHttpOptions();
    
    return this.http.get<RegistrationResponse>(
      `${this.apiUrl}/registrations`, 
      { ...options, params }
    ).pipe(
      map(response => {
        if (response && response.success && response.registrations) {
          return response.registrations.map((reg: any) => this.mapToParticipant(reg));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error searching registrations:', error);
        return of([]);
      })
    );
  }

  filterParticipants(filters: Partial<Participant>): Observable<Participant[]> {
    // Build query params based on filters
    let params = new HttpParams();
    
    if (filters.eventType) {
      params = params.set('eventType', filters.eventType);
    }
    
    if (filters.gender) {
      params = params.set('gender', filters.gender);
    }
    
    // Add other filter parameters as needed
    const options = this.getHttpOptions();
    
    return this.http.get<RegistrationResponse>(
      `${this.apiUrl}/registrations`, 
      { ...options, params }
    ).pipe(
      map(response => {
        if (response && response.success && response.registrations) {
          return response.registrations.map((reg: any) => this.mapToParticipant(reg));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error filtering registrations:', error);
        return of([]);
      })
    );
  }

  // Private helper method to map API response to our Participant model
  private mapToParticipant(data: any): Participant {
    // Map API fields to our model with proper field names from the API response
    return {
      id: data.id || 0,
      name: data.participantName || '',
      email: data.email || '',
      phone: data.contactNumber || '',
      age: parseInt(data.age) || 0,
      gender: data.gender || '',
      dob: data.dob ? new Date(data.dob) : new Date(),
      aadharNumber: data.aadhar || '',
      bloodGroup: data.bloodGroup || '',
      emergencyContact: data.emergencyContact || '',
      eventType: this.getEventTypeFromName(data.eventName),
      tshirtSize: data.tsize || '',
      category: this.getCategoryFromEventType(this.getEventTypeFromName(data.eventName)),
      registrationDate: data.registrationDate ? new Date(data.registrationDate) : new Date(),
      photo: data.photo || '',
      pledgeAgree: data.pledgeAgree || false,
      medicalConditions: data.medicalConditions || '',
      toString() { return this.name; }
    };
  }

  // Helper method to convert API's eventName to our internal eventType
  private getEventTypeFromName(eventName: string): string {
    if (!eventName) return '';
    
    const normalized = eventName.toLowerCase();
    if (normalized.includes('marathon')) return 'marathon';
    if (normalized.includes('kidathon')) return 'kidathon';
    if (normalized.includes('kingwalkathon')) return 'kingwalkathon';
    if (normalized.includes('walkathon')) return 'walkathon_disabled';
    if (normalized.includes('drawing')) return 'drawing';
    if (normalized.includes('poetry')) return 'poetry';
    
    return eventName.toLowerCase();
  }

  // Helper method to derive category from eventType
  private getCategoryFromEventType(eventType: string): string {
    switch (eventType) {
      case 'marathon':
        return 'full';
      case 'kidathon':
        return 'half';
      case 'kingwalkathon':
        return 'fun';
      default:
        return eventType || '';
    }
  }
} 