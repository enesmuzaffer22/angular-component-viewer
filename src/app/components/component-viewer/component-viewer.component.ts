import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  OnChanges,
  SimpleChanges,
  Injector,
  NgModule,
  CompilerFactory,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-component-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="component-viewer">
      <!-- Preview Section -->
      <div class="preview-section">
        <h3>Component Preview</h3>
        <div class="component-preview">
          <ng-container #dynamicComponentContainer></ng-container>
        </div>
      </div>

      <!-- Code Sections -->
      <div class="code-sections">
        <div class="code-section">
          <h3>HTML</h3>
          <pre>{{ cHtml }}</pre>
        </div>
        <div class="code-section">
          <h3>CSS</h3>
          <pre>{{ cCss }}</pre>
        </div>
        <div class="code-section">
          <h3>JavaScript</h3>
          <pre>{{ cJs }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .component-viewer {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .preview-section {
        padding: 20px;
        border-radius: 8px;
        background-color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .component-preview {
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 4px;
      }

      .code-sections {
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
      }

      .code-section {
        margin-bottom: 20px;
      }

      pre {
        background-color: #fff;
        padding: 15px;
        border-radius: 4px;
        border: 1px solid #ddd;
        overflow-x: auto;
        font-family: 'Courier New', Courier, monospace;
      }
    `,
  ],
})
export class ComponentViewerComponent implements OnChanges {
  @Input() cHtml: string = '';
  @Input() cCss: string = '';
  @Input() cJs: string = '';
  @ViewChild('dynamicComponentContainer', {
    read: ViewContainerRef,
    static: true,
  })
  container!: ViewContainerRef;

  private componentRef: ComponentRef<any> | null = null;
  private compiler: CompilerFactory;

  constructor(injector: Injector) {
    this.compiler = injector.get(CompilerFactory);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cHtml'] || changes['cCss'] || changes['cJs']) {
      this.createDynamicComponent();
    }
  }

  private createDynamicComponent() {
    if (!this.container) return;

    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.container.clear();

    try {
      const DynamicComponent = this.createComponentClass();
      const DynamicModule = this.createDynamicModule(DynamicComponent);

      const compiler = this.compiler.createCompiler();
      const moduleFactory =
        compiler.compileModuleAndAllComponentsSync(DynamicModule);
      const componentFactory = moduleFactory.componentFactories[0];

      if (componentFactory) {
        this.componentRef = this.container.createComponent(componentFactory);
        this.componentRef.changeDetectorRef.detectChanges();
      }
    } catch (error) {
      console.error('Error creating dynamic component:', error);
    }
  }

  private createComponentClass(): any {
    const jsCode = this.cJs.trim();
    let classBody = '';

    if (jsCode.startsWith('class')) {
      classBody = jsCode;
    } else {
      classBody = `class DynamicComponent {\n${jsCode}\n}`;
    }

    const DynamicComponent = new Function(`return ${classBody}`)();

    Component({
      template: this.cHtml,
      styles: [this.cCss],
      standalone: false,
    })(DynamicComponent);

    return DynamicComponent;
  }

  private createDynamicModule(component: any): any {
    const DynamicModule = class {};
    NgModule({
      imports: [CommonModule, FormsModule],
      declarations: [component],
      exports: [component],
    })(DynamicModule);

    return DynamicModule;
  }
}
