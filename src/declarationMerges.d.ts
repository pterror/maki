declare module "baklavajs" {
  const TYPE_MARKER: unique symbol;

  export declare class NodeInterfaceType<T> {
    // Hack to ensure `T` cannot be accidentally widened.
    [TYPE_MARKER]: [covariant: T, contravariant: (value: T) => void];
    name: string;
    conversions: Array<IConversion<T, any>>;
    constructor(name: string);
    /**
     * A conversion makes it possible to connect two node interfaces although they have different types.
     * @param to Type to convert to
     * @param transformationFunction
     * Will be called to transform the value from one type to another.
     * A transformation to convert the type `string` to `number` could be `parseInt`.
     *
     * @returns the instance the method was called on for chaining
     */
    addConversion<O>(
      to: NodeInterfaceType<O>,
      transformationFunction?: (value: T) => O,
    ): this;
  }
}

export {};
