import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PageService } from '../../services/page.service';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [CommonModule, ComponentViewerComponent, FormsModule],
  template: `
    <div class="page-header">
      <h1>Component Viewer CMS</h1>
      <div class="subdomain-selector">
        <label for="subdomain">Subdomain: </label>
        <select id="subdomain" [(ngModel)]="selectedSubdomain" (change)="onSubdomainChange()">
          <option value="www">www (Ana Sayfa)</option>
          <option value="about">about (Hakkımızda)</option>
          <option value="contact">contact (İletişim)</option>
          <option value="nested">nested (İç İçe Component)</option>
        </select>
      </div>
    </div>
    
    <div class="page-container" *ngIf="currentPage">
      <div class="page-info">
        <h2>{{ currentPage.title }}</h2>
        <p>{{ currentPage.description }}</p>
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
      background-color: #00733E;
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
      border-bottom: 2px solid #E0B200;
    }
    
    .page-info h2 {
      color: #00733E;
      margin-top: 0;
    }
    
    .component-list {
      flex: 1;
    }
  `]
})
export class PageContainerComponent implements OnInit, OnDestroy {
  currentPage: any = null;
  selectedSubdomain: string = 'www';
  private subscription: Subscription | null = null;

  constructor(private pageService: PageService) {}

  ngOnInit() {
    // Sayfa değişikliklerini dinle
    this.subscription = this.pageService.currentPage$.subscribe(page => {
      this.currentPage = page;
    });
    
    // Başlangıçta seçili subdomain'e göre sayfa yükle
    this.pageService.loadPageBySubdomain(this.selectedSubdomain);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSubdomainChange() {
    // Subdomain değiştiğinde sayfayı yeniden yükle
    this.pageService.loadPageBySubdomain(this.selectedSubdomain);
  }
}
