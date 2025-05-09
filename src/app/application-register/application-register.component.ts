import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-application-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './application-register.component.html',
  styleUrl: './application-register.component.css'
})
export class ApplicationRegisterComponent {
  formData: any = {
    eventType: '',
    name: '',
    dob: '',
    age: null,
    gender: '',
    aadhar: '',
    school: '',
    standard: '',
    bloodGroup: '',
    email: '',
    phone: '',
    emergency: '',
    tshirtSize: '',
    agreePledge: false,
    photoFileName: ''
  };

  isSchoolEvent = false;
  showAgeWarning = false;

  onEventTypeChange() {
    this.isSchoolEvent = this.formData.eventType === 'drawing' || this.formData.eventType === 'poetry';
    this.validateAge();
  }

  calculateAge() {
    if (this.formData.dob) {
      const today = new Date();
      const birthDate = new Date(this.formData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const month = today.getMonth() - birthDate.getMonth();
      
      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      this.formData.age = age;
      this.validateAge();
    }
  }

  onDobInput(event: any) {
    this.calculateAge();
  }

  validateAge() {
    this.showAgeWarning = false;
    
    if (this.formData.age !== null && this.formData.eventType) {
      if (this.formData.eventType === 'marathon' && (this.formData.age < 10 || this.formData.age > 60)) {
        this.showAgeWarning = true;
      } else if (this.formData.eventType === 'kidathon' && this.formData.age > 10) {
        this.showAgeWarning = true;
      } else if (this.formData.eventType === 'kingwalkathon' && this.formData.age < 60) {
        this.showAgeWarning = true;
      }
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formData.photoFileName = file.name;
      // Handle file upload logic here
    }
  }

  onSubmit() {
    // Form submission logic
    console.log('Form submitted:', this.formData);
    alert('Registration successful! Thank you for registering.');
    // Here you would typically send the data to your backend
  }
}
