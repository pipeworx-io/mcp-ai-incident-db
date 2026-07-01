interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * AI Incident Database (AIID) MCP
 *
 * The AIID is a community-curated record of harms caused by deployed AI
 * systems. Each incident links to news reports, classifications, and
 * impacted parties.
 *
 * Auth: none.
 * Underlying API is GraphQL-backed; we expose a small REST-shaped surface
 * via the public discover endpoints + Algolia search.
 *
 * Public site: https://incidentdatabase.ai/
 */


const GRAPHQL = 'https://incidentdatabase.ai/api/graphql';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_incidents',
    description:
      'Search the AI Incident Database. Combines free-text with date range filters. Returns incident IDs, titles, dates, and a short blurb.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text — title / description' },
        start_date: { type: 'string', description: 'YYYY-MM-DD lower bound on incident date' },
        end_date: { type: 'string', description: 'YYYY-MM-DD upper bound' },
        limit: { type: 'number', description: '1-200 (default 25)' },
        offset: { type: 'number', description: '0-based offset' },
      },
    },
  },
  {
    name: 'get_incident',
    description: 'Fetch a full AI Incident Database record by numeric incident_id; returns title, date, description, alleged deployer/developer/harmed parties, and all linked news report URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        incident_id: { type: 'number', description: 'Numeric AIID incident id' },
      },
      required: ['incident_id'],
    },
  },
  {
    name: 'list_recent',
    description: 'Most recently added incidents.',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'number', description: '1-50 (default 10)' } },
    },
  },
  {
    name: 'list_taxonomies',
    description: 'Taxonomies used to classify incidents (CSET-AIID, GMF, RAIC).',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_incidents':
      return searchIncidents(args);
    case 'get_incident':
      return getIncident(reqNum(args, 'incident_id', '42'));
    case 'list_recent':
      return listRecent(Math.min(50, Math.max(1, (args.limit as number) ?? 10)));
    case 'list_taxonomies':
      return listTaxonomies();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function searchIncidents(args: Record<string, unknown>) {
  const filter: Record<string, unknown> = {};
  // AIID's StringFilter dropped CONTAINS; use REGEX (case-insensitive) with the
  // query escaped to a literal substring match.
  if (args.query) filter['title'] = { REGEX: String(args.query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), OPTIONS: 'i' };
  if (args.start_date) filter['date'] = { ...(filter.date as object ?? {}), GTE: String(args.start_date) };
  if (args.end_date) filter['date'] = { ...(filter.date as object ?? {}), LTE: String(args.end_date) };
  const limit = Math.min(200, Math.max(1, (args.limit as number) ?? 25));
  const skip = Math.max(0, (args.offset as number) ?? 0);
  const query = `query SearchIncidents($filter: IncidentFilterType, $pagination: PaginationType, $sort: IncidentSortType) {
    incidents(filter: $filter, pagination: $pagination, sort: $sort) {
      incident_id title date description
    }
  }`;
  return graphql(query, {
    filter,
    pagination: { limit, skip },
    sort: { date: 'DESC' },
  });
}

async function getIncident(id: number) {
  const query = `query GetIncident($filter: IncidentFilterType) {
    incident(filter: $filter) {
      incident_id title date description
      AllegedDeployerOfAISystem { entity_id name } AllegedDeveloperOfAISystem { entity_id name } AllegedHarmedOrNearlyHarmedParties { entity_id name }
      reports { report_number title url source_domain date_published authors language }
      editors { userId }
    }
  }`;
  return graphql(query, { filter: { incident_id: { EQ: id } } });
}

async function listRecent(limit: number) {
  const query = `query Recent($pagination: PaginationType, $sort: IncidentSortType) {
    incidents(pagination: $pagination, sort: $sort) {
      incident_id title date description
    }
  }`;
  return graphql(query, { pagination: { limit, skip: 0 }, sort: { date: 'DESC' } });
}

async function listTaxonomies() {
  const query = `query Taxonomies {
    taxas { namespace description weight }
  }`;
  return graphql(query, {});
}

async function graphql(query: string, variables: Record<string, unknown>) {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-ai-incident-db/1.0 (+https://pipeworx.io)',
      // AIID's GraphQL endpoint checks Origin against an allow-list.
      Origin: 'https://incidentdatabase.ai',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AIID error: ${res.status} ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as { data?: unknown; errors?: { message: string }[] };
  if (data.errors?.length) {
    throw new Error(`AIID GraphQL error: ${data.errors.map((e) => e.message).join('; ')}`);
  }
  return data.data;
}

function reqNum(args: Record<string, unknown>, key: string, example: string): number {
  const v = args[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(`Required argument "${key}" must be a number. Example: ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
