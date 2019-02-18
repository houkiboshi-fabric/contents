'use strict';

const { basename, resolve } = require('path');

const glob = require('glob');

const root = resolve(__dirname, '..');
const src = resolve(root, 'src');
const dist = resolve(root, 'dist');
const schemas = resolve(root, 'schemas');
const assets = resolve(root, 'assets');
const tmp = resolve(dist, 'contents');

exports.dirs = {
  root,
  src,
  dist,
  schemas,
  assets,
  tmp
};

exports.SCHEMA_URI =
  'https://houkiboshi-fabric.github.io/schema/ref-parsed/index.json';

exports.archiveDistPath = resolve(dist, 'contents.tar.gz');

const pullIdsFromIndex = (dirPath, readJson) => {
  const pattern = resolve(dirPath, '**', 'index.json');
  return glob
    .sync(pattern)
    .map(path => {
      const { result, error } = readJson(path);
      if (error) return;
      return result.id;
    })
    .filter(e => e);
};

exports.timeStampsConfig = {
  exclude: ['config'].map(p => resolve(src, p))
};

exports.pagePathConfig = {
  exclude: ['config'].map(p => resolve(src, p))
};

exports.enumConfig = {
  dyeing_material_ids: readJson => {
    const dirPath = resolve(src, 'dyeing-materials');
    return pullIdsFromIndex(dirPath, readJson);
  },
  dyeing_material_type_ids: readJson => {
    const dirPath = resolve(src, 'dyeing-material-types');
    return pullIdsFromIndex(dirPath, readJson);
  },
  raw_material_ids: readJson => {
    const dirPath = resolve(src, 'raw-materials');
    return pullIdsFromIndex(dirPath, readJson);
  },
  tag_ids: readJson => {
    const dirPath = resolve(src, 'blog', 'tags');
    return pullIdsFromIndex(dirPath, readJson);
  },
  process_ids: readJson => {
    const dirPath = resolve(src, 'processes');
    return pullIdsFromIndex(dirPath, readJson);
  },
  instruction_category_ids: readJson => {
    const filePath = resolve(src, 'config', 'instructions.json');
    const { result, error } = readJson(filePath);
    if (error) {
      throw new Error(error);
    }
    return result.instruction_categories.map(category => category.id);
  }
};

exports.joinJsonConfigs = [
  {
    property: 'dyeing_material_type_id',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return (
          result.id === id &&
          basename(result.$schema) === 'dyeing-material-type.json'
        );
      });
      return found.result;
    },
    entityProperty: 'dyeing_material_type_entity'
  },
  {
    property: 'dyeing_material_ids',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return (
          result.id === id &&
          basename(result.$schema) === 'dyeing-material.json'
        );
      });
      return found.result;
    },
    entityProperty: 'dyeing_material_entities'
  },
  {
    property: 'raw_material_ids',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return (
          result.id === id && basename(result.$schema) === 'raw-material.json'
        );
      });
      return found.result;
    },
    entityProperty: 'raw_material_entities'
  },
  {
    property: 'tag_ids',
    refer: (id, dataList) => {
      const found = dataList.find(({ result }) => {
        return result.id === id && basename(result.$schema) === 'tag.json';
      });
      return found.result;
    },
    entityProperty: 'tag_entities'
  },
  {
    property: 'instruction_category_id',
    refer: (id, dataList) => {
      const { result } = dataList.find(({ result }) => {
        return basename(result.$schema) === 'instructions.json';
      });
      return result['instruction_categories'].find(
        category => category.id === id
      );
    },
    entityProperty: 'instruction_category_entity'
  }
];

// 手織り
const isMadeByHandWeaving = product => {
  const handWeavingProcessIds = [
    'process-sakiori',
    'process-multi-shaft-table-loom',
    'process-rigid-heddle-table-loom',
    'process-back-strap-loom',
    'process-zoom-loom'
  ];
  return product.process_ids.some(process => {
    return handWeavingProcessIds.includes(process);
  });
};

// 草木染め
const isMadeByKusakiZome = product =>
  product.process_ids.includes('process-kusaki-zome');

// 型染め
const isMadeByKatazome = product =>
  product.process_ids.includes('process-katazome');

// 毛使用
const usesWool = product => {
  return product.raw_materials.filter(e => {
    return e.raw_material_ids.includes('wool').length > 0;
  });
};

// 綿使用
const usesCotton = product => {
  return (
    product.raw_materials.filter(e => {
      return e.raw_material_ids.includes('cotton');
    }).length > 0
  );
};

// 伯州綿使用
const usesHakushuCotton = product => {
  return (
    product.raw_materials.filter(e => {
      return e.raw_material_ids.includes('hakushu-cotton');
    }).length > 0
  );
};

exports.instructionsConfig = {
  instructions: [
    {
      instructionId: 'hand-wash',
      condition: product => !(isMadeByKatazome(product) && usesCotton(product))
    },
    {
      instructionId: 'machine-wash',
      condition: product => isMadeByKatazome(product) && usesCotton(product)
    },
    {
      instructionId: 'neutral-detergent',
      condition: () => true // all products
    },
    {
      instructionId: 'wash-at-low-temperature',
      condition: product => usesWool(product)
    },
    {
      instructionId: 'dry-in-the-shade',
      condition: product => isMadeByKusakiZome(product)
    },
    {
      instructionId: 'dry-after-reshaping',
      condition: product => usesHakushuCotton(product)
    },
    {
      instructionId: 'keep-out-of-direct-sunlight',
      condition: product => isMadeByKusakiZome(product)
    },
    {
      instructionId: 'color-dulling',
      condition: product => isMadeByKusakiZome(product)
    },
    {
      instructionId: 'color-staining',
      condition: product =>
        isMadeByKusakiZome(product) || isMadeByKatazome(product)
    },
    {
      instructionId: 'wash-once-before-use',
      condition: product => isMadeByKatazome(product) && usesCotton(product)
    },
    {
      instructionId: 'change-of-the-texture',
      condition: product => isMadeByKusakiZome(product)
    },
    {
      instructionId: 'variance-of-color-and-pattern',
      condition: () => true // all products
    },
    {
      instructionId: 'color-unevenness-and-blurring',
      condition: product =>
        isMadeByKusakiZome(product) || isMadeByKatazome(product)
    },
    {
      instructionId: 'variance-of-shape',
      condition: product => isMadeByHandWeaving(product)
    },
    {
      instructionId: 'neps',
      condition: product => usesHakushuCotton(product)
    }
  ]
};
