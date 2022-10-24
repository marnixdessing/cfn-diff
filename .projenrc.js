const { typescript } = require('projen');
const { NpmAccess } = require('projen/lib/javascript');
const project = new typescript.TypeScriptAppProject({
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
  ],
  gitignore: [
    'test/templates',
  ],
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();