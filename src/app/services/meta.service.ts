import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface MetaTagConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  canonicalUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private defaultConfig: MetaTagConfig = {
    title: 'TP Marathon 2025',
    description: 'Official website for the Tirunelveli-Palayamkottai (TP) Marathon 2025',
    keywords: 'marathon, running, Tirunelveli, Palayamkottai, TP marathon, race, sports',
    ogTitle: 'TP Marathon 2025',
    ogDescription: 'Join the Tirunelveli-Palayamkottai Marathon 2025 and experience a unique run through beautiful scenery',
    ogImage: 'assets/images/marathon-og.jpg',
    ogUrl: 'https://tpmarathon.com',
    twitterTitle: 'TP Marathon 2025',
    twitterDescription: 'Join the Tirunelveli-Palayamkottai Marathon 2025',
    twitterImage: 'assets/images/marathon-twitter.jpg',
    robots: 'index, follow',
    canonicalUrl: 'https://tpmarathon.com'
  };

  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  setMetaTags(config: Partial<MetaTagConfig>): void {
    // Merge with default config
    const metaConfig = { ...this.defaultConfig, ...config };

    // Set the document title
    if (metaConfig.title) {
      this.title.setTitle(metaConfig.title);
    }

    // Update or add meta tags
    this.updateMetaTag('description', metaConfig.description);
    this.updateMetaTag('keywords', metaConfig.keywords);
    this.updateMetaTag('robots', metaConfig.robots);

    // Open Graph Tags
    this.updateMetaTag('og:title', metaConfig.ogTitle);
    this.updateMetaTag('og:description', metaConfig.ogDescription);
    this.updateMetaTag('og:image', metaConfig.ogImage);
    this.updateMetaTag('og:url', metaConfig.ogUrl);
    this.updateMetaTag('og:type', 'website');

    // Twitter Card Tags
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', metaConfig.twitterTitle);
    this.updateMetaTag('twitter:description', metaConfig.twitterDescription);
    this.updateMetaTag('twitter:image', metaConfig.twitterImage);

    // Canonical URL
    this.updateCanonicalUrl(metaConfig.canonicalUrl);
  }

  private updateMetaTag(name: string, content?: string): void {
    if (!content) {
      return;
    }

    // Determine if it's a property or name attribute
    const attrSelector = name.startsWith('og:') || name.startsWith('twitter:')
      ? 'property'
      : 'name';

    // Check if tag exists and update or add
    const selector = `${attrSelector}='${name}'`;
    if (this.meta.getTag(selector)) {
      this.meta.updateTag({ [attrSelector]: name, content });
    } else {
      this.meta.addTag({ [attrSelector]: name, content });
    }
  }

  private updateCanonicalUrl(url?: string): void {
    if (!url) {
      return;
    }

    // Remove existing canonical link if present
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Add canonical link
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
} 