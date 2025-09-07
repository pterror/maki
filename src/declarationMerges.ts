import type { DynamicNodeDefinition } from "baklavajs";
import type { JSONSchema } from "zod/v4/core";

declare module "baklavajs" {
  const TYPE_MARKER: unique symbol;

  interface NodeInterface {
    type?: string;
  }

  interface NodeInterfaceType<T> {
    // Hack to ensure `T` cannot be accidentally widened.
    [TYPE_MARKER]: [covariant: T, contravariant: (value: T) => void];
    schema: JSONSchema.JSONSchema;
  }

  interface DynamicNode<I, O> {
    /** @deprecated This is an internal private method that should not be used. */
    updateInterfaces(
      type: "input" | "output",
      newInterfaces: DynamicNodeDefinition,
      forceUpdates: string[],
    ): void;
  }

  interface BaklavaInterfaceTypes {
    addTypes(...types: Array<NodeInterfaceType<any>>): this;
  }

  interface Graph {
    interfaceTypes: BaklavaInterfaceTypes;
  }
}

export {};
