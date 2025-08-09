import { z } from "zod/v4";
import { createNodeDefinition } from "./node";
import { zFunction } from "./sharedTypes";

export const DatabaseQueryConditionComparison = z
  .object({
    type: z.literal("comparison").describe("Type of condition"),
    column: z.string().describe("Column to filter on"),
    operator: z
      .literal(["=", "!=", ">", "<", ">=", "<=", "LIKE"])
      .describe("Comparison operator"),
    value: z
      .union([z.string(), z.number(), z.boolean()])
      .describe("Value to compare against"),
  })
  .meta({
    title: "DatabaseQueryConditionComparison",
    description: "A comparison condition for filtering database query results",
    id: "DatabaseQueryConditionComparison",
  });
export type DatabaseQueryConditionComparison = z.infer<
  typeof DatabaseQueryConditionComparison
>;

export const DatabaseQueryConditionAnd = z
  .object({
    type: z.literal("and").describe("Logical AND condition"),
    get conditions() {
      return z
        .array(DatabaseQueryCondition)
        .describe("Conditions to combine with AND");
    },
  })
  .meta({
    title: "DatabaseQueryConditionAnd",
    description: "Combines multiple conditions with logical AND",
    id: "DatabaseQueryConditionAnd",
  });
export type DatabaseQueryConditionAnd = z.infer<
  typeof DatabaseQueryConditionAnd
>;

export const DatabaseQueryConditionOr = z
  .object({
    type: z.literal("or").describe("Logical OR condition"),
    get conditions() {
      return z
        .array(DatabaseQueryCondition)
        .describe("Conditions to combine with OR");
    },
  })
  .meta({
    title: "DatabaseQueryConditionOr",
    description: "Combines multiple conditions with logical OR",
    id: "DatabaseQueryConditionOr",
  });
export type DatabaseQueryConditionOr = z.infer<typeof DatabaseQueryConditionOr>;

export const DatabaseQueryConditionNot = z
  .object({
    type: z.literal("not").describe("Logical NOT condition"),
    get condition() {
      return DatabaseQueryCondition.describe("Condition to negate");
    },
  })
  .meta({
    title: "DatabaseQueryConditionNot",
    description: "Negates a single condition",
    id: "DatabaseQueryConditionNot",
  });
export type DatabaseQueryConditionNot = z.infer<
  typeof DatabaseQueryConditionNot
>;

export const DatabaseQueryCondition = z
  .union([
    DatabaseQueryConditionComparison,
    DatabaseQueryConditionAnd,
    DatabaseQueryConditionOr,
    DatabaseQueryConditionNot,
  ])
  .meta({
    title: "DatabaseQueryCondition",
    description: "Condition for filtering database query results",
    id: "DatabaseQueryCondition",
  });
export type DatabaseQueryCondition = z.infer<typeof DatabaseQueryCondition>;

export const DatabaseSelectCommand = z
  .object({
    table: z.string().describe("Name of the table to query"),
    columns: z.array(z.string()).describe("Columns to select from the table"),
    where: DatabaseQueryCondition.optional().describe(
      "Conditions to filter the results"
    ),
    orderBy: z.string().optional().describe("Column to order the results by"),
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Maximum number of results to return"),
    offset: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe("Number of results to skip before starting to return results"),
    join: z
      .array(
        z.object({
          table: z.string().describe("Table to join"),
          on: z.string().describe("Condition for the join"),
          type: z
            .enum(["INNER", "LEFT", "RIGHT", "FULL"])
            .optional()
            .describe("Type of join"),
        })
      )
      .optional()
      .describe("Join conditions for the query"),
  })
  .meta({
    title: "DatabaseQuery",
    description: "A SQL query to be executed against a database",
    id: "DatabaseQuery",
  });
export type DatabaseSelectCommand = z.infer<typeof DatabaseSelectCommand>;

export const DatabaseInsertCommand = z
  .object({
    table: z.string().describe("Name of the table to insert into"),
    columns: z.array(z.string()).describe("Columns of the objects to insert"),
    values: z
      .array(z.looseObject({}))
      .describe("Values to insert into the table"),
  })
  .meta({
    title: "DatabaseInsertCommand",
    description: "Command to insert data into a database table",
    id: "DatabaseInsertCommand",
  });
export type DatabaseInsertCommand = z.infer<typeof DatabaseInsertCommand>;

export const DatabaseUpdateCommand = z
  .object({
    table: z.string().describe("Name of the table to update"),
    columns: z.array(z.string()).describe("Columns to update"),
    set: z.looseObject({}).describe("Values to update"),
    where: DatabaseQueryCondition.optional().describe(
      "Conditions to filter which rows to update"
    ),
  })
  .meta({
    title: "DatabaseUpdateCommand",
    description: "Command to update data in a database table",
    id: "DatabaseUpdateCommand",
  });
