import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../translate.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-toggle-bar" (click)="toggleLanguage()">
      <div class="toggle-track" [class.active]="(currentLang$ | async) === 'ta'">
        <div class="toggle-thumb"></div>
      </div>
      <span class="lang-text" [class.active]="(currentLang$ | async) === 'en'">EN</span>
      <span class="lang-text" [class.active]="(currentLang$ | async) === 'ta'">த</span>
    </div>
  `,
  styles: [`
    .language-toggle-bar {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      padding: 4px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    @media (max-width: 576px) {
      .language-toggle-bar {
        width: 70px;
        min-width: 70px;
        max-width: 70px;
      }
    }
    .toggle-track {
      position: relative;
      width: 32px;
      min-width: 32px;
      max-width: 32px;
      height: 20px;
      background: #e0e0e0;
      border-radius: 12px;
      transition: all 0.3s ease;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .toggle-track.active {
      background: var(--primary-color);
    }
    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }
    .toggle-track.active .toggle-thumb {
      transform: translateX(12px);
    }
    .lang-text {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      transition: all 0.3s ease;
      width: 18px;
      min-width: 18px;
      max-width: 18px;
      display: inline-block;
      text-align: center;
      flex-shrink: 0;
      line-height: 1;
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