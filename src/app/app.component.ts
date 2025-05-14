import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetaService } from './services/meta.service';
import { AnalyticsService } from './services/analytics.service';
import { NavigationTrackingService } from './services/navigation-tracking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'tpmarathon';
  isLoading = true;

  constructor(
    private metaService: MetaService,
    private analyticsService: AnalyticsService,
    private navigationTracking: NavigationTrackingService
  ) {
    // NavigationTrackingService is initialized by injection
  }

  ngOnInit() {
    // Initialize default metatags
    this.metaService.setMetaTags({});
    
    // Track initial page view
    this.analyticsService.trackPageView('home');
    
    // Loading animation simulation
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }
}
