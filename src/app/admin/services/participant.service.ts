import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private apiUrl = 'api/participants'; // Replace with your actual API endpoint

  // Mock data for development
  private mockParticipants: Participant[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      age: 30,
      dob: new Date('1994-01-15'),
      gender: 'Male',
      aadharNumber: '123456789012',
      bloodGroup: 'O+',
      category: 'full',
      eventType: 'marathon',
      tshirtSize: 'L',
      registrationDate: new Date('2024-01-15'),
      emergencyContact: 'Jane Doe (1234567890)',
      photo: 'https://randomuser.me/api/portraits/men/1.jpg',
      pledgeAgree: true,
      toString() { return this.name; }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      age: 25,
      dob: new Date('1999-01-16'),
      gender: 'Female',
      aadharNumber: '098765432109',
      bloodGroup: 'A+',
      category: 'half',
      eventType: 'marathon',
      tshirtSize: 'M',
      registrationDate: new Date('2024-01-16'),
      emergencyContact: 'John Smith (0987654321)',
      photo: 'https://randomuser.me/api/portraits/women/1.jpg',
      pledgeAgree: true,
      toString() { return this.name; }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '5555555555',
      age: 35,
      dob: new Date('1989-01-17'),
      gender: 'Male',
      aadharNumber: '555555555555',
      bloodGroup: 'B-',
      category: 'fun',
      eventType: 'kidathon',
      tshirtSize: 'XL',
      registrationDate: new Date('2024-01-17'),
      emergencyContact: 'Sarah Johnson (5555555555)',
      photo: 'https://randomuser.me/api/portraits/men/2.jpg',
      pledgeAgree: true,
      toString() { return this.name; }
    }
  ];

  constructor(private http: HttpClient) { }

  getParticipants(): Observable<Participant[]> {
    // For development, return mock data
    return of(this.mockParticipants);
    
    // For production, use the actual API
    // return this.http.get<Participant[]>(this.apiUrl);
  }

  getParticipant(id: number): Observable<Participant | undefined> {
    const participant = this.mockParticipants.find(p => p.id === id);
    return of(participant);
  }

  searchParticipants(query: string): Observable<Participant[]> {
    const filtered = this.mockParticipants.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }

  filterParticipants(filters: Partial<Participant>): Observable<Participant[]> {
    let filtered = [...this.mockParticipants];
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    return of(filtered);
  }
} 