import {
  applyResult,
  DependencyEngine,
  useBaklava,
  type BaklavaInterfaceTypesOptions,
  type IBaklavaViewModel,
} from "baklavajs";
import {
  registerCoreInterfaceTypes,
  registerDerivedInterfaceTypes,
} from "./interfaceTypes";
import { registerDerivedNodes } from "./derivedNodes";
import {
  initializeMcpClient,
  initializeMcpServer,
  registerAllToolsInBaklava,
} from "./mcp";

// All modules containing nodes.
import "./core";
import "./database";
// FIXME: MCP supports client-server communication!
// import "./databaseSqlite";
// import "./aiGeneration";
import "./proceduralAudio";

export function useFullBaklava() {
  const baklava = useBaklava();
  const engine = new DependencyEngine(baklava.editor);

  const { interfaceTypes, promise } = setupBaklava(baklava, {
    engine,
    viewPlugin: baklava,
  });

  const token = Symbol();
  engine.events.afterRun.subscribe(token, (result) => {
    engine.pause();
    applyResult(result, baklava.editor);
    engine.resume();
  });
  engine.start();

  return { baklava, engine, interfaceTypes, promise };
}

export function setupBaklava(
  baklava: IBaklavaViewModel,
  options: Required<BaklavaInterfaceTypesOptions>,
) {
  const interfaceTypes = registerCoreInterfaceTypes(baklava.editor, options);
  registerDerivedNodes(baklava.editor);
  registerDerivedInterfaceTypes(interfaceTypes);
  initializeMcpServer();
  initializeMcpClient();
  const promise = registerAllToolsInBaklava();
  return { interfaceTypes, promise };
}
