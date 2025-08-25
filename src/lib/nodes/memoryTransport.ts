import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

/**
 * Server transport for memory: this communicates with a MCP client in the same process.
 */
export class MemoryServerTransport implements Transport {
  constructor() {}

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  clientCallback?: (message: JSONRPCMessage) => void;

  // Arrow functions to bind `this` properly, while maintaining function identity.
  _onerror = (error: Error) => {
    this.onerror?.(error);
  };

  async start(): Promise<void> {}

  async close(): Promise<void> {
    this.onclose?.();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.clientCallback?.(message);
  }
}

/**
 * Client transport for memory: this will connect to a server in the same process.
 */
export class MemoryClientTransport implements Transport {
  serverTransport: MemoryServerTransport;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(serverTransport: MemoryServerTransport) {
    this.serverTransport = serverTransport;
    this.serverTransport.clientCallback = (message) => {
      this.onmessage?.(message);
    };
  }

  async start(): Promise<void> {}

  async close(): Promise<void> {}

  async send(message: JSONRPCMessage): Promise<void> {
    this.serverTransport.onmessage?.(message);
  }
}
