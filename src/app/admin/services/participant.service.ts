import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Participant {
  id: number;
  participantId?: number;
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

// Paginated response interface
export interface PaginatedResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;   // page size
  first: boolean; // is first page
  last: boolean;  // is last page
  // Any other properties from the API response
}

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private apiUrl = 'https://halwa-marathon-production.up.railway.app/halwaCityMarathon';

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

  // New method for paginated participant retrieval
  getPaginatedParticipants(page: number = 0, size: number = 20, sortBy: string = 'id', sortDir: string = 'asc'): Observable<{
    participants: Participant[],
    totalElements: number,
    totalPages: number
  }> {
    // API URL format exactly matches the curl command format
    const url = `${this.apiUrl}/registrations?page=${page}&size=${size}`;
    
    console.log(`Getting paginated participants: ${url}`);
    
    return this.http.get<any>(url, this.getHttpOptions()).pipe(
      map(response => {
        console.log('Raw paginated API response:', response);
        
        // Default values
        let participants: any[] = [];
        let totalElements = 0;
        let totalPages = 1;
        
        // Response format from example (status/message/page structure)
        if (response && response.status === "OK" && response.message) {
          console.log('Found status/message structure');
          
          // Extract content array
          if (Array.isArray(response.message.content)) {
            participants = response.message.content;
          } else if (response.message.content) {
            participants = [response.message.content];
          }
          
          // Extract pagination details from page object
          if (response.message.page) {
            totalElements = response.message.page.totalElements || 0;
            totalPages = response.message.page.totalPages || 1;
            console.log(`Found pagination details in page object: totalElements=${totalElements}, totalPages=${totalPages}`);
          }
        }
        // Case 1: Spring Boot standard pagination response
        else if (response && Array.isArray(response.content)) {
          console.log('Found standard Spring pagination response');
          participants = response.content;
          totalElements = response.totalElements || 0;
          totalPages = response.totalPages || 1;
        }
        // Case 2: Custom API pagination format
        else if (response && response.registrations && Array.isArray(response.registrations)) {
          console.log('Found custom pagination format with registrations array');
          participants = response.registrations;
          totalElements = response.totalCount || participants.length;
          totalPages = Math.ceil(totalElements / size);
        }
        // Case 3: Direct array response
        else if (Array.isArray(response)) {
          console.log('Found direct array response');
          participants = response;
          totalElements = participants.length;
          totalPages = 1;
        }
        // Case 4: Nested response structure
        else if (response && response.message && response.message.content) {
          console.log('Found nested pagination response');
          if (Array.isArray(response.message.content)) {
            participants = response.message.content;
          } else {
            participants = [response.message.content];
          }
          totalElements = response.message.totalElements || participants.length;
          totalPages = response.message.totalPages || 1;
        }
        // Case 5: Unexpected structure - analyze and log it for debugging
        else {
          console.log('Unexpected response structure:', Object.keys(response));
          console.log('Response sample:', JSON.stringify(response).substring(0, 500) + '...');
          
          // Try to find an array property
          const arrayProps = Object.keys(response).filter(key => Array.isArray(response[key]));
          if (arrayProps.length > 0) {
            console.log('Found potential registration arrays:', arrayProps);
            participants = response[arrayProps[0]];
            totalElements = participants.length;
            // Estimate totalPages based on size
            totalPages = Math.max(1, Math.ceil(totalElements / size));
          }
        }
        
        // Map the participants
        const mappedParticipants = participants.map((reg: any) => this.mapToParticipant(reg));
        
        // Log pagination details for debugging
        console.log(`Pagination details: currentPage=${page}, pageSize=${size}`);
        console.log(`Found ${mappedParticipants.length} participants, totalElements=${totalElements}, totalPages=${totalPages}`);
        
        return {
          participants: mappedParticipants,
          totalElements,
          totalPages
        };
      }),
      catchError(error => {
        console.error('Error fetching paginated participants:', error);
        return of({
          participants: [],
          totalElements: 0,
          totalPages: 0
        });
      })
    );
  }
  
  // Original method (kept for backward compatibility)
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
            // Log the first registration to help debug image fields
            if (registrations[0]) {
              console.log('First registration data:', {
                hasImageField: 'image' in registrations[0],
                hasImageFileField: 'imageFile' in registrations[0],
                imageFieldType: typeof registrations[0].image,
                imageFileFieldType: typeof registrations[0].imageFile,
                imageFieldSnippet: registrations[0].image ? 
                  registrations[0].image.substring(0, 50) + '...' : 'undefined',
                imageFileSnippet: registrations[0].imageFile ? 
                  registrations[0].imageFile.substring(0, 50) + '...' : 'undefined'
              });
            }
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
      participantId: data.participantId || 1,
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
      photo: this.processImageData(data.image || data.imageFile),
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
      case 'walkathon_disabled':
        return 'walkathon';
      case 'drawing':
        return 'drawing';
      case 'poetry': 
        return 'poetry';
      default:
        return 'other';
    }
  }
  
  // New method for bulk upload of participants via Excel file
  uploadExcelFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Get token from localStorage
    const token = localStorage.getItem('admin_token');
    
    // Prepare headers with the auth token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Note: Don't set Content-Type header when using FormData, browser will set it with boundary
    
    return this.http.post<any>(
      `${this.apiUrl}/uploadExcel`, 
      formData,
      { headers }
    ).pipe(
      map(response => {
        console.log('Excel upload response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error uploading Excel file:', error);
        throw error;
      })
    );
  }

  // Helper method to properly process image data
  private processImageData(imageData: string | null | undefined): string {
    if (!imageData) {
      console.log('No image data provided');
      return '';
    }

    console.log('Processing image data:', {
      dataLength: imageData.length,
      startsWithDataImage: imageData.startsWith('data:image'),
      firstFewChars: imageData.substring(0, 20)
    });

    // If it's already a properly formatted data URL, return it
    if (imageData.startsWith('data:image')) {
      console.log('Image already has data:image prefix');
      return imageData;
    }

    // Fix for truncated base64 data (like from your example)
    if (imageData.startsWith('/9j/')) {
      console.log('Found JPEG base64 data without prefix, adding it');
      return `data:image/jpeg;base64,${imageData}`;
    }

    try {
      // Clean the string - sometimes there might be whitespace or newlines
      const cleanedData = imageData.trim();
      
      // Attempt direct image type detection instead of regex validation
      // This allows malformed base64 data to still attempt to display
      let imageType = 'jpeg'; // Default to JPEG
      
      if (cleanedData.startsWith('iVBOR')) {
        console.log('Detected PNG image from base64 signature');
        imageType = 'png';
      } else if (cleanedData.startsWith('R0lGOD')) {
        console.log('Detected GIF image from base64 signature');
        imageType = 'gif';
      } else if (cleanedData.startsWith('PHN2Z')) {
        console.log('Detected SVG image from base64 signature');
        imageType = 'svg+xml';
      } else if (cleanedData.startsWith('UklGR')) {
        console.log('Detected WebP image from base64 signature');
        imageType = 'webp';
      } else {
        console.log('Could not detect image type, using default (JPEG)');
      }
      
      // Always try to return something that might work
      return `data:image/${imageType};base64,${cleanedData}`;
    } catch (err) {
      console.error('Error processing image data:', err);
      // In case of error, still try to return something that might work
      return `data:image/jpeg;base64,${imageData}`;
    }
  }
} 