import { CloudAssemblyResult, templateChangeType, TemplateResult } from './ComparisonResult';

export class ComparisonResultFormatter {

  static readonly SPACE = '    ';

  static format(results: CloudAssemblyResult[]) {
    return this.formatCloudAssemblyResult(results, 0);
  }

  private static formatCloudAssemblyResult(results: CloudAssemblyResult[], indent: number) {
    const lines = [];
    const space = this.SPACE.repeat(indent);
    for (let result of results) {
      if (result.exclude) continue;
      const line = `${space}[${result.changes}] ${result.basename}`;
      lines.push(line);

      if (result.changes) { // changes
        const t = this.formatTemplateResult(result.changes, indent+1);
        lines.push(t);
      }
    }
    return lines.join('\n');
  }

  private static formatTemplateResult(results: TemplateResult[], indent: number) {
    const space = this.SPACE.repeat(indent);
    const lines = [];
    for (let result of results) {
      if (result.exclude) continue;
      const changeType = templateChangeType(result);
      const line = `${space}[${changeType}] ${result.identifier}`;
      lines.push(line);
    }
    return lines.join('\n');
  }

}