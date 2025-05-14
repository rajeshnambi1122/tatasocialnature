import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParticipantService, Participant } from '../services/participant.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MetaService } from '../../services/meta.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../translate.pipe';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe
  ]
})
export class AdminDashboardComponent implements OnInit {
  participants: Participant[] = [];
  filteredParticipants: Participant[] = [];
  searchForm: FormGroup;
  loading = false;
  error = '';
  selectedParticipant: Participant | null = null;
  showDetailsModal = false;
  lastUpdated = new Date();
  Math = Math; // For accessing Math in the template
  
  // Sorting
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  
  // Comparison
  participantsToCompare: Participant[] = [];
  showComparisonModal = false;
  maxCompareCount = 3;
  
  stats = {
    total: 0,
    fullMarathon: 0,
    halfMarathon: 0,
    funRun: 0,
    walkathon_disabled: 0,
    drawing: 0,
    poetry: 0
  };

  constructor(
    private participantService: ParticipantService,
    private fb: FormBuilder,
    private metaService: MetaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      searchQuery: [''],
      eventType: ['']
    });
  }

  ngOnInit(): void {
    this.loadParticipants();
    this.setupSearchListener();
    this.setMetaTags();
  }

  private setMetaTags(): void {
    this.metaService.setMetaTags({
      title: 'Admin Dashboard | TP Marathon 2025',
      description: 'Administrative dashboard for managing TP Marathon 2025 participants and event details',
      keywords: 'admin, dashboard, marathon management, participant tracking, event management',
      ogTitle: 'TP Marathon Admin Dashboard',
      ogDescription: 'Securely manage participants and event details for the Tirunelveli-Palayamkottai Marathon 2025',
      robots: 'noindex, nofollow', // Prevent search engines from indexing the admin area
      canonicalUrl: 'https://tpmarathon.com/admin/dashboard'
    });
  }

  loadParticipants(): void {
    this.loading = true;
    this.participantService.getParticipants().subscribe({
      next: (data) => {
        this.participants = data;
        this.filteredParticipants = this.sortData([...data]);
        this.updateStats();
        this.loading = false;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        this.error = 'Failed to load participants. Please try again.';
        this.loading = false;
      }
    });
  }

  setupSearchListener(): void {
    this.searchForm.valueChanges.subscribe(filters => {
      this.applyFilters(filters);
    });
  }

  applyFilters(filters: any): void {
    this.filteredParticipants = this.sortData(
      this.participants.filter(participant => {
        const matchesSearch = !filters.searchQuery || 
          participant.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          participant.email.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          participant.aadharNumber.includes(filters.searchQuery);
        
        const matchesEventType = !filters.eventType || participant.eventType === filters.eventType;

        return matchesSearch && matchesEventType;
      })
    );
    this.currentPage = 1;
  }

  updateStats(): void {
    const marathonCount = this.participants.filter(p => p.eventType === 'marathon').length;
    const kidathonCount = this.participants.filter(p => p.eventType === 'kidathon').length;
    const kingWalkathonCount = this.participants.filter(p => p.eventType === 'kingwalkathon').length;
    const disabledWalkathonCount = this.participants.filter(p => p.eventType === 'walkathon_disabled').length;
    const drawingCount = this.participants.filter(p => p.eventType === 'drawing').length;
    const poetryCount = this.participants.filter(p => p.eventType === 'poetry').length;
    
    this.stats = {
      total: this.participants.length,
      fullMarathon: marathonCount,
      halfMarathon: kidathonCount,
      funRun: kingWalkathonCount,
      walkathon_disabled: disabledWalkathonCount,
      drawing: drawingCount,
      poetry: poetryCount
    };
  }
  
  // Sort data
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredParticipants = this.sortData([...this.filteredParticipants]);
  }
  
  sortData(data: Participant[]): Participant[] {
    return data.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortColumn === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (this.sortColumn === 'registrationDate') {
        comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
      } else if (this.sortColumn === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (this.sortColumn === 'age') {
        comparison = a.age - b.age;
      } else {
        // Default sort by ID
        comparison = a.id - b.id;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  
  // Pagination methods
  goToPage(page: number): void {
    this.currentPage = page;
  }
  
  getTotalPages(): number {
    return Math.ceil(this.filteredParticipants.length / this.pageSize);
  }
  
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }
  
  // Statistics and calculations
  getPercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }
  
  getMalePercentage(): number {
    const maleCount = this.participants.filter(p => p.gender === 'Male').length;
    return this.getPercentage(maleCount, this.participants.length);
  }
  
  // Quick filters
  setQuickFilter(eventType: string): void {
    this.searchForm.get('eventType')?.setValue(eventType);
  }
  
  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
  }
  
  resetFilters(): void {
    this.searchForm.reset({
      searchQuery: '',
      eventType: ''
    });
  }
  
  // Participant details modal
  viewDetails(participant: Participant): void {
    this.selectedParticipant = participant;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedParticipant = null;
  }
  
  // Helper methods
  getInitials(name: string): string {
    return name.split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  sendParticipantEmail(): void {
    if (!this.selectedParticipant) return;
    
    window.open(`mailto:${this.selectedParticipant.email}?subject=Marathon Registration Information&body=Hello ${this.selectedParticipant.name},%0D%0A%0D%0AThank you for registering for the marathon.%0D%0A%0D%0ABest regards,%0D%0AMarathon Organizers`, '_blank');
  }

  exportToCSV(): void {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'DOB', 'Gender', 'Aadhar Number', 
      'Blood Group', 'Event Type', 'T-shirt Size', 'Registration Date', 'Emergency Contact', 'Pledge Agreement'];
    const csvContent = [
      headers.join(','),
      ...this.filteredParticipants.map(p => [
        p.id,
        `"${p.name}"`,
        `"${p.email}"`,
        `"${p.phone}"`,
        p.age,
        new Date(p.dob).toLocaleDateString(),
        p.gender,
        `"${p.aadharNumber}"`,
        p.bloodGroup,
        `"${p.eventType}"`,
        p.tshirtSize || 'N/A',
        new Date(p.registrationDate).toLocaleDateString(),
        `"${p.emergencyContact}"`,
        p.pledgeAgree ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `marathon-participants-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  // Comparison related methods
  toggleCompareParticipant(participant: Participant): void {
    const index = this.participantsToCompare.findIndex(p => p.id === participant.id);
    
    if (index === -1) {
      // Add to comparison if not already selected and if we haven't reached the max
      if (this.participantsToCompare.length < this.maxCompareCount) {
        this.participantsToCompare.push(participant);
      }
    } else {
      // Remove from comparison
      this.participantsToCompare.splice(index, 1);
    }
  }
  
  isSelectedForComparison(participant: Participant): boolean {
    return this.participantsToCompare.some(p => p.id === participant.id);
  }
  
  canAddMoreToComparison(): boolean {
    return this.participantsToCompare.length < this.maxCompareCount;
  }
  
  clearComparison(): void {
    this.participantsToCompare = [];
    this.showComparisonModal = false;
  }
  
  openComparisonModal(): void {
    if (this.participantsToCompare.length > 1) {
      this.showComparisonModal = true;
    }
  }
  
  closeComparisonModal(): void {
    this.showComparisonModal = false;
  }
  
  // Helper methods for comparison
  getUniqueCategories(): string[] {
    return [...new Set(this.participantsToCompare.map(p => p.category))];
  }
  
  getUniqueGenders(): string[] {
    return [...new Set(this.participantsToCompare.map(p => p.gender))];
  }
  
  getAgeRange(): { min: number, max: number, avg: number } {
    const ages = this.participantsToCompare.map(p => p.age);
    return {
      min: Math.min(...ages),
      max: Math.max(...ages),
      avg: Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
    };
  }

  // Helper method to translate event type to display name
  getEventTypeDisplay(eventType: string): string {
    const eventTypes: { [key: string]: string } = {
      'marathon': 'Marathon (Upto 60 years)',
      'kidathon': 'Kidathon - Butterfly Walk & Run (Up to 10 years)',
      'kingwalkathon': 'King Walkathon (Above 60 years)',
      'walkathon_disabled': 'Walkathon - For Disabled (All ages)',
      'drawing': 'Drawing Competition (School students only)',
      'poetry': 'Poetry Competition (School students only)'
    };
    
    return eventTypes[eventType] || eventType;
  }
  
  // Helper method to check if any participant has medical conditions
  anyParticipantHasMedicalConditions(): boolean {
    return this.participantsToCompare.some(p => p.medicalConditions && p.medicalConditions.trim().length > 0);
  }
} 