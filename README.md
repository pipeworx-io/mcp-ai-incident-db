# @pipeworx/ai-incident-db

AI Incident Database (AIID) MCP — curated database of AI-caused or AI-related real-world harms. Maintained by the Responsible AI Collaborative. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search_incidents(query?, start_date?, end_date?, limit?, offset?)` — search incidents
- `get_incident(incident_id)` — full incident with linked reports
- `list_recent(limit?)` — most recent incidents
- `list_taxonomies()` — taxonomies used to classify incidents (CSET-AIID, GMF, etc.)

## Data source

`https://incidentdatabase.ai/api/` — public REST. Underlying data also browseable at `https://incidentdatabase.ai/`.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
