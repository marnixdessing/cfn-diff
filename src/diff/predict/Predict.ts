import { CloudAssemblyResult, CloudAssemblyResultWalker, TemplateResult, ResourceResult } from '../result/ComparisonResult';
import cf from './CloudFormationResourceSpecification.json';

export class ImpactPredictor extends CloudAssemblyResultWalker {

  static predict(result: CloudAssemblyResult[]) {
    new ImpactPredictor(cf).walk(result);
  }

  private reference;

  constructor(reference: any) {
    super();
    this.reference = reference;
  }

  beginTemplateCheck(): void {
    return;
  }

  endTemplateCheck(): void {
    return;
  }

  beginTemplateChangeCheck(): void {
    return;
  }

  endTemplateChangeCheck(): void {
    return;
  }

  resourcePropertyCheck(_template: CloudAssemblyResult, change: TemplateResult, property: ResourceResult): void {
    const type = change.a?.Type ? change.a?.Type : change.b?.Type;
    const ref = this.reference.ResourceTypes[type];
    const mutability = ref.Properties[property.property].UpdateType;
    console.log('ResourcePropertyCheck', type, mutability);
    if (mutability == 'Immutable') {
      property.warning = (`Changed property ${property.property} will result in recreating this resource`);
    }
  }

}