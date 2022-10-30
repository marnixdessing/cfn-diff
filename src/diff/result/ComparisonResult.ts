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
  property: string;
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

export function resourcePropertyChangeType(result: ResourceResult) {
  if (result.a && result.b) {
    return ChangeType.CHANGED;
  } else if (!result.a && result.b) {
    return ChangeType.NEW;
  }
  return ChangeType.DELETED;
}

export abstract class CloudAssemblyResultWalker {

  walk(templates: CloudAssemblyResult[]) {
    for (let template of templates) {
      this.beginTemplateCheck(template);
      for (let change of template.changes ?? []) {
        this.beginTemplateChangeCheck(template, change);
        console.log('Properties', change.changes);
        for (let property of change.changes ?? []) {
          this.resourcePropertyCheck(template, change, property);
        }
        this.endTemplateChangeCheck(template, change);
      }
      this.endTemplateCheck(template);
    }
  }

  abstract beginTemplateCheck(template: CloudAssemblyResult): void
  abstract endTemplateCheck(template: CloudAssemblyResult): void
  abstract beginTemplateChangeCheck(template: CloudAssemblyResult, change: TemplateResult): void
  abstract endTemplateChangeCheck(template: CloudAssemblyResult, change: TemplateResult): void
  abstract resourcePropertyCheck(template: CloudAssemblyResult, change: TemplateResult, property: ResourceResult): void

}
