import path from 'path';
import { compareLists } from 'compare-lists';
import { CloudAssemblyUtil } from './CloudAssemblyUtil';
import { ComparisonResults } from './compare/ComparisonResult';
import { CFTemplate } from './template/CFTemplate';
import { CFTemplateComperator } from './template/CFTemplateComperator';

/**
 * Configuration interface for Comperator
 */
export interface CloudAssemblyComperatorProps {
  /**
   * Path to Folder A used in comparison (converted into absolute path)
   *
   */
  cloudAssemblyDirectoryA: string;

  /**
   * Path Folder B used in comparison (converted into absolute path)
   */
  cloudAssemblyDirectoryB: string;
}

/**
 * Compares two cloud assembly directory
 */
export class CloudAssemblyComperator {

  private props: CloudAssemblyComperatorProps;

  constructor(props: CloudAssemblyComperatorProps) {
    this.props = props;
    this.props.cloudAssemblyDirectoryA = path.resolve(this.props.cloudAssemblyDirectoryA);
    this.props.cloudAssemblyDirectoryB = path.resolve(this.props.cloudAssemblyDirectoryB);
  }

  public compare() {

    const results = new ComparisonResults();
    const templatePathsA = CloudAssemblyUtil.getTemplatePaths(this.props.cloudAssemblyDirectoryA);
    const templatePathsB = CloudAssemblyUtil.getTemplatePaths(this.props.cloudAssemblyDirectoryB);

    compareLists({
      left: templatePathsA,
      right: templatePathsB,
      compare: (left, right) => path.basename(left).localeCompare(path.basename(right)), // Only compare file names
      onMissingInLeft: right => results.addNew(right, 'template'),
      onMissingInRight: left => results.addDeleted(left, 'template'),
      onMatch: file => this.checkTemplate(this.props, file, results),
    });

    return results;
  }

  /**
   * Load both templates, compare and add differences found to diffResult
   * @param props comperator properties
   * @param template the path to the template
   * @param results the results collection object
   */
  private checkTemplate(props: CloudAssemblyComperatorProps, template: string, results: ComparisonResults) {
    // Load template form dir A and dir B
    const fileBase = template.replace(props.cloudAssemblyDirectoryA, ''); // cannot use path.basename(template); as the file may be in a subdirectory.
    const a = new CFTemplate(path.join(props.cloudAssemblyDirectoryA, fileBase));
    const b = new CFTemplate(path.join(props.cloudAssemblyDirectoryB, fileBase));

    // Calculate the diff
    const templateResults = new CFTemplateComperator({
      templateA: a,
      templateB: b,
    }).compare();

    // Collect changes that are found
    if (templateResults.foundDiff()) {
      results.addChanged(fileBase, 'template', templateResults.getDiffs());
    }

  }


}