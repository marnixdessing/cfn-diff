import {
  ChangeType,
  cloudAssemblyChangeType,
  CloudAssemblyResult,
  CloudAssemblyResultWalker,
  templateChangeType,
  TemplateResult,
} from '../result/ComparisonResult';

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
    new ShowFilter(filterOptions).walk(result);
    if (filterOptions.resources) {
      new ResourceFilter(filterOptions).walk(result);
    }
  }

}

class ShowFilter extends CloudAssemblyResultWalker {

  private filterOptions: FilterOptions;

  constructor(filterOptions: FilterOptions) {
    super();
    this.filterOptions = filterOptions;
  }

  beginTemplateCheck(template: CloudAssemblyResult): void {
    const changeType = cloudAssemblyChangeType(template);
    if (this.filterOptions.show && !this.filterOptions.show.includes(changeType)) {
      template.exclude = true;
    }
  }

  endTemplateCheck(template: CloudAssemblyResult): void {
    if (template.changes) {
      const shown = template.changes.filter(c => !c.exclude);
      if (shown.length == 0) template.exclude = true;
    }
  }

  beginTemplateChangeCheck(_template: CloudAssemblyResult, change: TemplateResult): void {
    const changeType = templateChangeType(change);
    if (this.filterOptions.resources?.show && !this.filterOptions.resources.show.includes(changeType)) {
      change.exclude = true;
    }
  }

  endTemplateChangeCheck(): void {
    return;
  }

  resourcePropertyCheck(): void {
    return;
  }

}

class ResourceFilter extends CloudAssemblyResultWalker {

  private filterOptions: FilterOptions;

  constructor(filterOptions: FilterOptions) {
    super();
    this.filterOptions = filterOptions;
  }

  beginTemplateCheck(): void {
    return;
  }

  endTemplateCheck(): void {
    return;
  }

  beginTemplateChangeCheck(_template: CloudAssemblyResult, change: TemplateResult): void {
    if (this.filterOptions.resources?.service) { // Filter on service
      if (!change.type.includes(this.filterOptions.resources?.service)) {
        change.exclude = true;
      }
    }
    if (this.filterOptions.resources?.resourceType) { // Filter on type
      if (change.type != (this.filterOptions.resources?.resourceType)) {
        change.exclude = true;
      }
    }
  }

  endTemplateChangeCheck(): void {
    return;
  }

  resourcePropertyCheck(): void {
    return;
  }

}