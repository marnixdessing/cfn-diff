import path from 'path';
import { compareLists } from 'compare-lists';
import { CloudAssemblyUtil } from './CloudAssemblyUtil';
import { CloudAssemblyResult } from './result/ComparisonResult';
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

  static compare(cloudAssemblyDirectoryA: string, cloudAssemblyDirectoryB: string) {

    const results: CloudAssemblyResult[] = [];
    const templatePathsA = CloudAssemblyUtil.getTemplatePaths(cloudAssemblyDirectoryA);
    const templatePathsB = CloudAssemblyUtil.getTemplatePaths(cloudAssemblyDirectoryB);

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
        basename: right.replace(cloudAssemblyDirectoryB, ''),
      }),
      onMissingInRight: left => results.push({
        pathA: left,
        basename: left.replace(cloudAssemblyDirectoryA, ''),
      }),
      onMatch: file => this.checkTemplate(cloudAssemblyDirectoryA, cloudAssemblyDirectoryB, file, results),
    });

    return results;
  }

  /**
   * Load both templates, compare and add differences found to diffResult
   * @param props comperator properties
   * @param template the path to the template
   * @param results the results collection object
   */
  private static checkTemplate(cloudAssemblyDirectoryA: string, cloudAssemblyDirectoryB: string, template: string, results: CloudAssemblyResult[]) {
    const fileBase = template.replace(cloudAssemblyDirectoryA, ''); // cannot use path.basename(template); as the file may be in a subdirectory.
    const a = new CFTemplate(path.join(cloudAssemblyDirectoryA, fileBase));
    const b = new CFTemplate(path.join(cloudAssemblyDirectoryB, fileBase));

    if (process.env.DEBUG) {
      console.debug('Checking templates for diff', fileBase, cloudAssemblyDirectoryA, cloudAssemblyDirectoryB);
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