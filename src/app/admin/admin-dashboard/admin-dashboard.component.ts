import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParticipantService, Participant } from '../services/participant.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MetaService } from '../../services/meta.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../translate.pipe';
import { HttpErrorResponse } from '@angular/common/http';

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
export class AdminDashboardComponent implements OnInit, OnDestroy {
  participants: Participant[] = [];
  filteredParticipants: Participant[] = [];
  searchForm: FormGroup;
  loading = false;
  error = '';
  selectedParticipant: Participant | null = null;
  showDetailsModal = false;
  lastUpdated = new Date();
  Math = Math; // For accessing Math in the template
  
  // Debug mode for testing images
  debugMode = false;
  
  // Mobile responsive additions
  showScrollButton = false;
  
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

  // Excel upload properties
  selectedExcelFile: File | null = null;
  isUploading = false;
  isDragging = false;
  uploadResult: { success: boolean, message: string, count?: number } | null = null;

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
    
    // Add scroll event listener for mobile UI features
    window.addEventListener('scroll', this.handleScroll.bind(this));
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
    this.error = '';
    
    // Check if token exists before making the request
    const token = localStorage.getItem('admin_token');
    if (!token) {
      this.error = 'Authentication token not found. Please login again.';
      this.loading = false;
      this.router.navigate(['/admin/login']);
      return;
    }
    
    console.log('Using token:', token.substring(0, 20) + '...' + token.substring(token.length - 20));
    
    // Define a retry function for multiple attempts
    const fetchWithRetry = (attempt = 1) => {
      const maxAttempts = 3;
      
    this.participantService.getParticipants().subscribe({
      next: (data) => {
          if (data && data.length > 0) {
        this.participants = data;
        this.filteredParticipants = this.sortData([...data]);
        this.updateStats();
            this.lastUpdated = new Date();
          } else {
            console.warn('No participants data returned from API');
            this.participants = [];
            this.filteredParticipants = [];
            this.updateStats();
          }
        this.loading = false;
      },
      error: (err) => {
          console.error(`Error loading participants (attempt ${attempt}/${maxAttempts}):`, err);
          
          // Check for CORS error
          if (err.name === 'HttpErrorResponse' && 
              (err.message.includes('CORS') || err.message.includes('Access-Control'))) {
            this.error = 'CORS error detected. API access is restricted. Please contact administrator.';
          } 
          // Session expired or unauthorized
          else if (err.status === 401 || err.status === 403) {
            this.error = 'Session expired or unauthorized. Please login again.';
            localStorage.removeItem('admin_token');
            this.router.navigate(['/admin/login']);
          } 
          // Retry logic
          else if (attempt < maxAttempts) {
            this.error = `Loading attempt ${attempt} failed. Retrying...`;
            setTimeout(() => fetchWithRetry(attempt + 1), 1000); // Wait 1 second before retry
            return;
          } 
          // Max attempts reached
          else {
            this.error = 'Failed to load participants after multiple attempts. Please try again later.';
          }
          
        this.loading = false;
      }
    });
    };
    
    // Start the fetch process with retry logic
    fetchWithRetry();
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
    
    // Log the image data to help with debugging
    if (participant.photo) {
      console.log('Participant photo data:', {
        length: participant.photo.length,
        startsWithDataImage: participant.photo.startsWith('data:image'),
        snippet: participant.photo.substring(0, 50) + '...'
      });
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedParticipant = null;
  }
  
  // Safe method to get participant photo URL with fallback
  getParticipantPhotoUrl(participant: Participant): string {
    if (!participant || !participant.photo) {
      return ''; // No photo available
    }
    
    try {
      // Make sure the URL is valid
      if (!participant.photo.startsWith('data:image')) {
        console.warn('Invalid photo URL format for participant:', participant.id);
        return '';
      }
      
      return participant.photo;
    } catch (err) {
      console.error('Error retrieving participant photo:', err);
      return '';
    }
  }
  
