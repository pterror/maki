from pathlib import Path
from fastmcp import FastMCP
from fastmcp.client.transports import StdioTransport
from .diffusers import diffusers_mcp

mcp = FastMCP("maki composed server")
all_mcp = mcp

# Mount Stable Diffusion MCP
mcp.mount(diffusers_mcp)
# Mount Node.js MCP
# Assumes you have `node` installed with native TypeScript support (Node 20+).
mcp.mount(
    FastMCP.as_proxy(
        StdioTransport(
            command="node",
            args=[str(Path(__file__).parent.parent / "src" / "server.ts")],
        )
    )
)

if __name__ == "__main__":
    mcp.run()
