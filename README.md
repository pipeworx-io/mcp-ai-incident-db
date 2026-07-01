# mcp-ai-incident-db

AI Incident Database (AIID) MCP

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1160+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_incident` | Fetch a full AI Incident Database record by numeric incident_id; returns title, date, description, alleged deployer/developer/harmed parties, and all linked news report URLs. |
| `list_recent` | Most recently added incidents. |
| `list_taxonomies` | Taxonomies used to classify incidents (CSET-AIID, GMF, RAIC). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ai-incident-db": {
      "url": "https://gateway.pipeworx.io/ai-incident-db/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1160+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ai Incident Db data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
