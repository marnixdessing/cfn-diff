import fs from 'fs';

export class TestTemplateBuilder {

  private Resources: any | undefined;
  private Rules: any | undefined;
  private Parameters: any | undefined;
  private Outputs: any | undefined;

  save(path: string) {
    fs.writeFileSync(path, JSON.stringify(this, null, 4));
    return this;
  }

  addResource(identifier: string, type: string, data?: any) {
    if (!this.Resources) {
      this.Resources = {};
    }

    this.Resources[identifier] = {
      Type: type,
      ...data,
    };
    return this;
  }

  addRule(identifier: string, description: string) {
    if (!this.Rules) {
      this.Rules = {};
    }
    this.Rules[identifier] = {
      description,
    };
    return this;
  }

  addParameter(identifier: string, ref: string) {
    if (!this.Parameters) {
      this.Parameters = {};
    }
    this.Parameters[identifier] = {
      ref,
    };
    return this;
  }

  addOutput(identifier: string, ref: string) {
    if (!this.Outputs) {
      this.Outputs = {};
    }
    this.Outputs[identifier] = {
      ref,
    };
    return this;
  }

}