'use strict';

const cloneDeep = require('lodash.clonedeep');

const addIdsAsEnum = (schema, listOfPropAndIds) => {
  const clonedSchema = cloneDeep(schema);
  const props = clonedSchema.properties;

  if (!props) {
    return clonedSchema;
  }

  const searchAndAddEnum = props => {
    Object.keys(props).forEach(key => {
      const val = props[key];
      const matched = listOfPropAndIds.find(e => e.pattern.test(key));

      if (matched && val.type === 'string') {
        props[key].enum = [...matched.values];
      }

      if (val.type === 'object') {
        return searchAndAddEnum(val.properties, listOfPropAndIds);
      }

      if (val.type === 'array') {
        if (val.items.type === 'string' && matched) {
          props[key].items.enum = [...matched.values];
        }
        if (val.items.type === 'object') {
          return searchAndAddEnum(val.items.properties, listOfPropAndIds);
        }
        if (val.items.type === 'array') {
          return searchAndAddEnum(val.items.items, listOfPropAndIds);
        }
      }
    });
  };

  searchAndAddEnum(props);

  return clonedSchema;
};

module.exports = { addIdsAsEnum };
