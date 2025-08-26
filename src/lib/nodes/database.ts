import { z } from "zod/v4";
import { zFunction } from "./zodHelpers";
import { registerMcpServerTool } from "./mcp";

export const DatabaseQueryConditionComparisonOperator = z
  .literal(["=", "!=", ">", "<", ">=", "<=", "LIKE"])
  .meta({
    title: "DatabaseQueryConditionComparisonOperator",
    description: "Comparison operators for database query conditions",
  });
export type DatabaseQueryConditionComparisonOperator = z.infer<
  typeof DatabaseQueryConditionComparisonOperator
>;

export const DatabaseQueryConditionComparison = z
  .object({
    type: z.literal("comparison").describe("Type of condition"),
    column: z.string().describe("Column to filter on"),
    operator: DatabaseQueryConditionComparisonOperator,
    value: z
      .union([z.string(), z.number(), z.boolean()])
      .describe("Value to compare against"),
  })
  .meta({
    title: "DatabaseQueryConditionComparison",
    description: "A comparison condition for filtering database query results",
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
        .readonly()
        .describe("Conditions to combine with AND");
    },
  })
  .meta({
    title: "DatabaseQueryConditionAnd",
    description: "Combines multiple conditions with logical AND",
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
        .readonly()
        .describe("Conditions to combine with OR");
    },
  })
  .meta({
    title: "DatabaseQueryConditionOr",
    description: "Combines multiple conditions with logical OR",
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
  });
export type DatabaseQueryCondition = z.infer<typeof DatabaseQueryCondition>;

export const DatabaseJoinType = z
  .literal(["INNER", "LEFT", "RIGHT", "FULL"])
  .meta({
    title: "DatabaseJoinType",
    description: "Type of join to use in database queries",
  });
export type DatabaseJoinType = z.infer<typeof DatabaseJoinType>;

export const DatabaseJoinClause = z
  .object({
    table: z.string().describe("Table to join with"),
    on: z.string().describe("Condition for the join"),
    type: DatabaseJoinType.optional(),
  })
  .meta({
    title: "DatabaseSelectCommandJoinClause",
    description: "Join clause for database select command",
  });
export type DatabaseJoinClause = z.infer<typeof DatabaseJoinClause>;

export const DatabaseSelectCommand = z
  .object({
    table: z.string().describe("Name of the table to query"),
    columns: z.array(z.string()).describe("Columns to select from the table"),
    where: DatabaseQueryCondition.optional().describe(
      "Conditions to filter the results",
    ),
    orderBy: z.string().optional().describe("Column to order the results by"),
    limit: z.int().optional().describe("Maximum number of results to return"),
    offset: z
      .int()
      .optional()
      .describe("Number of results to skip before starting to return results"),
    join: z
      .array(DatabaseJoinClause)
      .optional()
      .describe("Join conditions for the query"),
  })
  .meta({
    title: "DatabaseQuery",
    description: "A SQL query to be executed against a database",
  });
export type DatabaseSelectCommand = z.infer<typeof DatabaseSelectCommand>;

export const DatabaseInsertCommand = z
  .object({
    table: z.string().describe("Name of the table to insert into"),
    columns: z.array(z.string()).describe("Columns of the objects to insert"),
    // TODO: `z.looseObject({})`
    values: z.array(z.unknown()).describe("Values to insert into the table"),
  })
  .meta({
    title: "DatabaseInsertCommand",
    description: "Command to insert data into a database table",
  });
export type DatabaseInsertCommand = z.infer<typeof DatabaseInsertCommand>;

export const DatabaseUpdateCommand = z
  .object({
    table: z.string().describe("Name of the table to update"),
    columns: z.array(z.string()).describe("Columns to update"),
    // TODO: `z.looseObject({})`
    set: z.unknown().describe("Values to update"),
    where: DatabaseQueryCondition.optional().describe(
      "Conditions to filter which rows to update",
    ),
  })
  .meta({
    title: "DatabaseUpdateCommand",
    description: "Command to update data in a database table",
  });
export type DatabaseUpdateCommand = z.infer<typeof DatabaseUpdateCommand>;

export const DatabaseDeleteCommand = z
  .object({
    table: z.string().describe("Name of the table to delete from"),
    where: DatabaseQueryCondition.optional().describe(
      "Conditions to filter which rows to delete",
    ),
  })
  .meta({
    title: "DatabaseDeleteCommand",
    description: "Command to delete data from a database table",
  });
export type DatabaseDeleteCommand = z.infer<typeof DatabaseDeleteCommand>;

export const Database = z
  .object({
    type: z.string().describe("Type of the database"),
    select: zFunction<
      (query: DatabaseSelectCommand) => Promise<unknown[]>
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
  });
export type Database = z.infer<typeof Database>;

registerMcpServerTool(
  "database-select",
  {
    title: "Select (Database)",
    description: "Selects rows from a database table.",
    inputSchema: z.object({
      database: Database,
      command: DatabaseSelectCommand,
    }),
    outputSchema: z.object({ rows: z.array(z.unknown()) }),
    annotations: { baklavaCategory: "Database" },
  },
  async ({ database, command }) => ({
    rows: await database.select(command),
  }),
);

registerMcpServerTool(
  "database-insert",
  {
    title: "Insert (Database)",
    description: "Inserts rows into a database table.",
    inputSchema: z.object({
      database: Database,
      command: DatabaseInsertCommand,
    }),
    outputSchema: z.object({}),
    annotations: { baklavaCategory: "Database" },
  },
  async ({ database, command }) => {
    await database.insert(command);
    return {};
  },
);

registerMcpServerTool(
  "database-update",
  {
    title: "Update (Database)",
    description: "Updates rows in a database table.",
    inputSchema: z.object({
      database: Database,
      command: DatabaseUpdateCommand,
    }),
    outputSchema: z.object({}),
    annotations: { baklavaCategory: "Database" },
  },
  async ({ database, command }) => {
    await database.update(command);
    return {};
  },
);

registerMcpServerTool(
  "database-delete",
  {
    title: "Delete (Database)",
    description: "Deletes rows from a database table.",
    inputSchema: z.object({
      database: Database,
      command: DatabaseDeleteCommand,
    }),
    outputSchema: z.object({}),
    annotations: { baklavaCategory: "Database" },
  },
  async ({ database, command }) => {
    await database.delete(command);
    return {};
  },
);
