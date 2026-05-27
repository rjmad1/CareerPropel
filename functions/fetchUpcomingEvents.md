[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchUpcomingEvents

# Function: fetchUpcomingEvents()

> **fetchUpcomingEvents**(`candidateId`, `maxResults?`): `Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>

Defined in: [src/lib/calendar/googleCalendar.ts:166](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/calendar/googleCalendar.ts#L166)

Fetch upcoming events from the user's primary Google Calendar.

## Parameters

### candidateId

`string`

### maxResults?

`number` = `50`

## Returns

`Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>
