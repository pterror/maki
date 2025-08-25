import { defineNode, Editor, type NodeInterfaceType } from "baklavajs";
import type { JSONSchema } from "zod/v4/core";
import {
  checkboxInterface,
  integerInterface,
  listType,
  nodeInterface,
  nodeInterfaceType,
  numberInterface,
  stringDictType,
  textInputInterface,
  unknownType,
} from "./interfaceTypes";
import { unsafeEntries } from "../core";
import { camelCaseToPascalCase, camelCaseToTitleCase } from "../string";
import { allEditorsNeedingDerivedNodes } from "./core";

const typesMap = new Map<string, NodeInterfaceType<any>>();

export function upsertBaklavaType(type: JSONSchema.JSONSchema) {
  const id = JSON.stringify(type);
  const existing = typesMap.get(id);
  if (existing) return existing;
  const typeName = type.title;
  if (typeName === undefined) {
    console.error("Issue with Zod type:", type);
    throw new Error("This Zod type is missing a name.");
  }
  const interfaceType = nodeInterfaceType(typeName);
  typesMap.set(id, interfaceType);
  switch (type.type) {
    case "array": {
      if (!type.items || !Array.isArray(type.items)) {
        const itemsSchema = Array.isArray(type.items)
          ? type.items
          : type.additionalItems;
        if (itemsSchema) {
          if (itemsSchema === true) {
            const actualInterfaceType = listType(unknownType);
            typesMap.set(id, actualInterfaceType);
          } else if (typeof itemsSchema === "object") {
            const actualInterfaceType = listType(
              upsertBaklavaType(itemsSchema),
            );
            typesMap.set(id, actualInterfaceType);
          }
        }
        break;
      }
      const typeItems = type.items;
      const ConstructNode = defineNode({
        type: `Construct${camelCaseToPascalCase(typeName)}Node`,
        inputs: {
          value: () => nodeInterface("Value", interfaceType),
        },
        outputs: Object.fromEntries(
          type.items.map((item, index) => [
            `item${index + 1}`,
            () =>
              nodeInterface(
                `Item ${index + 1}`,
                typeof item === "boolean"
                  ? unknownType
                  : upsertBaklavaType(item),
              ),
          ]),
        ),
        calculate(inputs) {
          return typeItems.map(
            (_, index) => (inputs as any)[`item${index + 1}`],
          );
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
          value: () => nodeInterface("Value", interfaceType),
        },
        outputs: Object.fromEntries(
          typeItems.map((item, index) => [
            `item${index + 1}`,
            () =>
              nodeInterface(
                `Item ${index + 1}`,
                typeof item === "boolean"
                  ? unknownType
                  : upsertBaklavaType(item),
              ),
          ]),
        ),
        calculate(inputs) {
          return typeItems.map(
            (_, index) => (inputs as any)[`item${index + 1}`],
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
            const actualInterfaceType = stringDictType(unknownType);
            typesMap.set(id, actualInterfaceType);
          } else if (typeof type.additionalProperties === "object") {
            const actualInterfaceType = stringDictType(
              upsertBaklavaType(type.additionalProperties),
            );
            typesMap.set(id, actualInterfaceType);
          }
        }
        break;
      }
      const ConstructNode = defineNode({
        type: `Construct${camelCaseToPascalCase(typeName)}Node`,
        inputs: Object.fromEntries(
          unsafeEntries(type.properties).flatMap(([key, value]) =>
            value === false
              ? []
              : [
                  [
                    key,
                    () => {
                      const titleCaseKey = camelCaseToTitleCase(key);
                      if (typeof value === "boolean") {
                        return nodeInterface(titleCaseKey, unknownType);
                      }
                      switch (value.type) {
                        case "boolean":
                          return checkboxInterface(titleCaseKey);
                        case "string":
                          return textInputInterface(titleCaseKey);
                        case "number":
                          if (
                            // Zod-specific format for integers between -2^53 and 2^53
                            value.format === "safeint" ||
                            // Conventional format for integers
                            (value.multipleOf && value.multipleOf % 1 === 0)
                          ) {
                            return integerInterface(titleCaseKey);
                          }
                          return numberInterface(titleCaseKey);
                      }
                      return nodeInterface(
                        titleCaseKey,
                        upsertBaklavaType(value),
                      );
                    },
                  ],
                ],
          ),
        ),
        outputs: {
          value: () => nodeInterface("Value", interfaceType),
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
          value: () => nodeInterface("Value", interfaceType),
        },
        outputs: Object.fromEntries(
          unsafeEntries(type.properties).flatMap(([key, value]) =>
            value === false
              ? []
              : [
                  [
                    key,
                    () =>
                      nodeInterface(
                        camelCaseToTitleCase(key),
                        value === true ? unknownType : upsertBaklavaType(value),
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
