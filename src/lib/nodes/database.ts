import { z } from "zod/v4";
import { zFunction } from "./sharedTypes";
import { BaklavaInterfaceTypes, defineNode, Editor } from "baklavajs";
import {
  anyType,
  listNodeInterfaceType,
  nodeInterface,
  nodeInterfaceType,
  selectInterface,
  stringType,
  textInterface,
} from "./interfaceTypes";
import { defineListNode } from "./core";

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
        .readonly()
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
        .readonly()
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
    id: "Database",
  });
export type Database = z.infer<typeof Database>;

const DatabaseComparisonOperator = z
  .literal(["=", "!=", ">", "<", ">=", "<=", "LIKE"])
  .describe("Comparison operator");
type DatabaseComparisonOperator = z.infer<typeof DatabaseComparisonOperator>;

const databaseComparisonOperatorType =
  nodeInterfaceType<DatabaseComparisonOperator>("DatabaseComparisonOperator");
databaseComparisonOperatorType.addConversion(stringType, (v) => v);
const databaseQueryConditionComparisonType =
  nodeInterfaceType<DatabaseQueryConditionComparison>(
    "DatabaseQueryConditionComparison"
  );

const databaseQueryConditionAndType =
  nodeInterfaceType<DatabaseQueryConditionAnd>("DatabaseQueryConditionAnd");
const databaseQueryConditionOrType =
  nodeInterfaceType<DatabaseQueryConditionOr>("DatabaseQueryConditionOr");
const databaseQueryConditionNotType =
  nodeInterfaceType<DatabaseQueryConditionNot>("DatabaseQueryConditionNot");
const databaseQueryConditionType = nodeInterfaceType<DatabaseQueryCondition>(
  "DatabaseQueryCondition"
);
const databaseQueryConditionListType =
  listNodeInterfaceType<DatabaseQueryCondition>(databaseQueryConditionType);

databaseQueryConditionComparisonType.addConversion(
  databaseQueryConditionType,
  (v) => v
);
databaseQueryConditionAndType.addConversion(
  databaseQueryConditionType,
  (v) => v
);
databaseQueryConditionOrType.addConversion(
  databaseQueryConditionType,
  (v) => v
);
databaseQueryConditionNotType.addConversion(
  databaseQueryConditionType,
  (v) => v
);

export function registerDatabaseInterfaceTypes(types: BaklavaInterfaceTypes) {
  types.addTypes(
    databaseComparisonOperatorType,
    databaseQueryConditionComparisonType,
    databaseQueryConditionAndType,
    databaseQueryConditionOrType,
    databaseQueryConditionNotType
  );
}

export const DatabaseQueryConditionComparisonNode = defineNode({
  type: "DatabaseQueryConditionComparisonNode",
  inputs: {
    column: () => textInterface("Column"),
    operator: () =>
      selectInterface<DatabaseComparisonOperator>(
        "Operator",
        "=",
        databaseComparisonOperatorType,
        ["=", "!=", ">", "<", ">=", "<=", "LIKE"]
      ),
    value: () => nodeInterface("Value", "", anyType),
  },
  outputs: {
    condition: () =>
      nodeInterface(
        "Condition",
        {
          type: "comparison",
          column: "",
          operator: "=",
          value: "",
        },
        databaseQueryConditionComparisonType
      ),
  },
  calculate({ column, operator, value }) {
    return {
      condition: {
        type: "comparison" as const,
        column,
        operator,
        // TODO: Ensure value is of the correct type
        value: value as string | number | boolean,
      },
    };
  },
});
export function registerDatabaseQueryConditionComparisonNode(editor: Editor) {
  editor.registerNodeType(DatabaseQueryConditionComparisonNode, {
    category: "Database Condition",
  });
}

export const DatabaseQueryConditionAndNode = defineNode({
  type: "DatabaseQueryConditionAndNode",
  inputs: {
    conditions: () =>
      nodeInterface("Conditions", [], databaseQueryConditionListType),
  },
  outputs: {
    condition: () =>
      nodeInterface(
        "Condition",
        { type: "and", conditions: [] },
        databaseQueryConditionAndType
      ),
  },
  calculate({ conditions }) {
    return { condition: { type: "and" as const, conditions } };
  },
});
export function registerDatabaseQueryConditionAndNode(editor: Editor) {
  editor.registerNodeType(DatabaseQueryConditionAndNode, {
    category: "Database Condition",
  });
}

export const DatabaseQueryConditionOrNode = defineNode({
  type: "DatabaseQueryConditionOrNode",
  inputs: {
    conditions: () =>
      nodeInterface("Conditions", [], databaseQueryConditionListType),
  },
  outputs: {
    condition: () =>
      nodeInterface(
        "Condition",
        { type: "or", conditions: [] },
        databaseQueryConditionOrType
      ),
  },
  calculate({ conditions }) {
    return { condition: { type: "or" as const, conditions } };
  },
});
export function registerDatabaseQueryConditionOrNode(editor: Editor) {
  editor.registerNodeType(DatabaseQueryConditionOrNode, {
    category: "Database Condition",
  });
}

