import fs from 'fs';
import path from 'path';
import { Argv } from 'yargs';
import { Command } from './Command';
import { CloudAssemblyComperator } from './diff/CloudAssemblyComperator';
import { ComparisonResultFormatter } from './diff/compare/ComparisonResultFormatter';

/**
 * Define the diff commando for cli
 */
export class CommandDiff extends Command {

  getCommandName(): string {
    return 'diff [Cloud assembly directory A] [Cloud assembly directory B]';
  }

  getCommandDescription(): string {
    return 'diff between CloudFormation templates in cdk.out folders';
  }

  defineCommandOptions(argv: Argv): Argv {
    return argv
      .positional('CloudassemblydirectoryA', {
        describe: 'cdk.out folder (A) for comparing CloudFormation templates',
      })
      .positional('CloudassemblydirectoryB', {
        describe: 'cdk.out folder (B) for comparing CloudFormation templates',
      })
      .option('output', {
        describe: 'Save the output to a file instead of writing it to stdout',
        alias: 'o',
        default: undefined,
      })
      .option('format', {
        describe: 'The output format to use',
        alias: 'f',
        choices: ['text', 'json'],
        default: 'text',
      })
      .options('silent', {
        describe: 'Do not write to stdout',
        alias: 's',
        default: false,
        boolean: true,
      });
  }

  run(args : any) {

    if (!args.silent) {
      console.log('Comparing cloud assembly directories:');
      console.log('A: ', args.CloudassemblydirectoryA);
      console.log('B: ', args.CloudassemblydirectoryB);
    }

    const diff = new CloudAssemblyComperator({
      cloudAssemblyDirectoryA: args.CloudassemblydirectoryA,
      cloudAssemblyDirectoryB: args.CloudassemblydirectoryB,
    }).compare();

    var output = ComparisonResultFormatter.format(diff, args.format);

    if (args.output) {
      const p = path.resolve(args.output);
      fs.writeFileSync(p, output);
    } else if (!args.silent) {
      console.log('\nComparison results:');
      console.log(output);
    }

    return diff.foundDiff() ? 1 : 0;
  }

}