import { Component, OnInit, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../translate.service';
import { TranslatePipe } from '../translate.pipe';
import { Observable } from 'rxjs';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';
import { MetaService } from '../services/meta.service';

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
    { src: 'images/gallery11.jpg', alt: 'Gallery Image 11' },
    { src: 'images/gallery12.jpeg', alt: 'Gallery Image 12' }
  ];
  
  tirunelveliImages = [
    { src: 'images/ten1.jpeg', alt: 'Tirunelveli Railway Station' },
    { src: 'images/ten2.jpeg', alt: 'Tirunelveli Railway Station' },
    { src: 'images/ten3.jpeg', alt: 'Thamirabarani River' },
    { src: 'images/ten4.jpeg', alt: 'World Famous Halwa' },
    { src: 'images/ten5.jpeg', alt: 'Temple' },
    { src: 'images/ten6.jpeg', alt: 'Church' },
    { src: 'images/ten7.jpeg', alt: 'Cultural Heritage' },
    { src: 'images/ten8.jpeg', alt: 'Cultural Heritage' },
    { src: 'images/ten9.jpeg', alt: 'Cultural Heritage' },
    { src: 'images/ten10.jpeg', alt: 'Cultural Heritage' },
  ];
  
  autoSlideInterval: any;
  
  constructor(
    private viewportScroller: ViewportScroller,
    public translateService: TranslateService,
    private metaService: MetaService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.currentLang$ = this.translateService.getCurrentLanguage();
    
    // Subscribe to language changes to update the data-language attribute
    this.currentLang$.subscribe(lang => {
      this.renderer.setAttribute(this.el.nativeElement, 'data-language', lang);
    });
  }
  
  ngOnInit() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.switchLanguage(savedLang);
    this.startAutoSlide();
    this.setMetaTags();
  }
  
  private setMetaTags(): void {
    this.metaService.setMetaTags({
      title: 'TP Marathon 2025 | Tirunelveli-Palayamkottai Marathon',
      description: 'Join the Tirunelveli-Palayamkottai Marathon 2025. Run through beautiful scenery and historic landmarks in this iconic event.',
      keywords: 'marathon, Tirunelveli, Palayamkottai, running, sports event, Tamil Nadu marathon, fitness, race',
      ogTitle: 'TP Marathon 2025 - Run Through History',
      ogDescription: 'Register now for the Tirunelveli-Palayamkottai Marathon 2025 and be part of this spectacular event',
      canonicalUrl: 'https://tpmarathon.com'
    });
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
  
  // Close mobile menu when clicking outside nav
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Get the clicked element
    const target = event.target as HTMLElement;
    
    // Don't close if the hamburger button itself is clicked (toggleMobileMenu handles this)
    if (target.closest('.hamburger-menu')) {
      return;
    }
    
    // Don't close if clicking inside the menu
    if (this.isMobileMenuOpen && !target.closest('nav ul') && !target.closest('.right-nav')) {
      this.isMobileMenuOpen = false;
    }
  }
  
  // Close mobile menu when window resizes to larger screen
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth > 992 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
  
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.isMobileMenuOpen = false;
    }
  }
  
  switchLanguage(lang: string) {
    this.translateService.setLanguage(lang).subscribe(() => {
      // Update the data-language attribute when language changes
      this.renderer.setAttribute(this.el.nativeElement, 'data-language', lang);
    });
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
