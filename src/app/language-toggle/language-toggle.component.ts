import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../translate.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-toggle" (click)="toggleLanguage()">
      <div class="toggle-track" [class.active]="(currentLang$ | async) === 'ta'">
        <div class="toggle-thumb"></div>
      </div>
      <span class="lang-text" [class.active]="(currentLang$ | async) === 'en'">EN</span>
      <span class="lang-text" [class.active]="(currentLang$ | async) === 'ta'">த</span>
    </div>
  `,
  styles: [`
    .language-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;
    }

    .language-toggle:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .toggle-track {
      position: relative;
      width: 50px;
      height: 24px;
      background: #e0e0e0;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .toggle-track.active {
      background: var(--primary-color);
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .toggle-track.active .toggle-thumb {
      transform: translateX(26px);
    }

    .lang-text {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      transition: all 0.3s ease;
    }

    .lang-text.active {
      color: var(--primary-color);
    }
  `]
})
export class LanguageToggleComponent implements OnInit {
  currentLang$: Observable<string>;
  private currentLang: string = 'en';

  constructor(private translateService: TranslateService) {
    this.currentLang$ = this.translateService.getCurrentLanguage();
    this.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngOnInit() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.translateService.setLanguage(savedLang).subscribe();
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'ta' : 'en';
    this.translateService.setLanguage(newLang).subscribe();
  }
} 