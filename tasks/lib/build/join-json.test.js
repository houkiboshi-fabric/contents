'use strict';

const { joinJson } = require('./join-json.js');

const configs = [
  {
    property: 'dyeing_material_ids',
    refer: (id, _readJson) => {
      return {
        id,
        name: 'foo'
      };
    },
    entityProperty: 'dyeing_material_entities'
  },
  {
    property: 'raw_material_ids',
    refer: (id, _readJson) => {
      return {
        id,
        name: 'bar'
      };
    },
    entityProperty: 'raw_material_entities'
  },
  {
    property: 'tag_ids',
    refer: (id, _readJson) => {
      return [
        {
          id: 'tag-01',
          label: 'Tag 01'
        },
        {
          id: 'tag-02',
          label: 'Tag 02'
        }
      ].find(tag => tag.id === id);
    },
    entityProperty: 'tag_entities'
  }
];

const data = {
  raw_materials: [
    {
      raw_material_ids: ['cotton'],
      mixing_ratio: {
        decorator: '=',
        percentage: 100
      },
      used_at: '表生地'
    },
    {
      raw_material_ids: ['cotton'],
      mixing_ratio: {
        decorator: '=',
        percentage: 100
      },
      used_at: '裏生地'
    },
    {
      raw_material_ids: ['plastic-fastener'],
      used_at: '部品'
    }
  ],
  dyeing_materials: [
    {
      dyeing_material_ids: ['shiso', 'ready-made']
    }
  ],
  nested: {
    nested: [
      {
        tag_ids: ['tag-01', 'tag-02']
      }
    ]
  }
};

describe('joinJson', () => {
  test('should return cloned data that joined specified entities.', () => {
    const result = joinJson({ data, configs });
    expect(result.dyeing_materials[0].dyeing_material_entities).toEqual([
      {
        id: 'shiso',
        name: 'foo'
      },
      {
        id: 'ready-made',
        name: 'foo'
      }
    ]);
    expect(result.raw_materials[0].raw_material_entities).toEqual([
      {
        id: 'cotton',
        name: 'bar'
      }
    ]);
    expect(result.nested.nested[0].tag_entities).toEqual([
      {
        id: 'tag-01',
        label: 'Tag 01'
      },
      {
        id: 'tag-02',
        label: 'Tag 02'
      }
    ]);
    expect(data.nested.nested[0].tag_entities).toBe(undefined);
  });

  test('should throw Error when entity cannot be found.', () => {
    expect(() => {
      joinJson({
        data: {
          tag_ids: ['tag-03']
        },
        configs
      });
    }).toThrow();
  });
});
