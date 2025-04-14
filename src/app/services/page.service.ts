import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import testPages from '../pages/test-pages.json';
import allComponents from '../components/all-components.json';
import nestedComponents from '../components/nested-components.json';
import themes from '../themes/themes.json';
import { Theme } from '../models/theme.model';

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
  
  private currentThemeSubject = new BehaviorSubject<Theme | null>(null);
  public currentTheme$ = this.currentThemeSubject.asObservable();
  
  private allPages: Page[] = [];
  private allComponents: ComponentData[] = [];
  private allThemes: Theme[] = [];

  constructor() {
    // Gerçek uygulamada bu veriler API'den gelecektir
    this.allPages = testPages.pages;
    
    // Tüm component'leri birleştir
    this.allComponents = [
      ...allComponents.components,
      ...nestedComponents.components
    ];
    
    // Temaları yükle
    this.allThemes = themes.themes;
    
    // Varsayılan olarak ilk sayfayı yükle
    this.loadPageById('anasayfa');
    
    // Varsayılan temayı ayarla
    this.setCurrentTheme('default');
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
   * Subdomain'e göre sayfa yükler ve uygun temayı ayarlar
   */
  loadPageBySubdomain(subdomain: string): void {
    // Subdomain'i sayfa ID'sine dönüştür
    let pageId: string;
    let themeId: string = 'default';
    
    switch (subdomain) {
      case 'www':
      case '':
        pageId = 'anasayfa';
        themeId = 'default';
        break;
      case 'about':
        pageId = 'hakkimizda';
        themeId = 'default';
        break;
      case 'contact':
        pageId = 'iletisim';
        themeId = 'default';
        break;
      case 'nested':
        pageId = 'nested';
        themeId = 'default';
        break;
      case 'mdbf':
        pageId = 'mdbf';
        themeId = 'mdbf';
        break;
      case 'ff':
        pageId = 'ff';
        themeId = 'ff';
        break;
      default:
        pageId = 'anasayfa';
        themeId = 'default';
    }
    
    // Temayı ayarla
    this.setCurrentTheme(themeId);
    
    // Sayfayı yükle
    this.loadPageById(pageId);
  }

  /**
   * Component ID'sine göre component verilerini getirir
   */
  getComponentById(componentId: string): ComponentData | null {
    const component = this.allComponents.find(c => c.id === componentId);
    return component || null;
  }
  
  /**
   * Tema ID'sine göre temayı ayarlar
   */
  setCurrentTheme(themeId: string): void {
    const theme = this.allThemes.find(t => t.id === themeId);
    if (theme) {
      this.currentThemeSubject.next(theme);
      
      // CSS değişkenlerini ayarla
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    } else {
      console.error(`Theme with ID ${themeId} not found`);
    }
  }
  
  /**
   * Geçerli temayı döndürür
   */
  getCurrentTheme(): Theme | null {
    return this.currentThemeSubject.value;
  }
  
  /**
   * Temaya göre layout component ID'sini döndürür
   */
  getLayoutComponentId(componentType: 'navbar' | 'footer'): string {
    const theme = this.getCurrentTheme();
    if (theme && theme.layoutComponents && theme.layoutComponents[componentType]) {
      return theme.layoutComponents[componentType];
    }
    
    // Varsayılan component ID'leri
    return componentType;
  }
}
