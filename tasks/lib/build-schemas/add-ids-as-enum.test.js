'use strict';

const { addIdsAsEnum } = require('./add-ids-as-enum.js');

const schema = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $id: 'foo.json',
  properties: {
    id: {
      type: 'string',
      pattern: '^[a-z0-9\\-]+$'
    },
    description: {
      type: 'string'
    },
    foo_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          foo_ids: {
            type: 'array',
            items: {
              type: 'string',
              pattern: '^[a-z0-9\\-]+$'
            }
          }
        }
      }
    },
    bar_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          bar_ids: {
            type: 'string',
            pattern: '^[a-z0-9\\-]+$'
          }
        }
      }
    },
    buz_id: {
      type: 'string',
      pattern: '^[a-z0-9\\-]+$'
    },
    qux_ids: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[a-z0-9\\-]+$'
      }
    }
  }
};

describe('addIdsAsEnum', () => {
  test('should return object that added enum under specified properties', () => {
    const ids = ['id1', 'id2', 'id3'];
    const propValuesList = [
      {
        pattern: /^foo_ids?$/,
        values: ids
      },
      {
        pattern: /^bar_ids?$/,
        values: ids
      },
      {
        pattern: /^buz_ids?$/,
        values: ids
      },
      {
        pattern: /^qux_ids?$/,
        values: ids
      }
    ];

    const result = addIdsAsEnum(schema, propValuesList);
    expect(
      result.properties.foo_items.items.properties.foo_ids.items.enum
    ).toEqual(ids);
    expect(result.properties.bar_items.items.properties.bar_ids.enum).toEqual(
      ids
    );
    expect(result.properties.buz_id.enum).toEqual(ids);
    expect(result.properties.qux_ids.items.enum).toEqual(ids);
  });
});
