import { CFTemplatePart } from '../template/CFTemplate';

export enum ChangeType {
  CHANGED = '~',
  NEW = '+',
  DELETED = '-',
}

export interface Filtered {
  exclude?: boolean;
}

export interface Notifiable {
  warning?: string;
}

export interface CloudAssemblyResult extends Filtered {
  pathA?: string;
  pathB?: string;
  basename: string;
  changes?: TemplateResult[];
}

export interface TemplateResult extends Filtered {
  a?: any;
  b?: any;
  identifier: string;
  type: CFTemplatePart;
  changes?: ResourceResult[];
}

export interface ResourceResult extends Filtered, Notifiable {
  property: string,
  a?: any;
  b?: any;
}

export function templateChangeType(result: TemplateResult) {
  if (result.a && result.b) {
    return ChangeType.CHANGED;
  } else if (!result.a && result.b) {
    return ChangeType.NEW;
  } else {
    return ChangeType.DELETED;
  }
}
export function cloudAssemblyChangeType(result: CloudAssemblyResult) {
  if (result.pathA && result.pathB) {
    return ChangeType.CHANGED;
  } else if (!result.pathA && result.pathB) {
    return ChangeType.NEW;
  } else {
    return ChangeType.DELETED;
  }
}

export abstract class CloudAssemblyResultWalker {

  walk(templates: CloudAssemblyResult[]) {
    for (let template of templates) {
      this.beginTemplateCheck(template);
      if (template.changes) {
        for (let change of template.changes) {
          this.templateChangeCheck(template, change);
        }
      }
      this.endTemplateCheck(template);
    }
  }

  abstract beginTemplateCheck(template: CloudAssemblyResult): void
  abstract endTemplateCheck(template: CloudAssemblyResult): void
  abstract templateChangeCheck(template: CloudAssemblyResult, change: TemplateResult): void

}
