import type { IBaklavaViewModel } from "baklavajs";
import { registerCoreInterfaceTypes } from "./interfaceTypes";
import {
  registerDatabaseInterfaceTypes,
  registerDatabaseNodes,
} from "./database";
import { registerCoreNodes } from "./core";
import { registerAiGenerationNodes } from "./aiGeneration";
import { registerAiGenerationInterfaceTypes } from "./aiGenerationTypes";

export function setupBaklava(baklava: IBaklavaViewModel) {
  const interfaceTypes = registerCoreInterfaceTypes(baklava.editor);
  registerCoreNodes(baklava.editor);

  registerDatabaseInterfaceTypes(interfaceTypes);
  registerDatabaseNodes(baklava.editor);

  registerAiGenerationNodes(baklava.editor);
  registerAiGenerationInterfaceTypes(interfaceTypes);

  return { interfaceTypes };
}
