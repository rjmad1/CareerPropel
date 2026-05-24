[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `events`: `object`[]; `googleConnected`: `boolean`; `outlookConnected`: `boolean`; \}\>\>\>

Defined in: [src/app/api/calendar/events/route.ts:14](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/app/api/calendar/events/route.ts#L14)

GET /api/calendar/events
Returns stored CalendarEvent rows for the authenticated user,
plus connection status for Google and Outlook.

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `events`: `object`[]; `googleConnected`: `boolean`; `outlookConnected`: `boolean`; \}\>\>\>
