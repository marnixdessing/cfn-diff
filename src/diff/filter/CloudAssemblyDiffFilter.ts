import {
  ChangeType,
  cloudAssemblyChangeType,
  CloudAssemblyResult,
  templateChangeType,
} from '../compare/ComparisonResult';
import { CFTemplatePart } from '../template/CFTemplate';

export interface FilterOptions {
  resources?: ResourceFilterOptions;
  show?: ChangeType[];
}

export interface ResourceFilterOptions {
  /**
     * Filter all resources based on service 'AWS::Route53::*'
     */
  service?: string;

  /**
     * Such as 'AWS::Route53::HostedZone'
     */
  resourceType?: string;

  /**
     * Show only changes of change type
     */
  show?: ChangeType[];
}

export class CloudAssemblyDiffFilter {


  static filter(result: CloudAssemblyResult[], filterOptions: FilterOptions) {

    result = this.showFilter(result, filterOptions);

    if (filterOptions.resources) {
      result = this.resourceFilter(result, filterOptions.resources);
    }
    return result;
  }

  static showFilter(result: CloudAssemblyResult[], filterOptions: FilterOptions) {
    for (let i = 0; i < result.length; i++) {
      const template = result[i];
      console.debug(
        template.basename,
        filterOptions.show,
        cloudAssemblyChangeType(template),
        filterOptions.show && !filterOptions.show.includes(cloudAssemblyChangeType(template)),
      );
      if (filterOptions.show && !filterOptions.show.includes(cloudAssemblyChangeType(template))) {
        // Remove thing from results
        result[i].exclude = true;
        continue;
      }
      const templateChanges = template.changes;
      if (!templateChanges) continue;
      for (let j = 0; j < templateChanges.length; j++) {
        const change = templateChanges[j];
        const changeType = templateChangeType(change);
        if (filterOptions.resources?.show && !filterOptions.resources.show.includes(changeType)) {
          change.exclude = true;
          continue;
        }
      }
    }
    return result;
  }

  static resourceFilter(result: CloudAssemblyResult[], filterOptions: ResourceFilterOptions) {
    for (let i = 0; i < result.length; i++) {
      const template = result[i];
      const templateChanges = template.changes;

      if (!templateChanges) continue;

      for (let j = 0; j < templateChanges.length; j++) {
        const change = templateChanges[j];
        if (change.type == CFTemplatePart.RESOURCES) {
          const cfType = change.a ? change.a.Type : change.b.Type;
          if (filterOptions.service && !cfType.includes(filterOptions.service)) {
            change.exclude = true; // Different service than filtered on
          } else if (filterOptions.resourceType && cfType != filterOptions.resourceType) {
            change.exclude = true; // Different resource type than filtered on
          }
        }
      }

      const allExcluded = templateChanges ? !templateChanges.find(c => !c.exclude) != undefined : true;
      if (allExcluded) template.exclude = true;

    }
    return result;
  }

}