[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `candidateId`: `string`; `email`: `string`; `extractionQuality`: \{ `documentCount`: `number`; `lastExtraction`: `Date`; \}; `name`: `string`; `recentAchievements`: `object`[]; `topSkills`: `object`[]; \}\>\>

Defined in: [src/app/api/profile/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/profile/route.ts#L12)

GET /api/profile
Fetch the authenticated user's profile summary.
candidateId is resolved from the session — callers cannot enumerate other users.

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `candidateId`: `string`; `email`: `string`; `extractionQuality`: \{ `documentCount`: `number`; `lastExtraction`: `Date`; \}; `name`: `string`; `recentAchievements`: `object`[]; `topSkills`: `object`[]; \}\>\>
