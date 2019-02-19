'use strict';

const { compareAssetIndex } = require('./compare-asset-index.js');

describe('compareIndex()', () => {
  test('should return arrays of added item paths as a property "added" when remote had that item, but local did not', () => {
    const local = [];
    const remote = [
      {
        path: 'a',
        hash: 'a'
      }
    ];
    const result = compareAssetIndex(local, remote);
    expect(result).toEqual({
      added: ['a'],
      updated: [],
      deleted: []
    });
  });

  test('should return arrays of updated item paths as a property "updated" when local and remote had an item that was same paths and different hashes', () => {
    const local = [
      {
        path: 'a',
        hash: 'a'
      }
    ];
    const remote = [
      {
        path: 'a',
        hash: 'a-modified'
      }
    ];
    const result = compareAssetIndex(local, remote);
    expect(result).toEqual({
      added: [],
      updated: ['a'],
      deleted: []
    });
  });

  test('should return arrays of deleted item paths as a property "deleted" when local had that, but remote did not', () => {
    const local = [
      {
        path: 'a',
        hash: 'a'
      }
    ];
    const remote = [];
    const result = compareAssetIndex(local, remote);
    expect(result).toEqual({
      added: [],
      updated: [],
      deleted: ['a']
    });
  });

  test('should return empty arrays as properties "added", "updated", "deleted" when local and remote are equal', () => {
    const localA = [
      {
        path: 'a',
        hash: 'a'
      }
    ];
    const remoteA = [
      {
        path: 'a',
        hash: 'a'
      }
    ];
    const resultA = compareAssetIndex(localA, remoteA);
    expect(resultA).toEqual({
      added: [],
      updated: [],
      deleted: []
    });
    const localB = [];
    const remoteB = [];
    const resultB = compareAssetIndex(localB, remoteB);
    expect(resultB).toEqual({
      added: [],
      updated: [],
      deleted: []
    });
  });
});
