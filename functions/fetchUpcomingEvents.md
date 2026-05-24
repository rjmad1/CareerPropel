[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchUpcomingEvents

# Function: fetchUpcomingEvents()

> **fetchUpcomingEvents**(`candidateId`, `maxResults?`): `Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>

Defined in: [src/lib/calendar/googleCalendar.ts:166](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/calendar/googleCalendar.ts#L166)

Fetch upcoming events from the user's primary Google Calendar.

## Parameters

### candidateId

`string`

### maxResults?

`number` = `50`

## Returns

`Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>
