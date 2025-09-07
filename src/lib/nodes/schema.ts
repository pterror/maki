import { z } from "zod/v4";
import { schemaType } from "./sharedTypes";
import { Schema } from "./zodHelpers";
import { defineNode, Editor } from "baklavajs";
import {
  bigintType,
  booleanType,
  listType,
  nodeInterface,
  nodeInterfaceType,
  numberType,
  stringDictType,
  stringType,
  undefinedType,
  unknownType,
} from "./interfaceTypes";

export const Literal = z.union([
  z.string(),
  z.number(),
  z.bigint(),
  z.boolean(),
  z.null(),
  z.undefined(),
]);
export type Literal = z.infer<typeof Literal>;

export const literalType = nodeInterfaceType<Literal>("Literal", {
  format: "literal",
});
stringType.addConversion(literalType, (v) => v);
numberType.addConversion(literalType, (v) => v);
bigintType.addConversion(literalType, (v) => v);
booleanType.addConversion(literalType, (v) => v);
undefinedType.addConversion(literalType, (v) => v);

const unknownSchema = z.unknown();

export function schemaInterfaceFactory(name: string) {
  return () => nodeInterface(name, schemaType, unknownSchema);
}

export const LiteralSchemaNode = defineNode({
  type: "LiteralSchemaNode",
  inputs: {
    value: () => nodeInterface("Value", unknownType, null),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ value }) {
    return { schema: z.literal(value as Literal) };
  },
});
export function registerLiteralSchemaNode(editor: Editor) {
  editor.registerNodeType(LiteralSchemaNode, { category: "Schema" });
}

export const ObjectSchemaNode = defineNode({
  type: "ObjectSchemaNode",
  inputs: {
    properties: () =>
      nodeInterface("Properties", stringDictType(schemaType), {}),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ properties }) {
    return { schema: z.object(properties) };
  },
});
export function registerObjectSchemaNode(editor: Editor) {
  editor.registerNodeType(ObjectSchemaNode, { category: "Schema" });
}

export const ArraySchemaNode = defineNode({
  type: "ArraySchemaNode",
  inputs: {
    itemSchema: schemaInterfaceFactory("Item Schema"),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ itemSchema }) {
    return { schema: z.array(itemSchema) };
  },
});
export function registerArraySchemaNode(editor: Editor) {
  editor.registerNodeType(ArraySchemaNode, { category: "Schema" });
}

export const UnionSchemaNode = defineNode({
  type: "UnionSchemaNode",
  inputs: {
    schemas: () => nodeInterface("Schemas", listType(schemaType), []),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ schemas }) {
    return { schema: z.union(schemas) };
  },
});
export function registerUnionSchemaNode(editor: Editor) {
  editor.registerNodeType(UnionSchemaNode, { category: "Schema" });
}

export const IntersectionSchemaNode = defineNode({
  type: "IntersectionSchemaNode",
  inputs: {
    firstSchema: schemaInterfaceFactory("Schema"),
    secondSchema: schemaInterfaceFactory("Schema"),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ firstSchema, secondSchema }) {
    return { schema: z.intersection(firstSchema, secondSchema) };
  },
});
export function registerIntersectionSchemaNode(editor: Editor) {
  editor.registerNodeType(IntersectionSchemaNode, { category: "Schema" });
}

export const TupleSchemaNode = defineNode({
  type: "TupleSchemaNode",
  inputs: {
    itemSchemas: () => nodeInterface("Schemas", listType(schemaType), []),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ itemSchemas }) {
    return { schema: z.tuple(itemSchemas as [Schema, ...Schema[]]) };
  },
});
export function registerTupleSchemaNode(editor: Editor) {
  editor.registerNodeType(TupleSchemaNode, { category: "Schema" });
}

export const RecordSchemaNode = defineNode({
  type: "RecordSchemaNode",
  inputs: {
    valueSchema: schemaInterfaceFactory("Value Schema"),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ valueSchema }) {
    return { schema: z.record(z.string(), valueSchema) };
  },
});
export function registerRecordSchemaNode(editor: Editor) {
  editor.registerNodeType(RecordSchemaNode, { category: "Schema" });
}

export const EnumSchemaNode = defineNode({
  type: "EnumSchemaNode",
  inputs: {
    values: () => nodeInterface("Values", listType(stringType), []),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ values }) {
    return { schema: z.enum(values) };
  },
});
export function registerEnumSchemaNode(editor: Editor) {
  editor.registerNodeType(EnumSchemaNode, { category: "Schema" });
}

export const UnknownSchemaNode = defineNode({
  type: "UnknownSchemaNode",
  inputs: {},
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate() {
    return { schema: z.unknown() };
  },
});
export function registerUnknownSchemaNode(editor: Editor) {
  editor.registerNodeType(UnknownSchemaNode, { category: "Schema" });
}

export const OptionalSchemaNode = defineNode({
  type: "OptionalSchemaNode",
  inputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ schema }) {
    return { schema: schema.optional() };
  },
});
export function registerOptionalSchemaNode(editor: Editor) {
  editor.registerNodeType(OptionalSchemaNode, { category: "Schema" });
}

export const NullableSchemaNode = defineNode({
  type: "NullableSchemaNode",
  inputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  outputs: {
    schema: schemaInterfaceFactory("Schema"),
  },
  calculate({ schema }) {
    return { schema: schema.nullable() };
  },
});
export function registerNullableSchemaNode(editor: Editor) {
  editor.registerNodeType(NullableSchemaNode, { category: "Schema" });
}

export function registerSchemaNodes(editor: Editor) {
  registerLiteralSchemaNode(editor);
  registerObjectSchemaNode(editor);
  registerArraySchemaNode(editor);
  registerUnionSchemaNode(editor);
  registerIntersectionSchemaNode(editor);
  registerTupleSchemaNode(editor);
  registerRecordSchemaNode(editor);
  registerEnumSchemaNode(editor);
  registerUnknownSchemaNode(editor);
  registerOptionalSchemaNode(editor);
  registerNullableSchemaNode(editor);
}
