import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { reactive } from "vue";
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
} from "./interfaceTypes.ts";
import { registerDerivedNodes } from "./derived.ts";
import { registerAllToolsInBaklava } from "../mcpClient.ts";
import {
  MemoryClientTransport,
  MemoryServerTransport,
} from "../memoryTransport.ts";
import { mcpServer } from "../mcpServer.ts";
import { MCP_HTTP_PORT } from "../ports.ts";

// All modules containing nodes.
import "./coreNodes.ts";
import "./jsonSchemaNodes.ts";
import "./databaseNodes.ts";
import "./proceduralAudioNodes.ts";

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
  // @ts-expect-error We are making changes to a protected member here.
  baklava.editor.graph._nodes = reactive(baklava.editor.graph._nodes);
  baklava.editor.graph.interfaceTypes = interfaceTypes;
  registerDerivedNodes(baklava.editor);
  registerDerivedInterfaceTypes(interfaceTypes);
  const serverTransport = new MemoryServerTransport();
  const serverPromise = mcpServer.connect(serverTransport);
  const mcpLocalClient = new Client({ name: "maki-client", version: "0.1.0" });
  const localClientPromise = mcpLocalClient.connect(
    new MemoryClientTransport(serverTransport),
  );
  const mcpRemoteClient = new Client({ name: "maki-client", version: "0.1.0" });
  const remoteClientPromise = mcpRemoteClient.connect(
    new StreamableHTTPClientTransport(
      new URL(`http://localhost:${MCP_HTTP_PORT}`),
    ),
  );
  const promise = Promise.allSettled([
    serverPromise,
    localClientPromise.then(() => {
      registerAllToolsInBaklava(mcpLocalClient);
    }),
    remoteClientPromise.then(() => {
      registerAllToolsInBaklava(mcpRemoteClient);
    }),
  ]).then((results) => {
    for (const result of results) {
      if (result.status === "rejected") {
        // TODO: Show logs in tray.
        console.error("Error setting up MCP connection:", result.reason);
      }
    }
  });
  return { interfaceTypes, mcpClient: mcpLocalClient, promise };
}
