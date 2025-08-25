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
// TODO: Move core nodes to MCP as well.
import { registerCoreNodes, registerDerivedNodes } from "./core";
import {
  initializeMcpClient,
  initializeMcpServer,
  registerAllToolsInBaklava,
} from "./mcp";

// All modules containing nodes.
import "./core";
import "./database";
// FIXME: Implement client-server communication?
// Some stuff (e.g. FS access) require a server anyway
// import "./databaseSqlite";
// import "./aiGeneration";
import "./proceduralAudio";

export function useFullBaklava() {
  const baklava = useBaklava();
  const engine = new DependencyEngine(baklava.editor);

  const { interfaceTypes } = setupBaklava(baklava, {
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

  return { baklava, engine, interfaceTypes };
}

export function setupBaklava(
  baklava: IBaklavaViewModel,
  options: Required<BaklavaInterfaceTypesOptions>,
) {
  registerCoreNodes(baklava.editor);
  const interfaceTypes = registerCoreInterfaceTypes(baklava.editor, options);
  registerDerivedNodes(baklava.editor);
  registerDerivedInterfaceTypes(interfaceTypes);
  initializeMcpServer();
  initializeMcpClient();
  registerAllToolsInBaklava();
  return { interfaceTypes };
}
