import { ComparisonResult, ComparisonResults } from './ComparisonResult';


export class ComparisonResultFormatter {

  static format(result: ComparisonResults, format: 'text' | 'json') {
    if (format == 'json') {
      return JSON.stringify(result, null, 4);
    }
    return this.resultToText(result.getDiffs(), 0);
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

  static resultToText(results: ComparisonResult[], indent: number) {
    return results.map(diff => {
      return this.diffToText(diff, indent);
    }).join('\n');
  }

  static diffToText(diff: ComparisonResult, indent: number) {
    const empty = '    '.repeat(indent);
    const prefix = this.formatChangeType(diff.changeType);
    const type = this.formatType(diff.type);
    var line = `${empty}[${prefix}] ${type}: ${diff.identifier}`;
    if (diff.changes) {
      const lines = this.resultToText(diff.changes, indent + 1);
      line = `${line}\n${lines}`;
    }
    return line;
  }


}