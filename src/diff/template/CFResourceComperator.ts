import { compareLists } from 'compare-lists';
import { ResourceResult } from '../result/ComparisonResult';

export class CFResourceComperator {

  static compare(resourceA: any, resourceB: any) {
    
    const result: ResourceResult[] = [];

    const propsA = resourceA?.Properties;
    const propsB = resourceB?.Properties;

    if (!propsA || !propsB) {
      return [];
    }

    const keysA = Object.keys(resourceA.Properties);
    const keysB = Object.keys(resourceB.Properties);

    compareLists({
      left: keysA,
      right: keysB,
      compare: (left, right) => left.localeCompare(right),
      onMissingInLeft: right => result.push({
        property: right,
        b: resourceB[right],
      }),
      onMissingInRight: left => result.push({
        property: left,
        a: resourceA[left],
      }),
      onMatch: key => {
        const a = resourceA[key].Properties; 
        const b = resourceB[key].Properties; 
        if(JSON.stringify(a) != JSON.stringify(b)){
          result.push({property: key, a, b});
        }
      },
    });

    return result;
  }

}