import { Injectable } from '@angular/core';
import { inject, track } from '@vercel/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor() {
    // Initialize Vercel Analytics
    inject();
  }

  /**
   * Track a custom event
   * 
   * @param eventName The name of the event to track
   * @param properties Optional properties to include with the event
   */
  trackEvent(eventName: string, properties?: Record<string, string | number | boolean>) {
    track(eventName, properties);
  }

  /**
   * Track a page view
   * 
   * @param pageName The name of the page being viewed
   */
  trackPageView(pageName: string) {
    this.trackEvent('page_view', { page: pageName });
  }
} 