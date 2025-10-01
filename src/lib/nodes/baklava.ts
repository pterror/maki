import {
  CheckboxInterface,
  defineNode,
  Editor,
  IntegerInterface,
  NodeInterface,
  NumberInterface,
  SelectInterface,
  setType,
  TextInputInterface,
  TextInterface,
  type NodeInterfaceType,
} from "baklavajs";
import type { JSONSchema } from "zod/v4/core";
import {
  allInterfaceTypesRegistriesNeedingDerivedTypes,
  interfaceTypesById,
  listType,
  nodeInterfaceType,
  setUnknownListType,
  setUnknownStringDictType,
  setUnknownType,
  stringDictType,
} from "./interfaceTypes.ts";
import { unsafeEntries } from "../core.ts";
import { camelCaseToPascalCase, camelCaseToTitleCase } from "../string.ts";
import { normalizeJsonSchema } from "./zodHelpers.ts";
import { allEditorsNeedingDerivedNodes } from "./allEditorsNeedingDerivedNodes.ts";
import { getTypeNameFromSchema } from "../jsonSchema.ts";

export function nodeInterfaceTypeToNodeInterface(
  key: string,
  interfaceType: NodeInterfaceType<any>,
): NodeInterface<any> {
  switch (interfaceType.name) {
    case "string": {
      return new TextInputInterface(key, "").use(setType, interfaceType);
    }
    case "integer": {
      return new IntegerInterface(key, 0).use(setType, interfaceType);
    }
    case "number": {
      return new NumberInterface(key, 0).use(setType, interfaceType);
    }
    case "boolean": {
      return new CheckboxInterface(key, false).use(setType, interfaceType);
    }
  }
  return new NodeInterface(key, null).use(setType, interfaceType);
}

export function jsonSchemaToNodeInterface(
  key: string,
  value: JSONSchema._JSONSchema,
): NodeInterface<any> {
  const interfaceType = upsertBaklavaType(
    typeof value === "boolean" ? {} : value,
  ) as NodeInterfaceType<any>;
  if (typeof value !== "boolean") {
    switch (value.type) {
      case "boolean": {
        return new CheckboxInterface(key, false).use(setType, interfaceType);
      }
      case "string": {
        if (value.enum) {
          return new SelectInterface(
            key,
            value.enum[0],
            value.enum.map((value) => ({ text: String(value), value })),
          ).use(setType, interfaceType);
        }
        return new TextInputInterface(key, "").use(setType, interfaceType);
      }
      case "integer": {
        return new IntegerInterface(key, 0).use(setType, interfaceType);
      }
      case "number": {
        return new NumberInterface(key, 0).use(setType, interfaceType);
      }
    }
  }
  return new NodeInterface(key, null).use(setType, interfaceType);
}

export function jsonSchemaToOutputNodeInterface(
  key: string,
  value: JSONSchema._JSONSchema,
) {
  const interfaceType = upsertBaklavaType(
    typeof value === "boolean" ? {} : value,
  ) as NodeInterfaceType<any>;
  if (typeof value !== "boolean") {
    switch (value.type) {
      case "string": {
        if (value.format === "text-display") {
          return new TextInterface(key, "").use(setType, interfaceType);
        }
      }
    }
  }
  return new NodeInterface(key, null).use(setType, interfaceType);
}

