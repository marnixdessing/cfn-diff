import fs from 'fs';

/**
 * Different subsections of a cloudformation template
 */
export enum CFTemplatePart {
  VERSION = 'AWSTemplateFormatVersion',
  DESCRIPTION = 'Description',
  MAPPINGS = 'Mapings',
  CONDITIONS = 'Conditions',
  METADATA = 'Metadata',
  OUTPUTS = 'Outputs',
  PARAMETERS = 'Parameters',
  RULES = 'Rules',
  RESOURCES = 'Resources',
  TRANFORM = 'Transform',
}

/**
 * Class for loading and accessing CloudFormation templates
 */
export class CFTemplate {

  private readonly template;
  public readonly path;

  constructor(path: string) {
    this.path = path;
    this.template = JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  getTemplate() {
    return this.template;
  }

  getVersion(): string | undefined {
    return this.getKey('AWSTemplateFormatVersion');
  }

  getDescription(): string | undefined {
    return this.getKey('Description');
  }

  hasPart(part: CFTemplatePart): boolean {
    return this.hasKey(part);
  }

  getPart(part : CFTemplatePart): any | undefined {
    return this.getKey(part);
  }

  private hasKey(key: string): boolean {
    return this.template[key] != undefined;
  }

  private getKey(key: string): any | undefined {
    return this.template[key];
  }

}