[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `message`: `string`; `processed`: `number`; `timestamp`: `string`; \}\>\>

Defined in: [src/app/api/agents/execute-pending/route.ts:101](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/agents/execute-pending/route.ts#L101)

POST /api/agents/execute-pending?immediate=true

Development-only synchronous trigger. Requires EXECUTOR_SECRET even in dev
if the secret is configured, and is completely blocked in production.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `message`: `string`; `processed`: `number`; `timestamp`: `string`; \}\>\>
