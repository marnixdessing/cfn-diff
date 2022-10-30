const { typescript } = require('projen');
const { NpmAccess } = require('projen/lib/javascript');
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'cfn-diff',
  release: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  deps: [
    'yargs',
    '@types/yargs',
    'lodash',
    '@types/lodash',
    'compare-lists',
    'deep-object-diff',
    'glob',
    '@types/glob',
    'yaml',
  ],
  gitignore: [
    'test/templates',
  ],
  bin: {
    'cfn-diff': './lib/index.js',
  },
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();