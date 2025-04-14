import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PageService } from '../../services/page.service';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { FormsModule } from '@angular/forms';
import { Theme } from '../../models/theme.model';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [CommonModule, ComponentViewerComponent, FormsModule],
  template: `
    <div class="page-header" [style.background-color]="currentTheme?.primaryColor">
      <h1>Component Viewer CMS</h1>
      <div class="subdomain-selector">
        <label for="subdomain">Subdomain: </label>
        <select id="subdomain" [(ngModel)]="selectedSubdomain" (change)="onSubdomainChange()">
          <option value="www">www (Ana Sayfa)</option>
          <option value="about">about (Hakkımızda)</option>
          <option value="contact">contact (İletişim)</option>
          <option value="nested">nested (İç İçe Component)</option>
          <option value="mdbf">mdbf (Mühendislik Fakültesi)</option>
          <option value="ff">ff (Fen Fakültesi)</option>
        </select>
      </div>
    </div>
    
    <div class="page-container" *ngIf="currentPage">
      <div class="page-info" [style.border-bottom-color]="currentTheme?.secondaryColor">
        <h2 [style.color]="currentTheme?.primaryColor">{{ currentPage.title }}</h2>
        <p>{{ currentPage.description }}</p>
        <div class="theme-info" *ngIf="currentTheme">
          <p><strong>Aktif Tema:</strong> {{ currentTheme.name }}</p>
          <div class="color-swatches">
            <div class="color-swatch primary-swatch" [style.background-color]="currentTheme.primaryColor"></div>
            <div class="color-swatch secondary-swatch" [style.background-color]="currentTheme.secondaryColor"></div>
          </div>
        </div>
      </div>
      
      <div class="component-list">
        <div *ngFor="let componentId of currentPage.components">
          <app-component-viewer [componentId]="componentId"></app-component-viewer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .page-header {
      background-color: var(--primary-color, #00733E);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .page-header h1 {
      margin: 0;
    }
    
    .subdomain-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .subdomain-selector select {
      padding: 8px;
      border-radius: 4px;
      border: none;
    }
    
    .page-info {
      background-color: #f5f5f5;
      padding: 20px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--secondary-color, #E0B200);
    }
    
    .page-info h2 {
      color: var(--primary-color, #00733E);
      margin-top: 0;
    }
    
    .component-list {
      flex: 1;
    }
    
    .theme-info {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }
    
    .color-swatches {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .color-swatch {
      width: 30px;
      height: 30px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  `]
})
export class PageContainerComponent implements OnInit, OnDestroy {
  currentPage: any = null;
  selectedSubdomain: string = 'www';
  currentTheme: Theme | null = null;
  private pageSubscription: Subscription | null = null;
  private themeSubscription: Subscription | null = null;

  constructor(private pageService: PageService) {}

  ngOnInit() {
    // Sayfa değişikliklerini dinle
    this.pageSubscription = this.pageService.currentPage$.subscribe(page => {
      this.currentPage = page;
    });
    
    // Tema değişikliklerini dinle
    this.themeSubscription = this.pageService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
    
    // Başlangıçta seçili subdomain'e göre sayfa yükle
    this.pageService.loadPageBySubdomain(this.selectedSubdomain);
  }

  ngOnDestroy() {
    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
    
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  onSubdomainChange() {
    // Subdomain değiştiğinde sayfayı yeniden yükle
    this.pageService.loadPageBySubdomain(this.selectedSubdomain);
  }
}
