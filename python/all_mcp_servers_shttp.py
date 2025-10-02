from .all_mcp_servers import all_mcp

import uvicorn
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

if __name__ == "__main__":
    http_app = all_mcp.http_app(
        middleware=[
            Middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_methods=["*"],
                allow_headers=["*"],
                expose_headers=["mcp-session-id"],
            )
        ]
    )
    uvicorn.run(http_app, host="0.0.0.0", port=34122)
