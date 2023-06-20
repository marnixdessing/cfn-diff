import { compareLists } from 'compare-lists';
import { diff as calculateDiff } from 'deep-object-diff';
import { CFTemplate } from './CFTemplate';
import { ComparisonResults } from '../compare/ComparisonResult';

export interface CFTemplateComperatorProps {
  /**
   * CloudFormation template comparison input A
   */
  templateA: CFTemplate;

  /**
   * CloudFormation template comparison input B
   */
  templateB: CFTemplate;

}

export class CFTemplateComperator {

  private templateA: CFTemplate;
  private templateB: CFTemplate;

  private results = new ComparisonResults();

  constructor(props: CFTemplateComperatorProps) {
    this.templateA = props.templateA;
    this.templateB = props.templateB;
  }

  getResults() {
    return this.results;
  }

  compare() {
    return this
      .compareOutputs()
      .compareRules()
      .compareParameters()
      .compareReousrces()
      .results;
  }

  compareOutputs(): CFTemplateComperator {
    this.compareObjects(this.templateA.getOutputs(), this.templateB.getOutputs(), 'output');
    return this;
  }

  compareRules(): CFTemplateComperator {
    this.compareObjects(this.templateA.getRules(), this.templateB.getRules(), 'rule');
    return this;
  }

  compareParameters(): CFTemplateComperator {
    this.compareObjects(this.templateA.getParameters(), this.templateB.getParameters(), 'parameter');
    return this;
  }

  compareReousrces(): CFTemplateComperator {
    this.compareObjects(this.templateA.getResources(), this.templateB.getResources(), 'resource');
    return this;
  }

  private compareObjects(objA: any, objB: any, type: string) {

    if (objA == undefined && objB == undefined) {
      return;
    } else if (objA == undefined && objB != undefined) {
      this.allChangedFromObject(objB, true, type);
      return;
    } else if (objA != undefined && objB == undefined) {
      this.allChangedFromObject(objA, false, type);
      return;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    compareLists({
      left: keysA,
      right: keysB,
      compare: (left, right) => left.localeCompare(right),
      onMissingInLeft: right => this.results.addNew(right, type),
      onMissingInRight: left => this.results.addDeleted(left, type),
      onMatch: key => this.deepCheck(objA[key], objB[key], key, type),
    });
  }

  allChangedFromObject(obj:any, isNew:boolean, type:string) {
    const keys = Object.keys(obj);
    keys.forEach(k => {
      if (isNew) {
        this.results.addNew(k, type);
      } else {
        this.results.addDeleted(k, type);
      }
    });
  }

  deepCheck(objA: any, objB: any, key: string, description: string) {
    const diff = calculateDiff(objA, objB);

    if (Object.keys(diff).length === 0) {
      return;
    }

    this.results.addChanged(key, description, [], JSON.stringify(diff, null, 4));

  }

}