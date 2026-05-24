[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `candidateId`: `string`; `completenessScore`: \{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \} \| `null`; `email`: `string`; `extractionQuality`: \{ `averageConfidence`: `number`; `documentCount`: `number`; `lastExtraction`: `Date`; `totalEntities`: `number`; \}; `name`: `string`; `recentAchievements`: `object`[]; `topSkills`: `object`[]; \}\>\>

Defined in: [src/app/api/profile/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/profile/route.ts#L12)

GET /api/profile
Fetch the authenticated user's profile summary.
candidateId is resolved from the session — callers cannot enumerate other users.

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `candidateId`: `string`; `completenessScore`: \{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \} \| `null`; `email`: `string`; `extractionQuality`: \{ `averageConfidence`: `number`; `documentCount`: `number`; `lastExtraction`: `Date`; `totalEntities`: `number`; \}; `name`: `string`; `recentAchievements`: `object`[]; `topSkills`: `object`[]; \}\>\>
