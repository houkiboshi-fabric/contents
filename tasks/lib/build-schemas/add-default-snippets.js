'use strict';

const cloneDeep = require('lodash.clonedeep');

const fallbackMap = {
  string: '',
  number: 0,
  integer: 0,
  boolean: true,
  null: null
};

const findTypedScope = schema => {
  if (schema.type) {
    return schema;
  }

  const keyword = Object.keys(schema).find(key => {
    return ['oneOf', 'allOf', 'anyOf'].includes(key);
  });

  return schema[keyword].find(prop => prop.type);
};

const getExampleValues = schema => {
  const typed = findTypedScope(schema);
  const { type } = typed;

  if (type === 'object') {
    const { required, properties } = typed;
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
    const { items } = typed;
    return [getExampleValues(items)];
  }

  const exampleValue = schema.examples
    ? schema.examples[0]
    : schema.default
    ? schema.default
    : fallbackMap[type];

  if (typeof exampleValue === 'undefined') {
    console.warn(`Cannot find examples or default value.`);
    console.dir(schema);
    return null;
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
