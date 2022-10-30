import { compareLists } from 'compare-lists';
import { CloudAssemblyResult, CloudAssemblyResultWalker, TemplateResult, templateChangeType, ChangeType } from '../result/ComparisonResult';
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

      if (process.env.DEBUG) {
        console.debug('Found type:', type, '| found cf docs:', ref ?? 'no');
      }

      const warnings: string[] = [];
      
      // Implied by ChangeType.CHANGED that neither change.a or change.d will be undefined
      const keysA = Object.keys(change.a); 
      const keysB = Object.keys(change.b);

      compareLists({
        left: keysA,
        right: keysB,
        compare: (left, right) => left.localeCompare(right),
        onMissingInLeft: (right) => { // New property
          const mutability = ref.Properties[right].UpdateType;
          if (mutability == 'Immutable') {
            warnings.push(`Adding property ${right} will result in recreating this resource`);
          }
        },
        onMissingInRight: (left) => {
          const mutability = ref.Properties[left].UpdateType;
          if (mutability == 'Immutable') {
            warnings.push(`Removing property ${left} will result in recreating this resource`);
          }
        },
        onMatch: (match) => {
          // Deep check
          if (JSON.stringify(change.a[match]) == JSON.stringify(change.b[match])) {
            return;
          }
          console.debug( match, ref.Properties[match]);
          const mutability = ref.Properties[match].UpdateType;
          if (mutability == 'Immutable') {
            warnings.push(`Changed property ${match} will result in recreating this resource`);
          }
        },
      });


    }
  }
}