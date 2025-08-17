import { Database as Sqlite3Database } from "sqlite3";
import {
  Database,
  databaseInterfaceType,
  type DatabaseQueryCondition,
  type DatabaseQueryConditionAnd,
  type DatabaseQueryConditionComparison,
  type DatabaseQueryConditionNot,
  type DatabaseQueryConditionOr,
} from "./database";
import { defineNode, Editor } from "baklavajs";
import { nodeInterface, textInterface } from "./interfaceTypes";

function sqlite3StringifyDatabaseQueryConditionComparison(
  condition: DatabaseQueryConditionComparison,
  parameters: unknown[],
): string {
  parameters.push(condition.value);
  return `${condition.column} ${condition.operator} ?`;
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

export const Sqlite3DatabaseNode = defineNode({
  type: "Sqlite3DatabaseNope",
  inputs: {
    path: () => textInterface("Path"),
  },
  outputs: {
    database: () =>
      nodeInterface("Database", undefined!, databaseInterfaceType),
  },
  async calculate(input) {
    const sqlite3Database = new Sqlite3Database(input.path, (error) => {
      if (error) {
        throw new Error(
          `Failed to open SQLite3 database at ${input.path}: ${error.message}`,
        );
      }
    });
    const database: Database = {
      type: "sqlite3",
      select: async (command) => {
        const parameters: unknown[] = [];
        const query = `SELECT ${command.columns.join(", ")} FROM ${command.table}${
          command.where
            ? ` WHERE ${sqlite3StringifyDatabaseQueryCondition(command.where, parameters)}`
            : ""
        }${command.orderBy ? ` ORDER BY ${command.orderBy}` : ""}${
          command.limit ? ` LIMIT ${command.limit}` : ""
        }`;

        return new Promise((resolve, reject) => {
          sqlite3Database.all(query, parameters, (error, rows) => {
            if (error) {
              reject(new Error(`Failed to execute query: ${error.message}`));
            } else {
              resolve(rows);
            }
          });
        });
      },
      insert: async (command) => {
        const placeholders = command.values.map(() => "?").join(", ");
        const query = `INSERT INTO ${command.table} (${command.columns.join(
          ", ",
        )}) VALUES (${placeholders})`;

        return new Promise((resolve, reject) => {
          sqlite3Database.run(query, command.values, function (error) {
            if (error) {
              reject(new Error(`Failed to execute insert: ${error.message}`));
            } else {
              resolve();
            }
          });
        });
      },
      update: async (command) => {
        const setClause = command.columns
          .map((column) => `${column} = ?`)
          .join(", ");
        const parameters: unknown[] = command.columns.map(
          (column) => command.set[column],
        );
        const query = `UPDATE ${command.table} SET ${setClause}${
          command.where
            ? ` WHERE ${sqlite3StringifyDatabaseQueryCondition(command.where, parameters)}`
            : ""
        }`;

        return new Promise((resolve, reject) => {
          sqlite3Database.run(query, parameters, function (error) {
            if (error) {
              reject(new Error(`Failed to execute update: ${error.message}`));
            } else {
              resolve();
            }
          });
        });
      },
      delete: async (command) => {
        const parameters: unknown[] = [];
        const query = `DELETE FROM ${command.table}${
          command.where
            ? ` WHERE ${sqlite3StringifyDatabaseQueryCondition(command.where, parameters)}`
            : ""
        }`;

        return new Promise((resolve, reject) => {
          sqlite3Database.run(query, parameters, function (error) {
            if (error) {
              reject(new Error(`Failed to execute delete: ${error.message}`));
            } else {
              resolve();
            }
          });
        });
      },
    };
    return { database };
  },
});
export function registerDatabaseSqliteNode(editor: Editor) {
  editor.registerNodeType(Sqlite3DatabaseNode, { category: "Database" });
}
