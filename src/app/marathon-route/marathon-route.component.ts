import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../translate.service';
import { TranslatePipe } from '../translate.pipe';
import { Observable } from 'rxjs';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-marathon-route',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LanguageToggleComponent],
  templateUrl: './marathon-route.component.html',
  styleUrls: ['./marathon-route.component.css']
})
export class MarathonRouteComponent implements OnInit {
  currentLang$: Observable<string>;
  isMobileMenuOpen = false;
  
  constructor(
    public translateService: TranslateService,
    private metaService: MetaService
  ) {
    this.currentLang$ = this.translateService.getCurrentLanguage();
  }
  
  ngOnInit() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.switchLanguage(savedLang);
    this.setMetaTags();
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // When opening the menu, add a class to prevent body scrolling
    if (this.isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }
  
  // Close mobile menu when clicking outside or resizing window
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if click is outside the menu and not on the hamburger button
    const targetElement = event.target as HTMLElement;
    const isMenuClick = targetElement.closest('ul') !== null;
    const isHamburgerClick = targetElement.closest('.hamburger-menu') !== null;
    
    if (this.isMobileMenuOpen && !isMenuClick && !isHamburgerClick) {
      this.isMobileMenuOpen = false;
      document.body.classList.remove('menu-open');
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isMobileMenuOpen && window.innerWidth > 992) {
      this.isMobileMenuOpen = false;
      document.body.classList.remove('menu-open');
    }
  }
  
  private setMetaTags(): void {
    this.metaService.setMetaTags({
      title: 'Marathon Route | TP Marathon 2025',
      description: 'Explore the full marathon route for the Tirunelveli-Palayamkottai Marathon 2025. View maps, checkpoints, and aid stations.',
      keywords: 'marathon route, Tirunelveli marathon map, race course',
      ogTitle: 'TP Marathon 2025 - Race Route Map',
      ogDescription: 'View the complete route map for the Tirunelveli-Palayamkottai Marathon 2025',
      canonicalUrl: 'https://tpmarathon.com/route'
    });
  }
  
  switchLanguage(lang: string) {
    this.translateService.setLanguage(lang).subscribe();
  }
} 