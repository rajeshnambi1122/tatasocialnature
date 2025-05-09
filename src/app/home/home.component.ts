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
    { src: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2070&auto=format&fit=crop', alt: 'Marathon Runners' },
    { src: 'https://images.unsplash.com/photo-1519677584237-752f8853252e?q=80&w=2070&auto=format&fit=crop', alt: 'Marathon Event' },
    { src: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2067&auto=format&fit=crop', alt: 'Marathon Finish Line' }
  ];
  
  tirunelveliImages = [
    { src: 'https://www.tourmyindia.com/blog//wp-content/uploads/2021/06/Nellaiappar-Temple-Tirunelveli-Tamil-Nadu.jpg', alt: 'Nellaiappar Temple' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Tirunelveli_Halwa.jpg', alt: 'Famous Tirunelveli Halwa' },
    { src: 'https://www.tourmyindia.com/blog//wp-content/uploads/2021/06/Thamirabarani-River-Tirunelveli-Tamil-Nadu.jpg', alt: 'Thamirabarani River' }
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
