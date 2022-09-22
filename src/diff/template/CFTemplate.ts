import fs from 'fs';

/**
 * Class for loading and accessing CloudFormation templates
 */
export class CFTemplate {

  private readonly template;

  constructor(path: string) {
    this.template = JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  getTemplate() {
    return this.template;
  }

  // Utility methods

  getOutputs() {
    return this.getKey('Outputs');
  }

  hasOutputs() {
    return this.hasKey('Outputs');
  }

  getParameters() {
    return this.getKey('Parameters');
  }

  hasParameters() {
    return this.hasKey('Parameters');
  }

  getRules() {
    return this.getKey('Rules');
  }

  hasRules() {
    return this.hasKey('Rules');
  }

  getResources() {
    return this.getKey('Resources');
  }

  hasResources() {
    return this.hasKey('Resources');
  }

  getDiscription() {
    return this.getKey('Description');
  }

  hasDescription() {
    return this.hasKey('Description');
  }

  hasKey(key: string) {
    return this.template[key] != undefined;
  }

  getKey(key: string) {
    return this.template[key];
  }

}