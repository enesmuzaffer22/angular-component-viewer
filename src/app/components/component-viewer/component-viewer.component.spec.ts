import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentViewerComponent } from './component-viewer.component';

describe('ComponentViewerComponent', () => {
  let component: ComponentViewerComponent;
  let fixture: ComponentFixture<ComponentViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
