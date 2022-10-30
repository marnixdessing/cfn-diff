import { compareLists } from 'compare-lists';
import { diff as calculateDiff } from 'deep-object-diff';
import { TemplateResult } from '../compare/ComparisonResult';
import { CFTemplate, CFTemplatePart } from './CFTemplate';

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

  //private results = new ComparisonResults();
  private r: TemplateResult[] = [];

  constructor(props: CFTemplateComperatorProps) {
    this.templateA = props.templateA;
    this.templateB = props.templateB;
  }

  getResults() {
    return this.r;
  }

  compare() {
    return this
      .compareVersion()
      .compareDescription()
      .compareOutputs()
      .compareRules()
      .compareParameters()
      .compareResources()
      .compareConditions()
      .compareMappings()
      .compareMetadata()
      .compareTransform()
      .r;
  }

  compareVersion(): CFTemplateComperator {
    const a = this.templateA.getVersion();
    const b = this.templateB.getVersion();
    this.compareProperty(a, b, 'version', CFTemplatePart.VERSION);
    return this;
  }

  compareDescription(): CFTemplateComperator {
    const a = this.templateA.getDescription();
    const b = this.templateB.getDescription();
    this.compareProperty(a, b, 'description', CFTemplatePart.DESCRIPTION);
    return this;
  }

  compareOutputs(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.OUTPUTS);
    return this;
  }

  compareMappings(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.MAPPINGS);
    return this;
  }

  compareConditions(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.CONDITIONS);
    return this;
  }

  compareMetadata(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.METADATA);
    return this;
  }

  compareParameters(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.PARAMETERS);
    return this;
  }

  compareRules(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.RULES);
    return this;
  }

  compareResources(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.RESOURCES);
    return this;
  }

  compareTransform(): CFTemplateComperator {
    this.compareObjects(CFTemplatePart.TRANFORM);
    return this;
  }

  private compareProperty(a: any, b: any, identifier: string, part: CFTemplatePart) {
    if (a != b) {
      this.r.push({
        identifier: identifier,
        type: part,
        a,
        b,
      });
    }
    return this;
  }

  private compareObjects(part: CFTemplatePart) {

    const objA = this.templateA.getPart(part);
    const objB = this.templateB.getPart(part);

    if (objA == undefined && objB == undefined) {
      return;
    } else if (objA == undefined && objB != undefined) {
      this.allChangedFromObject(objB, true, part);
      return;
    } else if (objA != undefined && objB == undefined) {
      this.allChangedFromObject(objA, false, part);
      return;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (process.env.DEBUG) {
      console.debug(objA, objB);
      console.debug('KEYS A', keysA);
      console.debug('KEYS B', keysB);
    }

    compareLists({
      left: keysA,
      right: keysB,
      compare: (left, right) => left.localeCompare(right),
      onMissingInLeft: right => this.registerNewOrDeleted(right, part, undefined, objB[right]),
      onMissingInRight: left => this.registerNewOrDeleted(left, part, objA[left], undefined),
      onMatch: key => this.deepCheck(objA[key], objB[key], key, part),
    });
  }

  registerNewOrDeleted(identifier: string, type: CFTemplatePart, a?: any, b?: any) {
    if (process.env.DEBUG) {
      console.debug('Diff found', identifier, type, a, b );
    }
    this.r.push({ identifier, type, a, b });
  }

  allChangedFromObject(obj: any, isNew: boolean, type: CFTemplatePart) {
    const keys = Object.keys(obj);
    keys.forEach(k => {
      this.r.push({
        identifier: k,
        type,
        a: isNew ? undefined : obj[k],
        b: isNew ? obj[k] : undefined,
      });
    });
  }

  deepCheck(objA: any, objB: any, key: string, type: CFTemplatePart) {
    const diff = calculateDiff(objA, objB);
    if (Object.keys(diff).length === 0) {
      return;
    }
    this.r.push({
      a: objA,
      b: objB,
      identifier: key,
      type,
    });
  }

}