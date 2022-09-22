import glob from 'glob';

const CLOUDFORMATION_TEMPLATE_SUFFIX: string = '.template.json';
const CLOUDFORMATION_TEMPLATE_CONFIG_SUFFIX: string = '.template.json.config.json';
const CLOUDFORMATION_ASSETS_SUFFIX: string = '.assets.json';

export class CloudAssemblyUtil {

  /**
     * Find all CloudFormation templates in a cloud assembly directory
     * including templates in the subdirectories.
     * @param dir cloud assembly directory to scan
     * @returns an arry of all CF templates found
     */
  public static getTemplatePaths(dir: string) {
    const files = this.listAllFiles(dir);
    return this.suffixFilter(files, CLOUDFORMATION_TEMPLATE_SUFFIX);
  }

  /**
     * Find all CloudFormation assets files in a cloud assembly directory
     * including in the subdirectories.
     * @param dir cloud assembly directory to scan
     * @returns an arry of all CF assets files found
     */
  public static getAssetsPaths(dir: string) {
    const files = this.listAllFiles(dir);
    return this.suffixFilter(files, CLOUDFORMATION_ASSETS_SUFFIX);
  }

  /**
     * Find all CloudFormation template config files in a cloud assembly directory
     * including in the subdirectories.
     * @param dir cloud assembly directory to scan
     * @returns an arry of all CF template config files found
     */
  public static getTemplateConfigPaths(dir: string) {
    const files = this.listAllFiles(dir);
    return this.suffixFilter(files, CLOUDFORMATION_TEMPLATE_CONFIG_SUFFIX);
  }

  private static suffixFilter(files: string[], suffix: string) {
    return files.filter(file => file.endsWith(suffix));
  }

  private static listAllFiles(dir: string): string[] {
    return glob.sync(dir + '/**/*');
  }
}