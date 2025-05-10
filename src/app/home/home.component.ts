import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../translate.service';
import { TranslatePipe } from '../translate.pipe';
import { Observable } from 'rxjs';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LanguageToggleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isMobileMenuOpen = false;
  currentSlideIndex = 0;
  tirunelveliSlideIndex = 0;
  gallerySlideIndex = 0;
  currentLang$: Observable<string>;
  
  carouselImages = [
    { src: 'images/gallery1.jpg', alt: 'Marathon Event' },
    { src: 'images/gallery2.jpg', alt: 'Runners in Action' },
    { src: 'images/gallery3.jpg', alt: 'Marathon Participants' }
  ];
  
  gallerySectionImages = [
    { src: 'images/gallery1.jpg', alt: 'Gallery Image 1' },
    { src: 'images/gallery2.jpg', alt: 'Gallery Image 2' },
    { src: 'images/gallery3.jpg', alt: 'Gallery Image 3' },
    { src: 'images/gallery4.jpg', alt: 'Gallery Image 4' },
    { src: 'images/gallery5.jpg', alt: 'Gallery Image 5' },
    { src: 'images/gallery6.jpg', alt: 'Gallery Image 6' },
    { src: 'images/gallery7.jpg', alt: 'Gallery Image 7' },
    { src: 'images/gallery8.jpg', alt: 'Gallery Image 8' },
    { src: 'images/gallery9.jpg', alt: 'Gallery Image 9' },
    { src: 'images/gallery10.jpg', alt: 'Gallery Image 10' },
    { src: 'images/gallery11.jpg', alt: 'Gallery Image 11' }
  ];
  
  tirunelveliImages = [
    { src: 'images/ten1.jpeg', alt: 'Tirunelveli Railway Station' },
    { src: 'images/ten2.jpeg', alt: 'Tirunelveli Railway Station' },
    { src: 'images/ten3.jpeg', alt: 'Thamirabarani River' },
    { src: 'images/ten4.jpeg', alt: 'World Famous Halwa' },
    { src: 'images/ten5.jpeg', alt: 'Cultural Heritage' }
  ];
  
  autoSlideInterval: any;
  
  constructor(
    private viewportScroller: ViewportScroller,
    public translateService: TranslateService
  ) {
    this.currentLang$ = this.translateService.getCurrentLanguage();
  }
  
  ngOnInit() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.switchLanguage(savedLang);
    this.startAutoSlide();
  }
  
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
      this.nextTirunelveliSlide();
      this.nextGallerySlide();
    }, 5000);
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.isMobileMenuOpen = false;
    }
  }
  
  switchLanguage(lang: string) {
    this.translateService.setLanguage(lang).subscribe();
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
  
  nextGallerySlide() {
    this.gallerySlideIndex = (this.gallerySlideIndex + 1) % this.gallerySectionImages.length;
  }
  
  prevGallerySlide() {
    this.gallerySlideIndex = (this.gallerySlideIndex - 1 + this.gallerySectionImages.length) % this.gallerySectionImages.length;
    // Reset auto-slide timer when manually changing slides
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }
}
