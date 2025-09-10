import Sqlite3Database from "better-sqlite3";
import { z } from "zod/v4";
import {
  Database,
  type DatabaseQueryCondition,
  type DatabaseQueryConditionAnd,
  type DatabaseQueryConditionComparison,
  type DatabaseQueryConditionNot,
  type DatabaseQueryConditionOr,
} from "./databaseNodes.ts";
import { registerMcpServerTool } from "../mcpServer.ts";
import { escapeSqlIdentifier } from "../sql.ts";

function sqlite3StringifyDatabaseQueryConditionComparison(
  condition: DatabaseQueryConditionComparison,
  parameters: unknown[],
): string {
  parameters.push(condition.value);
  return `${escapeSqlIdentifier(condition.column)} ${condition.operator} ?`;
}

function sqlite3StringifyDatabaseQueryConditionAnd(
  condition: DatabaseQueryConditionAnd,
  parameters: unknown[],
): string {
  return condition.conditions
    .map(
      (condition) =>
        `(${sqlite3StringifyDatabaseQueryCondition(condition, parameters)})`,
    )
    .join(" AND ");
}

function sqlite3StringifyDatabaseQueryConditionOr(
  condition: DatabaseQueryConditionOr,
  parameters: unknown[],
): string {
  return condition.conditions
    .map(
      (condition) =>
        `(${sqlite3StringifyDatabaseQueryCondition(condition, parameters)})`,
    )
    .join(" OR ");
}

function sqlite3StringifyDatabaseQueryConditionNot(
  condition: DatabaseQueryConditionNot,
  parameters: unknown[],
): string {
  return `NOT (${sqlite3StringifyDatabaseQueryCondition(condition.condition, parameters)})`;
}

function sqlite3StringifyDatabaseQueryCondition(
  condition: DatabaseQueryCondition,
  parameters: unknown[],
): string {
  switch (condition.type) {
    case "comparison":
      return sqlite3StringifyDatabaseQueryConditionComparison(
        condition,
        parameters,
      );
    case "and":
      return sqlite3StringifyDatabaseQueryConditionAnd(condition, parameters);
    case "or":
      return sqlite3StringifyDatabaseQueryConditionOr(condition, parameters);
    case "not":
      return sqlite3StringifyDatabaseQueryConditionNot(condition, parameters);
    default:
      condition satisfies never; // Ensure all cases are handled
      throw new Error("Unknown condition type: ", condition);
  }
}

registerMcpServerTool(
  "sqlite3-database",
  {
    title: "SQLite3 Database",
    description: "Creates a SQLite3 database instance.",
    inputSchema: z.object({
      path: z.string().describe("Path to the SQLite3 database file"),
    }),
    outputSchema: z.object({ database: Database }),
    annotations: { baklavaCategory: "Database" },
  },
  async ({ path }: { path: string }) => {
    const db = Sqlite3Database(path);
    db.pragma("journal_mode = WAL");
    const database: Database = {
      type: "sqlite3",
      select: async (command) => {
        const parameters: unknown[] = [];
        const query = `SELECT ${command.columns.map(escapeSqlIdentifier).join(", ")} FROM ${command.table}${
          command.where
            ? ` WHERE ${sqlite3StringifyDatabaseQueryCondition(command.where, parameters)}`
            : ""
        }${command.orderBy ? ` ORDER BY ${command.orderBy}` : ""}${
          command.limit ? ` LIMIT ${command.limit}` : ""
        }`;
        const preparedStatement = db.prepare(query);
        return preparedStatement.all();
      },
      insert: async (command) => {
        const placeholders = command.values.map(() => "?").join(", ");
        const query = `INSERT INTO ${command.table} (${command.columns.map(escapeSqlIdentifier).join(", ")}) VALUES (${placeholders})`;
        const preparedStatement = db.prepare(query);
        preparedStatement.run(...command.values);
      },
      update: async (command) => {
        const setClause = command.columns
          .map((column) => `${escapeSqlIdentifier(column)} = ?`)
          .join(", ");
        const parameters: unknown[] = command.columns.map(
          (column) => command.set[column],
        );
        const query = `UPDATE ${command.table} SET ${setClause}${
          command.where
            ? ` WHERE ${sqlite3StringifyDatabaseQueryCondition(command.where, parameters)}`
            : ""
        }`;
        const preparedStatement = db.prepare(query);
        preparedStatement.run(...parameters);
      },
      delete: async (command) => {
        const parameters: unknown[] = [];
        const query = `DELETE FROM ${command.table}${
          command.where
            ? ` WHERE ${sqlite3StringifyDatabaseQueryCondition(command.where, parameters)}`
            : ""
        }`;
        const preparedStatement = db.prepare(query);
        preparedStatement.run(...parameters);
      },
    };
    return { database };
  },
);