export const DatabaseQueryConditionNotNode = defineNode({
  type: "DatabaseQueryConditionNotNode",
  inputs: {
    condition: () =>
      nodeInterface(
        "Condition",
        { type: "comparison", column: "", operator: "=", value: "" },
        databaseQueryConditionType
      ),
  },
  outputs: {
    condition: () =>
      nodeInterface(
        "Condition",
        {
          type: "not",
          condition: {
            type: "comparison",
            column: "",
            operator: "=",
            value: "",
          },
        },
        databaseQueryConditionNotType
      ),
  },
  calculate({ condition }) {
    return { condition: { type: "not" as const, condition } };
  },
});
export function registerDatabaseQueryConditionNotNode(editor: Editor) {
  editor.registerNodeType(DatabaseQueryConditionNotNode, {
    category: "Database Condition",
  });
}

export const {
  node: DatabaseQueryConditionListNode,
  register: registerDatabaseQueryConditionListNode,
} = defineListNode(
  databaseQueryConditionType,
  databaseQueryConditionListType,
  () => ({
    type: "comparison" as const,
    column: "",
    operator: "=" as const,
    value: "",
  }),
  { category: "Database Condition" }
);

export function registerDatabaseNodes(editor: Editor) {
  registerDatabaseQueryConditionComparisonNode(editor);
  registerDatabaseQueryConditionAndNode(editor);
  registerDatabaseQueryConditionOrNode(editor);
  registerDatabaseQueryConditionNotNode(editor);
  registerDatabaseQueryConditionListNode(editor);
  registerDatabaseSelectNode(editor);
}

export const databaseInterfaceType = nodeInterfaceType<Database>("Database");
export const databaseSelectCommandInterfaceType =
  nodeInterfaceType<DatabaseSelectCommand>("DatabaseSelectCommand");
export const databaseInsertCommandInterfaceType =
  nodeInterfaceType<DatabaseInsertCommand>("DatabaseInsertCommand");
export const databaseUpdateCommandInterfaceType =
  nodeInterfaceType<DatabaseUpdateCommand>("DatabaseUpdateCommand");
export const databaseDeleteCommandInterfaceType =
  nodeInterfaceType<DatabaseDeleteCommand>("DatabaseDeleteCommand");

export const DatabaseSelectNode = defineNode({
  type: "DatabaseSelectNode",
  inputs: {
    database: () =>
      nodeInterface("Database", undefined!, databaseInterfaceType),
    command: () =>
      nodeInterface(
        "Command",
        {
          table: "",
          columns: [],
        },
        databaseSelectCommandInterfaceType
      ),
  },
  outputs: {
    rows: () =>
      nodeInterface("Rows", [], listNodeInterfaceType<unknown>(anyType)),
  },
  async calculate({ database, command }) {
    return { rows: await database.select(command) };
  },
});
export function registerDatabaseSelectNode(editor: Editor) {
  editor.registerNodeType(DatabaseSelectNode, { category: "Database Query" });
}

export const DatabaseInsertNode = defineNode({
  type: "DatabaseInsertNode",
  inputs: {
    database: () =>
      nodeInterface("Database", undefined!, databaseInterfaceType),
    command: () =>
      nodeInterface(
        "Command",
        {
          table: "",
          columns: [],
          values: [],
        },
        databaseInsertCommandInterfaceType
      ),
  },
  outputs: {},
  async calculate({ database, command }) {
    await database.insert(command);
    return {};
  },
});
export function registerDatabaseInsertNode(editor: Editor) {
  editor.registerNodeType(DatabaseInsertNode, { category: "Database Command" });
}

export const DatabaseUpdateNode = defineNode({
  type: "DatabaseUpdateNode",
  inputs: {
    database: () =>
      nodeInterface("Database", undefined!, databaseInterfaceType),
    command: () =>
      nodeInterface(
        "Command",
        {
          table: "",
          columns: [],
          set: {},
        },
        databaseUpdateCommandInterfaceType
      ),
  },
  outputs: {},
  async calculate({ database, command }) {
    await database.update(command);
    return {};
  },
});
export function registerDatabaseUpdateNode(editor: Editor) {
  editor.registerNodeType(DatabaseUpdateNode, { category: "Database Command" });
}

export const DatabaseDeleteNode = defineNode({
  type: "DatabaseDeleteNode",
  inputs: {
    database: () =>
      nodeInterface("Database", undefined!, databaseInterfaceType),
    command: () =>
      nodeInterface(
        "Command",
        {
          table: "",
        },
        databaseDeleteCommandInterfaceType
      ),
  },
  outputs: {},
  async calculate({ database, command }) {
    await database.delete(command);
    return {};
  },
});
export function registerDatabaseDeleteNode(editor: Editor) {
  editor.registerNodeType(DatabaseDeleteNode, { category: "Database Command" });
}
