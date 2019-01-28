'use strict';

const { addDefaultSnippets } = require('./add-default-snippets.js');

const schema = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $id: 'product.json',
  title: 'Product',
  type: 'object',
  required: ['id', 'name', 'size', 'raw_materials', 'dyeing_materials'],
  additionalProperties: false,
  properties: {
    id: {
      examples: ['rakuda', 'yama-no-odori'],
      type: 'string',
      pattern: '^[a-z0-9\\-]+$'
    },
    name: {
      examples: ['駱駝', '山の踊り'],
      type: 'string'
    },
    price: {
      type: 'integer',
      examples: [100000]
    },
    size: {
      type: 'object',
      required: ['width_mm', 'depth_mm'],
      examples: [
        {
          width_mm: 250,
          depth_mm: 250
        },
        {
          width_mm: 250,
          depth_mm: 250,
          height_mm: 250
        }
      ],
      properties: {
        width_mm: {
          type: 'integer',
          minimum: 0,
          examples: [250]
        },
        depth_mm: {
          type: 'integer',
          minimum: 0,
          examples: [250]
        },
        height_mm: {
          type: 'integer',
          minimum: 0,
          examples: [0]
        },
        notes: {
          type: 'array',
          items: {
            type: 'string',
            examples: ['開口部 約 23 cm', '幅計測 フリンジ込み']
          }
        }
      }
    },
    raw_materials: {
      type: 'array',
      examples: [
        [
          {
            raw_material_ids: ['cotton'],
            used_at: '表生地',
            mixing_ratio: {
              percentage: 100,
              decorator: '='
            }
          },
          {
            raw_material_ids: ['wool'],
            used_at: '裏生地',
            mixing_ratio: {
              percentage: 100,
              decorator: '='
            }
          }
        ]
      ],
      items: {
        type: 'object',
        required: ['raw_material_ids'],
        additionalProperties: false,
        examples: [
          {
            raw_material_ids: ['cotton']
          }
        ],
        properties: {
          raw_material_ids: {
            type: 'array',
            items: {
              examples: ['cotton', 'wool', 'hakushu-cotton'],
              type: 'string',
              pattern: '^[a-z0-9\\-]+$'
            }
          },
          used_at: {
            type: 'string',
            examples: ['表生地', '裏生地']
          },
          mixing_ratio: {
            type: 'object',
            required: ['percentage', 'decorator'],
            dependencies: {
              decorator: ['percentage']
            },
            examples: [
              {
                percentage: 100,
                decorator: '='
              }
            ],
            properties: {
              percentage: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                examples: [100, 50, 15]
              },
              decorator: {
                type: 'string',
                enum: ['=', '>=', '<'],
                examples: ['=']
              }
            }
          }
        }
      }
    },
    dyeing_materials: {
      type: 'array',
      examples: [
        [
          {
            dyeing_material_ids: ['cherry'],
            used_at: '表生地'
          },
          {
            dyeing_material_ids: ['madder', 'mint'],
            used_at: '裏生地'
          }
        ]
      ],
      items: {
        type: 'object',
        examples: [
          {
            dyeing_material_ids: ['cherry'],
            used_at: '表生地'
          }
        ],
        required: ['dyeing_material_ids'],
        properties: {
          dyeing_material_ids: {
            description: 'Dyeing material の id のリストです。',
            type: 'array',
            items: {
              examples: ['cherry', 'kumquat', 'citrus', 'madder'],
              type: 'string',
              pattern: '^[a-z0-9\\-]+$'
            }
          },
          used_at: {
            type: 'string',
            examples: ['表生地', '裏生地']
          }
        }
      }
    }
  }
};

const rootSnippetBody = {
  id: 'rakuda',
  name: '駱駝',
  size: {
    width_mm: 250,
    depth_mm: 250
  },
  raw_materials: [
    {
      raw_material_ids: ['cotton']
    }
  ],
  dyeing_materials: [
    {
      dyeing_material_ids: ['cherry']
    }
  ]
};

describe('addDefaultSnippets', () => {
  test('should return object that added default snippets', () => {
    const result = addDefaultSnippets(schema);
    expect(result.defaultSnippets[0].body).toEqual(rootSnippetBody);
    expect(result.properties.size.defaultSnippets[0].body).toEqual(
      rootSnippetBody.size
    );
    expect(result.properties.raw_materials.defaultSnippets[0].body).toEqual(
      rootSnippetBody.raw_materials
    );
    expect(result.properties.dyeing_materials.defaultSnippets[0].body).toEqual(
      rootSnippetBody.dyeing_materials
    );
    expect(
      result.properties.dyeing_materials.items.properties.dyeing_material_ids
        .defaultSnippets[0].body
    ).toEqual(rootSnippetBody.dyeing_materials[0].dyeing_material_ids);
  });
  test('should not have a key "defaultSnippets" when property type was not any of "object" or "array"', () => {
    const result = addDefaultSnippets(schema);
    expect(result.properties.id.defaultSnippets).toBe(undefined);
    expect(result.properties.name.defaultSnippets).toBe(undefined);
    expect(result.properties.price.defaultSnippets).toBe(undefined);
    expect(result.properties.price.defaultSnippets).toBe(undefined);
  });
});
