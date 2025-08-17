import type { IBaklavaViewModel } from "baklavajs";
import { registerCoreInterfaceTypes } from "./interfaceTypes";
import {
  registerDatabaseInterfaceTypes,
  registerDatabaseNodes,
} from "./database";
import { registerCoreNodes } from "./core";
import { registerAiGenerationNodes } from "./aiGeneration";
import { registerAiGenerationInterfaceTypes } from "./aiGenerationTypes";
import {
  registerSharedTypesInterfaceTypes,
  registerSharedTypesNodes,
} from "./sharedTypes";

export function setupBaklava(baklava: IBaklavaViewModel) {
  registerCoreNodes(baklava.editor);
  const interfaceTypes = registerCoreInterfaceTypes(baklava.editor);

  registerSharedTypesNodes(baklava.editor);
  registerSharedTypesInterfaceTypes(interfaceTypes);

  registerDatabaseNodes(baklava.editor);
  registerDatabaseInterfaceTypes(interfaceTypes);

  registerAiGenerationNodes(baklava.editor);
  registerAiGenerationInterfaceTypes(interfaceTypes);

  return { interfaceTypes };
}
