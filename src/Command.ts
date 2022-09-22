import { Argv } from 'yargs';

export abstract class Command {

  abstract getCommandName(): string;
  abstract getCommandDescription(): string;
  abstract defineCommandOptions(argv: Argv): Argv;
  abstract run(args: any): void;

  registerCommand(cli: Argv) {
    // Register the command in the cli object
    cli.command(this.getCommandName(), this.getCommandDescription(), this.defineCommandOptions, this.run);
  }

}