  // Handle image errors with proper type casting
  handleImageError(event: Event): void {
    console.error('Image failed to load');
    
    // Type cast to HTMLImageElement to access style property
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.style) {
      imgElement.style.display = 'none';
    }
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
      'Blood Group', 'Event Type', 'T-shirt Size', 'Registration Date', 'Emergency Contact'];
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
        `"${p.emergencyContact}"`
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
  
  // Print participant details
  printParticipantDetails(): void {
    if (!this.selectedParticipant) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const participant = this.selectedParticipant;
    const eventType = this.getEventTypeDisplay(participant.eventType);
    
    // Create print document HTML
    printWindow.document.write(`
      <html>
        <head>
          <title>Participant Details - ${participant.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #ddd;
            }
            .print-header h1 {
              margin: 0;
              color: #2c3e50;
              font-size: 24px;
            }
            .print-header p {
              margin: 5px 0 0;
              color: #7f8c8d;
              font-size: 16px;
            }
            .participant-name {
              font-size: 28px;
              margin: 20px 0 10px;
              color: #2c3e50;
            }
            .event-badge {
              display: inline-block;
              padding: 5px 15px;
              background-color: #3498db;
              color: white;
              border-radius: 20px;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section {
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .info-section h3 {
              margin: 0;
              padding: 10px 15px;
              background-color: #f5f7fa;
              border-bottom: 1px solid #ddd;
              font-size: 18px;
              color: #2c3e50;
            }
            .info-content {
              padding: 10px 15px;
            }
            .info-row {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              flex: 0 0 40%;
              font-weight: bold;
              color: #7f8c8d;
            }
            .info-value {
              flex: 1;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 14px;
              color: #95a5a6;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Halwa City Marathon 2025</h1>
            <p>Participant Registration Details</p>
          </div>
          
          <h2 class="participant-name">${participant.name}</h2>
          <div class="event-badge">${eventType}</div>
          
          <div class="info-grid">
            <div class="info-section">
              <h3>Personal Information</h3>
              <div class="info-content">
                <div class="info-row">
                  <div class="info-label">Email</div>
                  <div class="info-value">${participant.email}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${participant.phone}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Age</div>
                  <div class="info-value">${participant.age}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Date of Birth</div>
                  <div class="info-value">${new Date(participant.dob).toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Gender</div>
                  <div class="info-value">${participant.gender}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Aadhar Number</div>
                  <div class="info-value">${participant.aadharNumber}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Blood Group</div>
                  <div class="info-value">${participant.bloodGroup}</div>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Marathon Details</h3>
              <div class="info-content">
                <div class="info-row">
                  <div class="info-label">Event Type</div>
                  <div class="info-value">${eventType}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">T-shirt Size</div>
                  <div class="info-value">${participant.tshirtSize || 'N/A'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Registration Date</div>
                  <div class="info-value">${new Date(participant.registrationDate).toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Registration ID</div>
                  <div class="info-value">#${participant.id.toString().padStart(4, '0')}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Participant ID</div>
                  <div class="info-value">${participant.participantId}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Emergency Contact</div>
                  <div class="info-value">${participant.emergencyContact}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This document was generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <button class="print-button" onclick="window.print(); window.close();" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
          </div>
          
          <script>
            // Auto-print when document is loaded
            window.onload = function() {
              // Small delay to ensure content is rendered
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  }

  // Method to use a specific token (for testing or when you have a token from somewhere else)
  useSpecificToken(token?: string): void {
    let tokenValue = token;
    
    if (!tokenValue) {
      // Prompt user to enter a token
      const promptValue = window.prompt('Enter your API token:', '');
      if (promptValue !== null) {
        tokenValue = promptValue;
      } else {
        return; // User cancelled the prompt
      }
    }
    
    // Check if it's a curl command and extract the token
    if (tokenValue.includes('curl') && tokenValue.includes('Bearer')) {
      const match = tokenValue.match(/Bearer\s+([^\s'"]+)/i);
      if (match && match[1]) {
        tokenValue = match[1];
      }
    }
    
    // Validate the token is not empty
    if (tokenValue.trim()) {
      const success = this.authService.setToken(tokenValue.trim());
      if (success) {
        this.error = '';
        console.log('Token set successfully');
        alert('Token set successfully. Refreshing data...');
        this.loadParticipants();
      } else {
        this.error = 'Failed to set authentication token';
      }
    } else {
      this.error = 'Invalid or empty token provided';
    }
  }

  downloadParticipantPhoto(): void {
    if (!this.selectedParticipant || !this.selectedParticipant.photo) return;
    
    try {
      const photoUrl = this.getParticipantPhotoUrl(this.selectedParticipant);
      if (!photoUrl) {
        console.error('Invalid photo URL for download');
        return;
      }
      
      // Create an anchor element and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = photoUrl;
      downloadLink.download = `${this.selectedParticipant.name.replace(/\s+/g, '_')}_photo.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Error downloading participant photo:', err);
      this.error = 'Failed to download the photo. Please try again.';
    }
  }

  // Excel file upload methods
  onExcelFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedExcelFile = input.files[0];
      console.log('Excel file selected:', this.selectedExcelFile.name);
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.isExcelFile(file)) {
        this.selectedExcelFile = file;
        console.log('Excel file dropped:', this.selectedExcelFile.name);
      } else {
        this.error = 'Invalid file type. Please upload an Excel file (.xlsx or .xls).';
      }
    }
  }
  
  isExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.includes(file.type) || 
           file.name.endsWith('.xlsx') || 
           file.name.endsWith('.xls');
  }
  
  clearExcelFile() {
    this.selectedExcelFile = null;
    this.uploadResult = null;
    
    // Reset the file input
    const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  
  uploadExcelFile() {
    if (!this.selectedExcelFile) {
      this.error = 'Please select an Excel file first.';
      return;
    }
    
    this.isUploading = true;
    this.error = '';
    this.uploadResult = null;
    
    this.participantService.uploadExcelFile(this.selectedExcelFile).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.isUploading = false;
        
        // Handle different response formats
        let message = 'File uploaded successfully.';
        let count = 0;
        
        if (response) {
          if (typeof response === 'string') {
            message = response;
          } else if (response.message) {
            message = response.message;
          } else if (response.status === 'OK' || response.success) {
            message = response.message || 'Excel file uploaded successfully.';
          }
          
          // Try to extract the count if available
          if (response.count) {
            count = response.count;
          } else if (typeof response === 'string' && response.includes('successfully')) {
            const match = response.match(/(\d+)\s+participants?/i);
            if (match && match[1]) {
              count = parseInt(match[1], 10);
            }
          }
        }
        
        this.uploadResult = {
          success: true,
          message: message,
          count: count || undefined
        };
        
        // Reload participants to reflect the new data
        this.loadParticipants();
        
        // Clear file after successful upload
        setTimeout(() => {
          this.clearExcelFile();
        }, 5000); // Clear after 5 seconds
      },
      error: (error: HttpErrorResponse) => {
        console.error('Upload failed:', error);
        this.isUploading = false;
        
        let errorMessage = 'Failed to upload the file. Please try again.';
        
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.uploadResult = {
          success: false,
          message: errorMessage
        };
      }
    });
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Toggle debug mode
  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
  }

  // Mobile navigation methods
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  handleScroll(): void {
    // Show scroll button when user scrolls down 300px
    this.showScrollButton = window.scrollY > 300;
  }
  
  // Clean up event listeners when component is destroyed
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }
} 