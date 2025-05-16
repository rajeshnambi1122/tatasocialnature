import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../translate.service';
import { TranslatePipe } from '../translate.pipe';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MetaService } from '../services/meta.service';
import { RegistrationService } from '../services/registration.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-application-register',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, ReactiveFormsModule, HttpClientModule],
  templateUrl: './application-register.component.html',
  styleUrls: ['./application-register.component.css']
})
export class ApplicationRegisterComponent implements OnInit {
  registrationForm: FormGroup;
  selectedEventType: string = ''; 
  showAgeWarning: boolean = false;
  currentLang$: Observable<string>;
  isSubmitting: boolean = false;
  submissionSuccess: boolean = false;
  submissionError: string = '';
  selectedFile: File | null = null;
  participantNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService,
    private metaService: MetaService,
    private registrationService: RegistrationService
  ) {
    this.currentLang$ = this.translateService.getCurrentLanguage();
    
    this.registrationForm = this.fb.group({
      eventType: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      dob: ['', Validators.required],
      age: [{value: '', disabled: true}],
      gender: ['', Validators.required],
      aadharNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      bloodGroup: ['', Validators.required],
      photo: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emergencyContact: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      tshirtSize: ['', Validators.required],
      pledgeAgree: [false, Validators.requiredTrue],
      declarationAgree: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.translateService.setLanguage(savedLang).subscribe();
    this.setMetaTags();

    // Subscribe to event type changes
    this.registrationForm.get('eventType')?.valueChanges.subscribe(value => {
      this.selectedEventType = value;
    });

    // Subscribe to DOB changes for age calculation
    this.registrationForm.get('dob')?.valueChanges.subscribe(dob => {
      if (dob) {
        const age = this.calculateAge(new Date(dob));
        this.registrationForm.get('age')?.setValue(age);
        this.validateAgeForEvent(age);
      }
    });
  }

  private setMetaTags(): void {
    this.metaService.setMetaTags({
      title: 'Register | TP Marathon 2025',
      description: 'Register for the Tirunelveli-Palayamkottai Marathon 2025. Open for various age groups and categories.',
      keywords: 'marathon registration, Tirunelveli marathon, register race, marathon sign up, marathon entry',
      ogTitle: 'Register for TP Marathon 2025',
      ogDescription: 'Join runners from across the region at the Tirunelveli-Palayamkottai Marathon 2025. Register now!',
      canonicalUrl: 'https://tpmarathon.com/register'
    });
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  validateAgeForEvent(age: number) {
    const eventType = this.registrationForm.get('eventType')?.value;
    let isValid = true;

    switch(eventType) {
      case 'marathon':
        isValid = age <= 60;
        break;
      case 'kidathon':
        isValid = age <= 10;
        break;
      case 'kingwalkathon':
        isValid = true;
        break;
      case 'walkathon_disabled':
        isValid = age >60; // All ages allowed
        break;
      case 'drawing':
      case 'poetry':
        isValid = age >= 5 && age <= 18; // Assuming school students
        break;
    }

    this.showAgeWarning = !isValid;
    if (!isValid) {
      this.registrationForm.get('eventType')?.setErrors({ 'invalidAge': true });
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.registrationForm.get('photo')?.setErrors({ 'invalidType': true });
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.registrationForm.get('photo')?.setErrors({ 'invalidSize': true });
        return;
      }

      this.selectedFile = file;
      this.registrationForm.patchValue({ photo: file });
    }
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      this.submissionError = '';
      
      const formData = new FormData();
      
      // Map form values to API field names based on the curl command
      formData.append('eventName', this.getEventNameMapping(this.registrationForm.get('eventType')?.value));
      formData.append('participantName', this.registrationForm.get('name')?.value);
      formData.append('dob', this.registrationForm.get('dob')?.value);
      formData.append('age', this.registrationForm.get('age')?.value);
      formData.append('gender', this.registrationForm.get('gender')?.value === 'male' ? 'Male' : 'Female');
      formData.append('aadhar', this.registrationForm.get('aadharNumber')?.value);
      formData.append('bloodGroup', this.registrationForm.get('bloodGroup')?.value);
      
      // Append the image file
      if (this.selectedFile) {
        formData.append('imageFile', this.selectedFile);
      }
      
      formData.append('email', this.registrationForm.get('email')?.value);
      formData.append('contactNumber', this.registrationForm.get('phone')?.value);
      formData.append('emergencyContact', this.registrationForm.get('emergencyContact')?.value);
      formData.append('tsize', this.registrationForm.get('tshirtSize')?.value);
      
      // Submit to API
      this.registrationService.submitRegistration(formData).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.isSubmitting = false;
          this.submissionSuccess = true;
          
          // Store participant number from the response
          if (response) {
            console.log('Full API response:', response);
            
            // Try to extract from the response message first
            if (response.message) {
              console.log('Response message:', response.message);
              // Extract participant number from message like "Data inserted successfully and the paticipant number is: 9"
              const match = response.message.match(/paticipant number is: (\d+)/i);
              console.log('Regex match result:', match);
              
              if (match && match[1]) {
                this.participantNumber = match[1];
                console.log('Extracted participant number from regex:', this.participantNumber);
              } else {
                // If no match found with the regex, try a direct extraction from the end of the string
                const parts = response.message.split(':');
                if (parts.length > 1) {
                  const potentialNumber = parts[parts.length - 1].trim();
                  if (!isNaN(Number(potentialNumber))) {
                    this.participantNumber = potentialNumber;
                    console.log('Extracted participant number from split:', this.participantNumber);
                  }
                }
              }
            }
            
            // If still no participant number and response is the number itself
            if (!this.participantNumber && typeof response === 'number') {
              this.participantNumber = response.toString();
              console.log('Using response as participant number:', this.participantNumber);
            }
            
            // If still no participant number, check if it's directly in the response object
            if (!this.participantNumber && response.participantNumber) {
              this.participantNumber = response.participantNumber.toString();
              console.log('Using response.participantNumber:', this.participantNumber);
            }
            
            // Last resort: use any numeric field that might contain the participant number
            if (!this.participantNumber) {
              for (const key in response) {
                if (typeof response[key] === 'number' || 
                   (typeof response[key] === 'string' && !isNaN(Number(response[key])))) {
                  console.log('Potential number field found:', key, response[key]);
                  this.participantNumber = response[key].toString();
                  break;
                }
              }
            }
          }
          
          this.registrationForm.reset();
          window.scrollTo(0, 0);
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.isSubmitting = false;
          this.submissionError = error.message || 'Something went wrong. Please try again later.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.registrationForm);
      
      // Find first invalid control and scroll to it
      this.scrollToFirstInvalidControl();
      
      // Show a toast or alert about the form errors
      this.submissionError = 'Please correct the errors in the form before submitting.';
      
      // Scroll to the error summary
      setTimeout(() => {
        const errorSummary = document.querySelector('.form-error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }
  
  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  // Scroll to the first invalid control in the form
  private scrollToFirstInvalidControl() {
    const firstInvalidControl = document.querySelector('.has-error');
    
    if (firstInvalidControl) {
      // Wait for DOM to update before scrolling
      setTimeout(() => {
        firstInvalidControl.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 100);
    }
  }

  // Map internal event types to API event names
  getEventNameMapping(eventType: string): string {
    switch(eventType) {
      case 'marathon':
        return 'Marathon';
      case 'kidathon':
        return 'Kidathon';
      case 'kingwalkathon':
        return 'Kingwalkathon';
      case 'walkathon_disabled':
        return 'Walkathon';
      case 'drawing':
        return 'Drawing';
      case 'poetry':
        return 'Poetry';
      default:
        return eventType;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['pattern']) {
      switch(controlName) {
        case 'aadharNumber':
          return 'Aadhar number must be 12 digits';
        case 'phone':
        case 'emergencyContact':
          return 'Phone number must be 10 digits';
        case 'name':
          return 'Name should only contain letters and spaces';
        default:
          return 'Invalid format';
      }
    }
    if (errors['invalidAge']) return 'Age does not meet event requirements';
    if (errors['invalidType']) return 'Please select an image file';
    if (errors['invalidSize']) return 'File size should be less than 2MB';
    
    return '';
  }
}
