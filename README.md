# n8n-nodes-lurkapi

An [n8n](https://n8n.io) community node for [LurkAPI](https://lurkapi.com), which returns public social media data as JSON: profiles, posts, comments, transcripts and ad libraries from TikTok, Instagram, YouTube, Facebook, Reddit, LinkedIn, X, Threads, Bluesky, Telegram, Truth Social, Snapchat, Google (ads, Maps, News), eBay and Linktree, plus any web page as markdown.

Every LurkAPI endpoint is an operation. The operations are generated from LurkAPI's [OpenAPI document](https://api.lurkapi.com/openapi.json), so a new endpoint arrives with the next release, and **Custom API Call** reaches it right away.

## Installation

In n8n, open **Settings → Community Nodes → Install**, enter `n8n-nodes-lurkapi`, and confirm. See n8n's [community nodes guide](https://docs.n8n.io/integrations/community-nodes/installation/) for self-hosted setups.

## Credentials

1. Sign in at [lurkapi.com/login](https://lurkapi.com/login). New accounts get free credits, and a small free top-up every day.
2. Create a key on the [dashboard](https://lurkapi.com/dashboard). It starts with `lk_live_`.
3. In n8n, add a **LurkAPI API** credential and paste the key. n8n tests it against the free credit-balance endpoint.

The key is sent in the `x-api-key` header.

## Operations

Pick a **Resource** (the platform), then an **Operation** (the endpoint). Required parameters appear as fields; the rest are under **Options**. Each operation's description gives its price in credits. The [docs](https://lurkapi.com/docs) show every endpoint's parameters and a real response.

Some examples:

| Resource | Operation | What you get |
| --- | --- | --- |
| TikTok | Profile | A creator's bio and exact follower, like and video counts |
| YouTube | Video transcript | A video's transcript |
| Facebook | Ad Library ads by company | A company's ads from Meta's Ad Library |
| Reddit | Search | Posts matching a query |
| Instagram | User posts | An account's latest posts |
| Web | Scrape a page (Auto) | Any page as markdown, getting past walls when needed |
| Account | Credit balance | Credits left (free) |

**Custom API Call** takes a path such as `/v1/tiktok/profile` and query parameters such as `handle` = `nike`. Use it for an endpoint this version of the node doesn't list yet.

Each operation returns LurkAPI's JSON answer as one item: the data, plus `credits_charged` and `credits_remaining`.

## Use with AI agents

The node is usable as a tool, so an n8n AI Agent can call it. Give the agent the operations it needs, and let it fill the parameters with `$fromAI()`.

## Example workflow

[`examples/tiktok-profile.json`](examples/tiktok-profile.json) reads Nike's TikTok profile and keeps the handle, followers and likes. In n8n, open a new workflow, paste the file's contents, and select your LurkAPI credential.

## Costs and errors

- A call that reached the platform is charged, `not_found` included. Invalid parameters, rate limits and server errors are free.
- Errors come back as `{ success: false, error, code, docs }`. n8n shows the `error` message; [the error list](https://lurkapi.com/docs#errors) explains each `code`.
- Rate limit: 50 requests per 10 seconds per account.

## Development

```bash
npm install
npm run generate   # rewrite nodes/LurkApi/operations.generated.ts from the live openapi.json
npm run lint
npm run build
npm test           # checks the built node
npm run dev        # runs n8n with the node loaded
```

`npm run generate` also takes a file path: `node scripts/generate.mjs ./openapi.json`.

The publish workflow runs every Monday: it regenerates the operations, and publishes a patch release only when they changed. Releases are published from GitHub Actions with npm provenance.

## License

[MIT](LICENSE)
