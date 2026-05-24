[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `events`: `object`[]; `googleConnected`: `boolean`; `outlookConnected`: `boolean`; \}\>\>\>

Defined in: [src/app/api/calendar/events/route.ts:14](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/calendar/events/route.ts#L14)

GET /api/calendar/events
Returns stored CalendarEvent rows for the authenticated user,
plus connection status for Google and Outlook.

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `events`: `object`[]; `googleConnected`: `boolean`; `outlookConnected`: `boolean`; \}\>\>\>
