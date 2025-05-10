import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../translate.service';
import { TranslatePipe } from '../translate.pipe';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-application-register',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, ReactiveFormsModule],
  templateUrl: './application-register.component.html',
  styleUrls: ['./application-register.component.css']
})
export class ApplicationRegisterComponent implements OnInit {
  registrationForm: FormGroup;
  selectedEventType: string = '';
  isSchoolEvent: boolean = false;
  showAgeWarning: boolean = false;
  currentLang$: Observable<string>;

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.currentLang$ = this.translateService.getCurrentLanguage();
    
    this.registrationForm = this.fb.group({
      eventType: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      dob: ['', Validators.required],
      age: [{value: '', disabled: true}],
      gender: ['', Validators.required],
      aadharNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      schoolName: [''],
      standard: [''],
      bloodGroup: ['', Validators.required],
      photo: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emergencyContact: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      tshirtSize: ['', Validators.required],
      pledgeAgree: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.translateService.setLanguage(savedLang).subscribe();

    // Subscribe to event type changes
    this.registrationForm.get('eventType')?.valueChanges.subscribe(value => {
      this.selectedEventType = value;
      this.isSchoolEvent = value === 'drawing' || value === 'poetry';
      
      // Update validators for school-related fields
      const schoolNameControl = this.registrationForm.get('schoolName');
      const standardControl = this.registrationForm.get('standard');
      
      if (this.isSchoolEvent) {
        schoolNameControl?.setValidators([Validators.required]);
        standardControl?.setValidators([Validators.required]);
      } else {
        schoolNameControl?.clearValidators();
        standardControl?.clearValidators();
      }
      
      schoolNameControl?.updateValueAndValidity();
      standardControl?.updateValueAndValidity();
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
        isValid = age >= 10 && age <= 60;
        break;
      case 'kidathon':
        isValid = age <= 10;
        break;
      case 'kingwalkathon':
        isValid = age > 60;
        break;
      case 'walkathon_disabled':
        isValid = true; // All ages allowed
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

      this.registrationForm.patchValue({ photo: file });
    }
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log(this.registrationForm.value);
      // Handle form submission
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registrationForm.controls).forEach(key => {
        const control = this.registrationForm.get(key);
        control?.markAsTouched();
      });
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
