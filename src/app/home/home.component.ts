import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isMobileMenuOpen = false;
  currentSlideIndex = 0;
  tirunelveliSlideIndex = 0;
  
  carouselImages = [
    { src: 'images/gallery1.jpg', alt: 'Marathon Event' },
    { src: 'images/gallery2.jpg', alt: 'Runners in Action' },
    { src: 'images/gallery3.jpg', alt: 'Marathon Participants' }
  ];
  
  tirunelveliImages = [
    { src: 'images/ten1.jpeg', alt: 'Nellaiappar Temple' },
    { src: 'images/ten2.jpeg', alt: 'Famous Tirunelveli Halwa' },
    { src: 'images/ten3.jpeg', alt: 'Thamirabarani River' },
    { src: 'images/ten4.jpeg', alt: 'City Landscape' },
    { src: 'images/ten5.jpeg', alt: 'Cultural Heritage' }
  ];
  
  autoSlideInterval: any;
  
  ngOnInit() {
    // Auto-slide every 5 seconds
    this.startAutoSlide();
  }
  
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.carouselImages.length;
  }
  
  prevSlide() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
    // Reset auto-slide timer when manually changing slides
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }
  
  nextTirunelveliSlide() {
    this.tirunelveliSlideIndex = (this.tirunelveliSlideIndex + 1) % this.tirunelveliImages.length;
    // Reset auto-slide timer when manually changing slides
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }
  
  prevTirunelveliSlide() {
    this.tirunelveliSlideIndex = (this.tirunelveliSlideIndex - 1 + this.tirunelveliImages.length) % this.tirunelveliImages.length;
    // Reset auto-slide timer when manually changing slides
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }
}
