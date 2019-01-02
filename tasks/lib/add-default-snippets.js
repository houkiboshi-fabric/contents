'use strict';

const cloneDeep = require('lodash.clonedeep');

const getExampleValues = schema => {
  const { type } = schema;

  if (type === 'object') {
    const { required, properties } = schema;
    if (required && required.length > 0) {
      return required.reduce((acm, cur) => {
        return {
          ...acm,
          [cur]: getExampleValues(properties[cur])
        };
      }, {});
    }
  }

  if (type === 'array') {
    const { items } = schema;
    return [getExampleValues(items)];
  }

  const exampleValue = schema.examples[0];

  if (typeof exampleValue === 'undefined') {
    throw new Error(`Cannot find examples in ${schema}`);
  }

  return exampleValue;
};

const addDefaultSnippets = schema => {
  const clonedSchema = cloneDeep(schema);
  const description =
    'Expand a snippet that includes required keys and values using examples in JSON Schema';

  const addDefaultSnippetsRecursively = (schema, key = null) => {
    if (schema.type === 'object') {
      schema.defaultSnippets = [
        {
          label: `Create new ${schema.title || key} from a snippet`,
          description,
          body: getExampleValues(schema)
        }
      ];
      if (schema.required && schema.required.length > 0) {
        schema.required.forEach(key => {
          return addDefaultSnippetsRecursively(schema.properties[key], key);
        });
      }
    }

    if (schema.type === 'array') {
      schema.defaultSnippets = [
        {
          label: `Create new ${key} from a snippet`,
          description,
          body: getExampleValues(schema)
        }
      ];
      const itemType = schema.items.type;
      if (itemType === 'object' || itemType === 'array') {
        return addDefaultSnippetsRecursively(schema.items, key);
      }
    }
  };

  addDefaultSnippetsRecursively(clonedSchema);

  return clonedSchema;
};

module.exports = { addDefaultSnippets };
