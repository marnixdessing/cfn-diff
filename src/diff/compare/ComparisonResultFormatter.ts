import { CloudAssemblyResult, TemplateResult } from './ComparisonResult';


export class ComparisonResultFormatter {

  static readonly SPACE = '    ';

  static format(result: CloudAssemblyResult[], format: 'text' | 'json') {
    if (format == 'json') {
      return JSON.stringify(result, null, 4);
    }
    return this.formatCloudAssemblyResult(result, 0);
  }

  static formatChangeType(changeType: string) {
    switch (changeType) {
      case 'new':
        return '+';
      case 'deleted':
        return '-';
      case 'changed':
        return '~';
      default:
        return '';
    }
  }

  static formatType(type: string) {
    return type.charAt(0).toUpperCase() + type.substring(1).toLowerCase();
  }

  static formatCloudAssemblyResult(results: CloudAssemblyResult[], indent: number) {
    const lines = [];
    const space = this.SPACE.repeat(indent);
    for (let result of results) {
      if (result.exclude) continue;
      let icon = '+';
      let t = undefined;
      if (result.changes) { // changes
        t = this.formatTemplateResult(result.changes, indent+1);
        icon = '~';
      } else if (!result.pathA && result.pathB) { // New
        icon = '+';
      } else if (result.pathA && !result.pathB) { // Deleted
        icon = '-';
      }
      const line = `${space}[${icon}] ${result.basename}`;
      lines.push(line);
      if (t) {
        lines.push(t);
      }
    }
    return lines.join('\n');
  }

  static formatTemplateResult(results: TemplateResult[], indent: number) {
    const space = this.SPACE.repeat(indent);
    const lines = [];
    for (let result of results) {
      if (result.exclude) continue;
      let icon = '+';
      if (result.a && result.b) { // Changed
        icon = '~';
      } else if (!result.a && result.b) { // New
        icon = '+';
      } else if (result.a && !result.b) { // Deleted
        icon = '-';
      }
      const line = `${space}[${icon}] ${result.identifier}`;
      lines.push(line);
    }

    return lines.join('\n');
  }

}