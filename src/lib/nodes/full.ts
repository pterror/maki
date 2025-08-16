import type { IBaklavaViewModel } from "baklavajs";
import { registerCoreInterfaceTypes } from "./interfaceTypes";
import {
  registerDatabaseInterfaceTypes,
  registerDatabaseNodes,
} from "./database";
import { registerCoreNodes } from "./core";

export function setupBaklava(baklava: IBaklavaViewModel) {
  const interfaceTypes = registerCoreInterfaceTypes(baklava.editor);
  registerDatabaseInterfaceTypes(interfaceTypes);
  registerCoreNodes(baklava.editor);
  registerDatabaseNodes(baklava.editor);
  return { interfaceTypes };
}
