/**
 * Define what a difference should look like
 */
export interface ComparisonResult {
  /**
   * A difference is always an addition (new), a deltion (deleted)
   * or an change of existing object (changed).
   */
  changeType: 'new' | 'deleted' | 'changed';

  /**
   * If changes it is possible to list the changes here.
   */
  changes?: ComparisonResult[];

  /**
   * Identifier of the difference
   */
  identifier: string;

  /**
   * Type of object that has changed.
   * E.g. CF resource or CF stack.
   */
  type: string;

  /**
   * Description of the change
   */
  description?: string;

}

/**
 * Class used for collecting the diff results.
 */
export class ComparisonResults {

  /**
   * Collection of the differences found in a comparison
   */
  private diffs: ComparisonResult[] = [];

  /**
   * Returns true if there are any new, deleted or changed resources between
   * cloud assembly directory A and B. False otherwiese.
   * @returns hasChanged
   */
  public foundDiff() {
    return this.nrOfDiffs() != 0;
  }

  public nrOfDiffs() {
    return this.diffs.length;
  }

  public getDiffs() {
    return this.diffs;
  }

  /**
   * A new object is found in the comparison
   * @param identifier the identifier of the new object
   */
  public addNew(identifier: string, type: string) {
    this.diffs.push({
      changeType: 'new',
      identifier: identifier,
      type,
    });
  }

  /**
   * A object is deleted in the comparison
   * @param identifier the identifier of the deleted object
   */
  public addDeleted(identifier: string, type: string) {
    this.diffs.push({
      changeType: 'deleted',
      identifier: identifier,
      type,
    });
  }

  /**
   * An exsiting object changed in the comparison
   * @param identifier the identifier of the new object
   * @param changes a description of the changes
   */
  public addChanged(identifier: string, type: string, changes?: ComparisonResult[], description?: string) {
    this.diffs.push({
      changeType: 'changed',
      changes,
      identifier: identifier,
      type,
      description,
    });
  }

}