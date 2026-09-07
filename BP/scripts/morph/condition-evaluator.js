export function evaluateCondition(entity, condition) {
  let evaluatedCondition = condition;

  if (condition.isPlayer !== undefined && condition.isMob !== undefined) {
    evaluatedCondition = entity.typeId === "minecraft:player" ? condition.isPlayer : condition.isMob;
  }
  
  return evaluateConditionByType(entity, evaluatedCondition);
}

const conditionTypes = {
  and: (entity, condition) => evaluateLogicalGroup(entity, condition, { logicalType: "and", method: "every" }),
  or: (entity, condition) => evaluateLogicalGroup(entity, condition, { logicalType: "or", method: "some" }),
  component: (entity, condition) => evaluateAttribute(entity, condition, {
    attributeType: "component",
    hasAttribute: "hasComponent",
    getAttribute: "getComponent",
    getValue: component => component.value
  }),
  property: (entity, condition) => evaluateAttribute(entity, condition, {
    attributeType: "property",
    hasAttribute: "hasProperty",
    getAttribute: "getProperty",
    getValue: property => property
  }),
  nameTag: (entity, condition) => evaluateNameTag(entity, condition)
}

function evaluateConditionByType(entity, condition) {
  for (const key in condition) {
    const conditionHandler = conditionTypes[key];
    if (conditionHandler !== undefined) {
      return conditionHandler(entity, condition);
    }
  }

  console.error(`Unknown condition: ${JSON.stringify(condition)}`);
  return false;
}

function evaluateLogicalGroup(entity, condition, options) {
  const { logicalType, method } = options;
  const conditions = condition[logicalType];
  
  const fieldKeys = Object.keys(condition);
  if (fieldKeys.length !== 1) {
    const ignoredFields = fieldKeys.filter(key => key !== logicalType);
    console.warn(`The '${logicalType}' condition must only contain one field in an object. Following fields will be ignored: ${ignoredFields.join(", ")}`);
  }

  if (!Array.isArray(conditions)) {
    console.error(`The '${logicalType}' condition must be an array`);
    return false;
  }

  return conditions[method](condition => evaluateConditionByType(entity, condition));
}

function evaluateOperator(left, operator, right) {
  switch (operator) {
    case "==": return left === right;
    case "!=": return left !== right;
    case ">": return left > right;
    case "<": return left < right;
    case ">=": return left >= right;
    case "<=": return left <= right;
    default:
      console.error(`Unknown operator: '${operator}'`);
      return false;
  }
}

function evaluateAttribute(entity, condition, options) {
  const { attributeType, hasAttribute, getAttribute, getValue } = options;
  const { method = "has", operator = "==", value } = condition;
  const attributeName = condition[attributeType];

  switch (method) {
    case "has":
      if (value !== undefined) console.warn(`The '${method}' method is in use, the 'value' field is ignored`);
      return evaluateOperator(entity[hasAttribute](attributeName), operator, true);

    case "get":
      const attribute = entity[getAttribute](attributeName);

      if (attribute === undefined) {
        console.error(`The entity does not have a '${attributeName}' ${attributeType}`);
        return false;
      } else {
        return evaluateOperator(getValue(attribute), operator, value);
      }

    default:
      console.error(`Unknown method: '${method}'`);
      return false;
  }
}

function evaluateNameTag(entity, condition) {
  const { nameTag, operator = "==" } = condition;
  return evaluateOperator(entity.nameTag, operator, nameTag);
}