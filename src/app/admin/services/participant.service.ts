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
  category: string;
  registrationDate: Date;
  emergencyContact: string;
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
      gender: 'Male',
      category: 'full',
      registrationDate: new Date('2024-01-15'),
      emergencyContact: 'Jane Doe (1234567890)',
      toString() { return this.name; }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      age: 25,
      gender: 'Female',
      category: 'half',
      registrationDate: new Date('2024-01-16'),
      emergencyContact: 'John Smith (0987654321)',
      toString() { return this.name; }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '5555555555',
      age: 35,
      gender: 'Male',
      category: 'fun',
      registrationDate: new Date('2024-01-17'),
      emergencyContact: 'Sarah Johnson (5555555555)',
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