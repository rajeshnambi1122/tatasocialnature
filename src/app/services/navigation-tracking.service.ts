import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationTrackingService {
  constructor(
    private router: Router,
    private analyticsService: AnalyticsService
  ) {
    this.setupNavigationTracking();
  }

  private setupNavigationTracking(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Get the route URL
      const url = event.urlAfterRedirects;
      
      // Extract page name from URL (remove leading slash and query params)
      const pageName = url.split('/').pop().split('?')[0] || 'home';
      
      // Track the page view
      this.analyticsService.trackPageView(pageName);
    });
  }
} 