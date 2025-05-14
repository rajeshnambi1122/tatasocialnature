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
  
  stats = {
    total: 0,
    fullMarathon: 0,
    halfMarathon: 0,
    funRun: 0
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
      category: ['']
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
          participant.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
        
        const matchesCategory = !filters.category || participant.category === filters.category;

        return matchesSearch && matchesCategory;
      })
    );
    this.currentPage = 1;
  }

  updateStats(): void {
    this.stats = {
      total: this.participants.length,
      fullMarathon: this.participants.filter(p => p.category === 'full').length,
      halfMarathon: this.participants.filter(p => p.category === 'half').length,
      funRun: this.participants.filter(p => p.category === 'fun').length
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
  setQuickFilter(category: string): void {
    this.searchForm.get('category')?.setValue(category);
  }
  
  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
  }
  
  resetFilters(): void {
    this.searchForm.reset({
      searchQuery: '',
      category: ''
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
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'Category', 'Registration Date', 'Emergency Contact'];
    const csvContent = [
      headers.join(','),
      ...this.filteredParticipants.map(p => [
        p.id,
        p.name,
        p.email,
        p.phone,
        p.age,
        p.gender,
        p.category,
        p.registrationDate,
        p.emergencyContact
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
} 