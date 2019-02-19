'use strict';

const compareAssetIndex = (local = [], remote = []) => {
  const updatedAndDeleted = local.reduce(
    (acm, cur) => {
      const pathMatched = remote.find(file => file.path === cur.path);
      // this file has been deleted on remote
      if (!pathMatched) {
        return {
          updated: acm.updated,
          deleted: [...acm.deleted, cur.path]
        };
      }
      // this file has been updated on remote
      if (pathMatched.hash !== cur.hash) {
        return {
          updated: [...acm.updated, cur.path],
          deleted: acm.deleted
        };
      }
      // this file has not been modified
      return acm;
    },
    {
      updated: [],
      deleted: []
    }
  );
  const added = remote.reduce((acm, cur) => {
    const pathMatched = local.find(file => file.path === cur.path);
    // this file has been added
    if (!pathMatched) {
      return [...acm, cur.path];
    }

    return acm;
  }, []);

  return {
    added,
    ...updatedAndDeleted
  };
};

module.exports = {
  compareAssetIndex
};
