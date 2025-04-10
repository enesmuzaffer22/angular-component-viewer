import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import testPages from '../pages/test-pages.json';
import allComponents from '../components/all-components.json';
import nestedComponents from '../components/nested-components.json';

interface Page {
  id: string;
  title: string;
  description: string;
  components: string[];
}

interface ComponentData {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private currentPageSubject = new BehaviorSubject<Page | null>(null);
  public currentPage$ = this.currentPageSubject.asObservable();
  
  private allPages: Page[] = [];
  private allComponents: ComponentData[] = [];

  constructor() {
    // Gerçek uygulamada bu veriler API'den gelecektir
    this.allPages = testPages.pages;
    
    // Tüm component'leri birleştir
    this.allComponents = [
      ...allComponents.components,
      ...nestedComponents.components
    ];
    
    // Varsayılan olarak ilk sayfayı yükle
    this.loadPageById('anasayfa');
  }

  /**
   * Sayfa ID'sine göre sayfa yükler
   */
  loadPageById(pageId: string): void {
    const page = this.allPages.find(p => p.id === pageId);
    if (page) {
      this.currentPageSubject.next(page);
    } else {
      console.error(`Page with ID ${pageId} not found`);
    }
  }

  /**
   * Subdomain'e göre sayfa yükler
   */
  loadPageBySubdomain(subdomain: string): void {
    // Subdomain'i sayfa ID'sine dönüştür (örn: www -> anasayfa, about -> hakkimizda)
    let pageId: string;
    
    switch (subdomain) {
      case 'www':
      case '':
        pageId = 'anasayfa';
        break;
      case 'about':
        pageId = 'hakkimizda';
        break;
      case 'contact':
        pageId = 'iletisim';
        break;
      case 'nested':
        pageId = 'nested';
        break;
      default:
        pageId = 'anasayfa'; // Varsayılan sayfa
    }
    
    this.loadPageById(pageId);
  }

  /**
   * Component ID'sine göre component verilerini getirir
   */
  getComponentById(componentId: string): ComponentData | null {
    const component = this.allComponents.find(c => c.id === componentId);
    return component || null;
  }
}
