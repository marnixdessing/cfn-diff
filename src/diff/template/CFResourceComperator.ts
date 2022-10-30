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
        b: propsB[right],
      }),
      onMissingInRight: left => result.push({
        property: left,
        a: propsA[left],
      }),
      onMatch: key => {
        console.log('Key', key);
        const a = propsA[key];
        const b = propsB[key];
        if (JSON.stringify(a) != JSON.stringify(b)) {
          result.push({ property: key, a, b });
        }
      },
    });

    return result;
  }

}