export type DatabaseUpdateCommand = z.infer<typeof DatabaseUpdateCommand>;

export const DatabaseDeleteCommand = z
  .object({
    table: z.string().describe("Name of the table to delete from"),
    where: DatabaseQueryCondition.optional().describe(
      "Conditions to filter which rows to delete"
    ),
  })
  .meta({
    title: "DatabaseDeleteCommand",
    description: "Command to delete data from a database table",
    id: "DatabaseDeleteCommand",
  });
export type DatabaseDeleteCommand = z.infer<typeof DatabaseDeleteCommand>;

export const Database = z
  .object({
    type: z.string().describe("Type of the database"),
    select: zFunction<
      (query: DatabaseSelectCommand) => Promise<AsyncIterable<unknown>>
    >().describe("Function to execute a SELECT query against the database"),
    insert: zFunction<
      (query: DatabaseInsertCommand) => Promise<void>
    >().describe("Function to insert data into a table"),
    update: zFunction<
      (query: DatabaseUpdateCommand) => Promise<void>
    >().describe("Function to update data in a table"),
    delete: zFunction<
      (query: DatabaseDeleteCommand) => Promise<void>
    >().describe("Function to delete data from a table"),
  })
  .meta({
    title: "Database",
    description: "A generic database instance",
    id: "Database",
  });
export type Database = z.infer<typeof Database>;

export const databaseQueryConditionComparisonNode = createNodeDefinition({
  id: "database-condition-comparison",
  tags: ["database.condition.comparison"],
  input: z.object({
    column: z.string().describe("Column to filter on"),
    operator: z
      .literal(["=", "!=", ">", "<", ">=", "<=", "LIKE"])
      .describe("Comparison operator"),
    value: z
      .union([z.string(), z.number(), z.boolean()])
      .describe("Value to compare against"),
  }),
  output: z.object({
    condition: DatabaseQueryConditionComparison,
  }),
  function: async (input) => {
    return {
      condition: {
        type: "comparison" as const,
        column: input.column,
        operator: input.operator,
        value: input.value,
      },
    };
  },
});

export const databaseConditionAndNode = createNodeDefinition({
  id: "database-condition-and",
  tags: ["database.condition.and"],
  input: z.object({
    conditions: z
      .array(DatabaseQueryCondition)
      .describe("Conditions to combine with AND"),
  }),
  output: z.object({
    condition: DatabaseQueryConditionAnd,
  }),
  function: async (input) => {
    return {
      condition: { type: "and" as const, conditions: input.conditions },
    };
  },
});

export const databaseConditionOrNode = createNodeDefinition({
  id: "database-condition-or",
  tags: ["database.condition.or"],
  input: z.object({
    conditions: z
      .array(DatabaseQueryCondition)
      .describe("Conditions to combine with OR"),
  }),
  output: z.object({
    condition: DatabaseQueryConditionOr,
  }),
  function: async (input) => {
    return { condition: { type: "or" as const, conditions: input.conditions } };
  },
});

export const databaseConditionNotNode = createNodeDefinition({
  id: "database-condition-not",
  tags: ["database.condition.not"],
  input: z.object({
    condition: DatabaseQueryCondition.describe("Condition to negate"),
  }),
  output: z.object({
    condition: DatabaseQueryConditionNot,
  }),
  function: async (input) => {
    return { condition: { type: "not" as const, condition: input.condition } };
  },
});

export const databaseSelectNode = createNodeDefinition({
  id: "database-select",
  tags: ["database.select"],
  input: z.object({
    database: Database,
    command: DatabaseSelectCommand,
  }),
  output: z.object({
    rows: z
      .custom<AsyncIterable<unknown>>()
      .describe("An iterable of rows returned by the query"),
  }),
  function: async (input) => {
    return {
      rows: await input.database.select(input.command),
    };
  },
});

export const databaseInsertNode = createNodeDefinition({
  id: "database-insert",
  tags: ["database.insert"],
  input: z.object({
    database: Database,
    command: DatabaseInsertCommand,
  }),
  output: z.object({}),
  function: async (input) => {
    await input.database.insert(input.command);
    return {};
  },
});

export const databaseUpdateNode = createNodeDefinition({
  id: "database-update",
  tags: ["database.update"],
  input: z.object({
    database: Database,
    command: DatabaseUpdateCommand,
  }),
  output: z.object({}),
  function: async (input) => {
    await input.database.update(input.command);
    return {};
  },
});

export const databaseDeleteNode = createNodeDefinition({
  id: "database-delete",
  tags: ["database.delete"],
  input: z.object({
    database: Database,
    command: DatabaseDeleteCommand,
  }),
  output: z.object({}),
  function: async (input) => {
    await input.database.delete(input.command);
    return {};
  },
});
