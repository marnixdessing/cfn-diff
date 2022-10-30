import { CloudAssemblyResult, CloudAssemblyResultWalker, TemplateResult, templateChangeType, ChangeType } from '../compare/ComparisonResult';
import cf from './CloudFormationResourceSpecification.json';

export class ImpactPredictor {

  static predict(result: CloudAssemblyResult[]) {
    new ImpactPredictorWalker(cf).walk(result);
  }

}


class ImpactPredictorWalker extends CloudAssemblyResultWalker {

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

  templateChangeCheck(_template: CloudAssemblyResult, change: TemplateResult): void {
    if (templateChangeType(change) == ChangeType.CHANGED) {
      console.debug('Walking through changes:', change);

      const type = change.a?.Type;
      const ref = this.reference.ResourceTypes[type];
      console.debug(ref);

      // TODO extract changed properties, if they are changed look them up in the docs

    }
  }
}