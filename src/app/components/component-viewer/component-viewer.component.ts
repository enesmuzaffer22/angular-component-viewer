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
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../services/page.service';

interface ComponentData {
  id?: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

@Component({
  selector: 'app-component-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
          <ng-container #dynamicComponentContainer></ng-container>
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
export class ComponentViewerComponent implements OnChanges, OnInit {
  @Input() cHtml: string = '';
  @Input() cCss: string = '';
  @Input() cJs: string = '';
  @Input() componentId: string = '';
  
  @ViewChild('dynamicComponentContainer', {
    read: ViewContainerRef,
    static: true,
  })
  container!: ViewContainerRef;

  private componentRef: ComponentRef<any> | null = null;
  private compiler: CompilerFactory;
  private nestedComponentsJs: Map<string, string> = new Map();

  constructor(
    injector: Injector,
    private pageService: PageService
  ) {
    this.compiler = injector.get(CompilerFactory);
  }

  ngOnInit() {
    if (this.componentId) {
      this.loadComponentById(this.componentId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['componentId'] && !changes['componentId'].firstChange) {
      this.loadComponentById(this.componentId);
    } else if (changes['cHtml'] || changes['cCss'] || changes['cJs']) {
      this.createDynamicComponent();
    }
  }

  private loadComponentById(id: string) {
    const component = this.pageService.getComponentById(id);
    if (component) {
      this.cHtml = component.html;
      this.cCss = component.css;
      this.cJs = component.js;
      this.createDynamicComponent();
    } else {
      console.error(`Component with ID ${id} not found`);
    }
  }

  private createDynamicComponent() {
    if (!this.container) return;

    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.container.clear();
    this.nestedComponentsJs.clear();

    try {
      // Process HTML to handle nested component viewers
      const processedHtml = this.processNestedComponentViewers(this.cHtml);
      
      // Combine all JS code (main component + nested components)
      const combinedJs = this.combineJsCode();
      
      const DynamicComponent = this.createComponentClass(processedHtml, combinedJs);
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

  private combineJsCode(): string {
    let combinedJs = this.cJs || '';
    
    // Add all nested components' JS code
    this.nestedComponentsJs.forEach((js, id) => {
      if (js && js.trim()) {
        combinedJs += `\n\n// Nested component: ${id}\n${js}`;
      }
    });
    
    return combinedJs;
  }

  private processNestedComponentViewers(html: string): string {
    // Replace app-component-viewer tags with placeholders that will be replaced with actual content
    const regex = /<app-component-viewer\s+\[componentId\]="([^"]+)"\s*><\/app-component-viewer>/g;
    
    return html.replace(regex, (match, componentIdExpr) => {
      // Extract the component ID from the expression (could be a string literal or a variable)
      let componentId = componentIdExpr;
      if (componentIdExpr.startsWith("'") && componentIdExpr.endsWith("'")) {
        componentId = componentIdExpr.slice(1, -1);
      }
      
      const component = this.pageService.getComponentById(componentId);
      if (component) {
        // Store JS code for later combination
        if (component.js && component.js.trim()) {
          this.nestedComponentsJs.set(componentId, component.js);
        }
        
        // Process nested component's HTML recursively to handle multi-level nesting
        const nestedHtml = this.processNestedComponentViewers(component.html);
        
        // Create a container div with the nested component's styles
        return `<div class="nested-component-container" style="display: contents;">
          <style>${component.css}</style>
          ${nestedHtml}
        </div>`;
      }
      return `<div class="error-placeholder">Component with ID ${componentId} not found</div>`;
    });
  }

  private createComponentClass(processedHtml: string, jsCode: string): any {
    let classBody = '';

    if (jsCode.trim().startsWith('class')) {
      classBody = jsCode;
    } else {
      classBody = `class DynamicComponent {\n${jsCode}\n}`;
    }

    const DynamicComponent = new Function(`return ${classBody}`)();

    Component({
      template: processedHtml,
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
