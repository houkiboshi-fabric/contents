'use strict';

const diff = (a = [], b = []) => {
  if (!a) a = [];
  if (!b) b = [];
  return [...new Set([...a, ...b])].reduce(
    ({ added, deleted }, e) => {
      const isInA = a.includes(e);
      const isInB = b.includes(e);

      if (!isInA && isInB) {
        return {
          added: [...added, e],
          deleted
        };
      }

      if (isInA && !isInB) {
        return {
          added,
          deleted: [...deleted, e]
        };
      }

      return { added, deleted };
    },
    {
      added: [],
      deleted: []
    }
  );
};

module.exports = {
  diff
};