export function upsertBaklavaType(
  type: JSONSchema.JSONSchema,
): NodeInterfaceType<unknown> {
  const jsonSchema = normalizeJsonSchema(structuredClone(type));
  const id = JSON.stringify(jsonSchema);
  const existing = interfaceTypesById.get(id);
  if (existing) return existing;
  const typeName = getTypeNameFromSchema(type);
  if (typeName === undefined) {
    console.error("Issue with type:", type, `(id: ${id})`);
    throw new Error("This Zod type is missing a name.");
  }
  const interfaceType = nodeInterfaceType(typeName, jsonSchema);
  interfaceTypesById.set(id, interfaceType);
  for (const typesRef of allInterfaceTypesRegistriesNeedingDerivedTypes) {
    const types = typesRef.deref();
    if (!types) continue;
    types.addTypes(interfaceType);
  }
  switch (type.type) {
    case "array": {
      if (!type.items || !Array.isArray(type.items)) {
        const itemsSchema = Array.isArray(type.items)
          ? type.additionalItems
          : type.items;
        if (itemsSchema) {
          const actualInterfaceType = listType(
            upsertBaklavaType(
              typeof itemsSchema === "object" ? itemsSchema : {},
            ),
          );
          interfaceTypesById.set(id, actualInterfaceType);
        }
        break;
      }
      const typeItems = type.items;
      const ConstructNode = defineNode({
        type: `Construct${camelCaseToPascalCase(typeName)}Node`,
        inputs: Object.fromEntries(
          type.items.map((schema, index) => [
            `item${index + 1}`,
            () => jsonSchemaToNodeInterface(`Item ${index + 1}`, schema),
          ]),
        ),
        outputs: {
          value: () =>
            new NodeInterface<unknown>("Value", null).use(
              setType,
              interfaceType,
            ),
        },
        calculate(inputs) {
          return {
            value: typeItems.map(
              (_, index) => (inputs as any)[`item${index + 1}`],
            ) as never,
          };
        },
      });
      function registerConstructNode(editor: Editor) {
        editor.registerNodeType(ConstructNode, {
          title: typeName
            ? `Construct ${camelCaseToTitleCase(typeName)}`
            : "Construct",
          category: "Tuple Construction",
        });
      }
      const DeconstructNode = defineNode({
        type: `Deconstruct${camelCaseToPascalCase(typeName)}Node`,
        inputs: {
          value: () =>
            new NodeInterface<unknown>("Value", null).use(
              setType,
              interfaceType,
            ),
        },
        outputs: Object.fromEntries(
          typeItems.map((item, index) => [
            `item${index + 1}`,
            () =>
              new NodeInterface<unknown>(`Item ${index + 1}`, null).use(
                setType,
                upsertBaklavaType(typeof item === "boolean" ? {} : item),
              ),
          ]),
        ),
        calculate(inputs) {
          return Object.fromEntries(
            typeItems.map((_, index) => [
              `item${index + 1}`,
              (inputs.value as readonly unknown[])[index],
            ]),
          );
        },
      });
      function registerDeconstructNode(editor: Editor) {
        editor.registerNodeType(DeconstructNode, {
          title: typeName
            ? `Deconstruct ${camelCaseToTitleCase(typeName)}`
            : "Deconstruct",
          category: "Tuple Construction",
        });
      }
      for (const editor of allEditorsNeedingDerivedNodes) {
        const editorInstance = editor.deref();
        if (!editorInstance) continue;
        registerConstructNode(editorInstance);
        registerDeconstructNode(editorInstance);
      }
    }
    case "object": {
      if (!type.properties) {
        if (type.additionalProperties) {
          if (type.additionalProperties === true) {
            const actualInterfaceType = stringDictType(upsertBaklavaType({}));
            interfaceTypesById.set(id, actualInterfaceType);
          } else if (typeof type.additionalProperties === "object") {
            const actualInterfaceType = stringDictType(
              upsertBaklavaType(type.additionalProperties),
            );
            interfaceTypesById.set(id, actualInterfaceType);
          }
        }
        break;
      }
      const ConstructNode = defineNode({
        type: `Construct${camelCaseToPascalCase(typeName)}Node`,
        inputs: Object.fromEntries(
          unsafeEntries(type.properties).flatMap(([key, schema]) =>
            schema === false
              ? []
              : [
                  [
                    key,
                    () =>
                      jsonSchemaToNodeInterface(
                        camelCaseToTitleCase(key),
                        schema,
                      ),
                  ],
                ],
          ),
        ),
        outputs: {
          value: () =>
            new NodeInterface<unknown>("Value", null).use(
              setType,
              interfaceType,
            ),
        },
      });
      function registerConstructNode(editor: Editor) {
        editor.registerNodeType(ConstructNode, {
          title: typeName
            ? `Construct ${camelCaseToTitleCase(typeName)}`
            : "Construct",
          category: "Object Construction",
        });
      }
      const DeconstructNode = defineNode({
        type: `Deconstruct${camelCaseToPascalCase(typeName)}Node`,
        inputs: {
          value: () =>
            new NodeInterface<unknown>("Value", null).use(
              setType,
              interfaceType,
            ),
        },
        outputs: Object.fromEntries(
          unsafeEntries(type.properties).flatMap(([key, value]) =>
            value === false
              ? []
              : [
                  [
                    key,
                    () =>
                      new NodeInterface<unknown>(
                        camelCaseToTitleCase(key),
                        null,
                      ).use(
                        setType,
                        upsertBaklavaType(value === true ? {} : value),
                      ),
                  ],
                ],
          ),
        ),
      });
      function registerDeconstructNode(editor: Editor) {
        editor.registerNodeType(DeconstructNode, {
          title: typeName
            ? `Deconstruct ${camelCaseToTitleCase(typeName)}`
            : "Deconstruct",
          category: "Object Deconstruction",
        });
      }
      for (const editor of allEditorsNeedingDerivedNodes) {
        const editorInstance = editor.deref();
        if (!editorInstance) continue;
        registerConstructNode(editorInstance);
        registerDeconstructNode(editorInstance);
      }
    }
    case undefined: {
      if (type.allOf) {
        for (const subType of type.allOf) {
          upsertBaklavaType(subType);
        }
      }
      if (type.anyOf) {
        for (const subType of type.anyOf) {
          upsertBaklavaType(subType);
        }
      }
      break;
    }
  }
  return interfaceType;
}

setUnknownType(upsertBaklavaType({}) as NodeInterfaceType<unknown>);
setUnknownListType(
  upsertBaklavaType({ type: "array", items: {} }) as NodeInterfaceType<
    unknown[]
  >,
);
setUnknownStringDictType(
  upsertBaklavaType({
    type: "object",
    additionalProperties: {},
  }) as NodeInterfaceType<Record<string, unknown>>,
);
