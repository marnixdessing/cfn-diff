import path from 'path';
import { compareLists } from 'compare-lists';
import { CloudAssemblyUtil } from './CloudAssemblyUtil';
import { CloudAssemblyResult } from './compare/ComparisonResult';
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

    const results: CloudAssemblyResult[] = [];
    const templatePathsA = CloudAssemblyUtil.getTemplatePaths(this.props.cloudAssemblyDirectoryA);
    const templatePathsB = CloudAssemblyUtil.getTemplatePaths(this.props.cloudAssemblyDirectoryB);

    if (process.env.DEBUG) {
      console.debug('Templates A', templatePathsA);
      console.debug('Templates B', templatePathsA);
    }

    compareLists({
      left: templatePathsA,
      right: templatePathsB,
      compare: (left, right) => path.basename(left).localeCompare(path.basename(right)), // Only compare file names
      onMissingInLeft: right => results.push({
        pathB: right,
        basename: right.replace(this.props.cloudAssemblyDirectoryB, ''),
      }),
      onMissingInRight: left => results.push({
        pathA: left,
        basename: left.replace(this.props.cloudAssemblyDirectoryA, ''),
      }),
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
  private checkTemplate(props: CloudAssemblyComperatorProps, template: string, results: CloudAssemblyResult[]) {
    const fileBase = template.replace(props.cloudAssemblyDirectoryA, ''); // cannot use path.basename(template); as the file may be in a subdirectory.
    const a = new CFTemplate(path.join(props.cloudAssemblyDirectoryA, fileBase));
    const b = new CFTemplate(path.join(props.cloudAssemblyDirectoryB, fileBase));

    if (process.env.DEBUG) {
      console.debug('Checking templates for diff', fileBase, props.cloudAssemblyDirectoryA, props.cloudAssemblyDirectoryB);
    }

    const templateResults = new CFTemplateComperator({
      templateA: a,
      templateB: b,
    }).compare();

    if (templateResults.length > 0) {
      results.push({
        pathA: a.path,
        pathB: b.path,
        basename: fileBase,
        changes: templateResults,
      });
    }

  }


}