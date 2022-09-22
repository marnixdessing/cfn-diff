
import fs from 'fs';
import { CloudAssemblyComperator } from '../src/diff/CloudAssemblyComperator';
import { ComparisonResults, ComparisonResult } from '../src/diff/compare/ComparisonResult';
import { CFTemplate } from '../src/diff/template/CFTemplate';
import { CFTemplateComperator } from '../src/diff/template/CFTemplateComperator';
import { TestTemplateBuilder } from './TestTemplateBuilder';

const CLOUD_ASSEMBLY_DIR = './test/templates';
const CLOUD_ASSEMBLY_OUT_DIR = (nr : number) => `./test/templates/cdk.out.${nr}`;
const CLOUD_ASSEMBLY_OUT_DIR_SUB = (nr : number) => `${CLOUD_ASSEMBLY_OUT_DIR(nr)}/subdir`;

function createDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function expectContainsChange(diff: ComparisonResults | ComparisonResult[], identifier: string, changeType: string, type: string) {
  const input = diff instanceof ComparisonResults ? diff.getDiffs() : diff;
  const found = input.find(c => c.identifier.endsWith(identifier) && c.changeType == changeType && c.type == type);
  expect(found).not.toBeUndefined();
  return found;
}

function logDiff(diff:any) {
  console.log(JSON.stringify(diff, null, 4));
}

function compareTemplates(temp1: string, temp2:string) {
  return new CFTemplateComperator({
    templateA: new CFTemplate(CLOUD_ASSEMBLY_DIR + temp1),
    templateB: new CFTemplate(CLOUD_ASSEMBLY_DIR + temp2),
  }).compare();
}

beforeAll(() => {
  // Create cloud assembly mockup data structure

  // Directories
  createDir(CLOUD_ASSEMBLY_OUT_DIR_SUB(1));
  createDir(CLOUD_ASSEMBLY_OUT_DIR_SUB(2));

  // Templates
  new TestTemplateBuilder() // Base
    .addResource('ResourceA', 'AWS::CF:Dummy')
    .addResource('ResourceB', 'AWS::CF:Dummy')
    .save(CLOUD_ASSEMBLY_DIR + '/base.json');

  new TestTemplateBuilder() // Change compared to base
    .addResource('ResourceA', 'AWS::CF:Dummy2')
    .addResource('ResourceB', 'AWS::CF:Dummy')
    .save(CLOUD_ASSEMBLY_DIR + '/base_change.json');

  new TestTemplateBuilder() // Delete compared to base
    .addResource('ResourceA', 'AWS::CF:Dummy')
    .save(CLOUD_ASSEMBLY_DIR + '/base_deletion.json');

  new TestTemplateBuilder() // Addition compared to base
    .addResource('ResourceA', 'AWS::CF:Dummy')
    .addResource('ResourceB', 'AWS::CF:Dummy')
    .addResource('ResourceC', 'AWS::CF:Dummy')
    .save(CLOUD_ASSEMBLY_DIR + '/base_addition.json');

  new TestTemplateBuilder() // Multiple compared to base (delete ResourceB, change ResourceA, add Resource C)
    .addResource('ResourceA', 'AWS::CF:Dummy2') // Change
    .addResource('ResourceC', 'AWS::CF:Dummy') // New
    .save(CLOUD_ASSEMBLY_DIR + '/base_multiple.json');

  // Simple test cases
  new TestTemplateBuilder()
    .save(CLOUD_ASSEMBLY_DIR + '/empty.json');

  new TestTemplateBuilder()
    .addParameter('ParamA', 'DummyRef')
    .save(CLOUD_ASSEMBLY_DIR + '/param_only.json');

  new TestTemplateBuilder()
    .addRule('RuleA', 'Some rule description')
    .save(CLOUD_ASSEMBLY_DIR + '/rule_only.json');

  new TestTemplateBuilder()
    .addResource('ResourceA', 'AWS::CF::Dummy')
    .save(CLOUD_ASSEMBLY_DIR + '/resource_only.json');

  new TestTemplateBuilder()
    .addOutput('OutputA', 'SomeRef')
    .save(CLOUD_ASSEMBLY_DIR + '/output_only.json');

  // Fill cdk.out dirs!
  new TestTemplateBuilder() // Template in main dir
    .addResource('ResourceA', 'AWS::CF::Dummy')
    .addResource('ResourceB', 'AWS::CF::Dummy')
    .save(CLOUD_ASSEMBLY_OUT_DIR(1) + '/base.template.json');

  new TestTemplateBuilder() // Changed compared to cdk.out.1
    .addResource('ResourceA', 'AWS::CF::Dummy')
    .addResource('ResourceC', 'AWS::CF::Dummy')
    .save(CLOUD_ASSEMBLY_OUT_DIR(2) + '/base.template.json');

  new TestTemplateBuilder() // New in cdk.out.2
    .addResource('ResourceX', 'AWS::CF::Dummy')
    .addResource('ResourceY', 'AWS::CF::Dummy')
    .save(CLOUD_ASSEMBLY_OUT_DIR(2) + '/new.template.json');

  new TestTemplateBuilder() // Template in cdk.out.1/subdir
    .addResource('ResourceX', 'AWS::CF::Dummy')
    .addResource('ResourceY', 'AWS::CF::Dummy')
    .save(CLOUD_ASSEMBLY_OUT_DIR_SUB(1) + '/sub.template.json');

  new TestTemplateBuilder() // Does not exist in cdk.out.2/subdir
    .addResource('ResourceX', 'AWS::CF::Dummy')
    .addResource('ResourceY', 'AWS::CF::Dummy')
    .save(CLOUD_ASSEMBLY_OUT_DIR_SUB(1) + '/sub2.template.json');

  new TestTemplateBuilder() // Changed compared to cdk.out.1/subdir
    .addResource('ResourceX', 'AWS::CF::Dummy')
    .addResource('ResourceZ', 'AWS::CF::Dummy')
    .save(CLOUD_ASSEMBLY_OUT_DIR_SUB(2) + '/sub.template.json');

  // Setup logging
  logDiff({ 'Diffs will be neatly printed': 'like this' });

});

