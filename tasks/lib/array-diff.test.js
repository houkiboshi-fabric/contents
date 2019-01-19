'use strict';

const { diff } = require('./array-diff.js');

describe('diff', () => {
  test('should return an object that has "added" and "deleted" properties when 2 arrays were passed', () => {
    const result = diff(['a', 'b', 'c'], ['b', 'c', 'd']);
    const expected = {
      added: ['d'],
      deleted: ['a']
    };
    expect(result).toEqual(expected);
  });

  test('should return an object that has "added" and "deleted" properties when falsy values was passed', () => {
    const result = diff(null, undefined);
    const expected = {
      added: [],
      deleted: []
    };
    expect(result).toEqual(expected);
  });
});
