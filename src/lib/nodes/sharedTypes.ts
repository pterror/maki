import { z } from "zod/v4";

export const zodShape = (schema: z.ZodType): Record<string, z.ZodType> =>
  schema instanceof z.ZodObject ? schema.shape : {};

export const zFunction = <
  T extends (...args: never) => unknown = (...args: never) => unknown
>() => z.custom<T>((x) => typeof x === "function");

export const Schema = z.custom<z.ZodType>().meta({
  title: "Schema",
  description:
    "A schema that can be used to define the input and output schemas of tools.",
});
export type Schema = z.infer<typeof Schema>;