test('Template comparator with same template twice', () => {
  const diff = compareTemplates('/base.json', '/base.json');
  expect(diff.nrOfDiffs()).toBe(0);
  expect(diff.foundDiff()).toBe(false);
});

test('Compare change in template', () => {
  const diff = compareTemplates('/base.json', '/base_change.json');
  expect(diff.nrOfDiffs()).toBe(1);
  expect(diff.foundDiff()).toBe(true);
  expectContainsChange(diff, 'ResourceA', 'changed', 'resource');
});

test('Compare addition in template', () => {
  const diff = compareTemplates('/base.json', '/base_addition.json');
  expect(diff.nrOfDiffs()).toBe(1);
  expectContainsChange(diff, 'ResourceC', 'new', 'resource');
});

test('Compare deletion in template', () => {
  const diff = compareTemplates('/base.json', '/base_deletion.json');
  expect(diff.nrOfDiffs()).toBe(1);
  expectContainsChange(diff, 'ResourceB', 'deleted', 'resource');
});

test('Compare multiple chagnes in template', () => {
  const diff = compareTemplates('/base.json', '/base_multiple.json');
  expect(diff.nrOfDiffs()).toBe(3);
  expectContainsChange(diff, 'ResourceA', 'changed', 'resource');
  expectContainsChange(diff, 'ResourceB', 'deleted', 'resource');
  expectContainsChange(diff, 'ResourceC', 'new', 'resource');
});

test('base vs empty', () => {
  const diff = compareTemplates('/base.json', '/empty.json');
  expect(diff.nrOfDiffs()).toBe(2);
  expectContainsChange(diff, 'ResourceA', 'deleted', 'resource');
  expectContainsChange(diff, 'ResourceB', 'deleted', 'resource');
});

test('base vs param only', () => {
  const diff = compareTemplates('/base.json', '/param_only.json');
  expect(diff.nrOfDiffs()).toBe(3);
  expectContainsChange(diff, 'ResourceA', 'deleted', 'resource');
  expectContainsChange(diff, 'ResourceB', 'deleted', 'resource');
  expectContainsChange(diff, 'ParamA', 'new', 'parameter');
});

test('base vs output only', () => {
  const diff = compareTemplates('/base.json', '/output_only.json');
  expect(diff.nrOfDiffs()).toBe(3);
  expectContainsChange(diff, 'ResourceA', 'deleted', 'resource');
  expectContainsChange(diff, 'ResourceB', 'deleted', 'resource');
  expectContainsChange(diff, 'OutputA', 'new', 'output');
});

test('base vs rule only', () => {
  const diff = compareTemplates('/base.json', '/rule_only.json');
  expect(diff.nrOfDiffs()).toBe(3);
  expectContainsChange(diff, 'ResourceA', 'deleted', 'resource');
  expectContainsChange(diff, 'ResourceB', 'deleted', 'resource');
  expectContainsChange(diff, 'RuleA', 'new', 'rule');
});

test('full directory same', () => {
  const dir = CLOUD_ASSEMBLY_DIR + '/cdk.out.1';
  const diff = new CloudAssemblyComperator({
    cloudAssemblyDirectoryA: dir,
    cloudAssemblyDirectoryB: dir,
  }).compare();
  expect(diff.nrOfDiffs()).toBe(0);
  expect(diff.foundDiff()).toBe(false);
});

test('two different directories', () => {
  const diff = new CloudAssemblyComperator({
    cloudAssemblyDirectoryA: CLOUD_ASSEMBLY_OUT_DIR(1),
    cloudAssemblyDirectoryB: CLOUD_ASSEMBLY_OUT_DIR(2),
  }).compare();

  expect(diff.nrOfDiffs()).toBe(4);
  expect(diff.foundDiff()).toBe(true);
  expectContainsChange(diff, 'cdk.out.2/new.template.json', 'new', 'template');
  expectContainsChange(diff, 'cdk.out.1/subdir/sub2.template.json', 'deleted', 'template');
  const diff1 = expectContainsChange(diff, '/subdir/sub.template.json', 'changed', 'template');
  const diff2 = expectContainsChange(diff, '/base.template.json', 'changed', 'template');
  expect(diff1?.changes).not.toBeUndefined();
  if (diff1?.changes) {
    expectContainsChange(diff1.changes, 'ResourceY', 'deleted', 'resource');
    expectContainsChange(diff1.changes, 'ResourceY', 'deleted', 'resource');
  }
  expect(diff2?.changes).not.toBeUndefined();
  if (diff2?.changes) {
    expectContainsChange(diff2.changes, 'ResourceB', 'deleted', 'resource');
    expectContainsChange(diff2.changes, 'ResourceC', 'new', 'resource');
  }
});


