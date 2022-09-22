import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CommandDiff } from './CommandDiff';

const cli = yargs(hideBin(process.argv));
new CommandDiff().registerCommand(cli);
cli.parseSync();