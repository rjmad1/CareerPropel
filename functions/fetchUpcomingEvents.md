[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchUpcomingEvents

# Function: fetchUpcomingEvents()

> **fetchUpcomingEvents**(`candidateId`, `maxResults?`): `Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>

Defined in: [src/lib/calendar/googleCalendar.ts:166](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/calendar/googleCalendar.ts#L166)

Fetch upcoming events from the user's primary Google Calendar.

## Parameters

### candidateId

`string`

### maxResults?

`number` = `50`

## Returns

`Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>
