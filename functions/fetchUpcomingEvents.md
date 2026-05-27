[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchUpcomingEvents

# Function: fetchUpcomingEvents()

> **fetchUpcomingEvents**(`candidateId`, `maxResults?`): `Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>

Defined in: [src/lib/calendar/googleCalendar.ts:166](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/calendar/googleCalendar.ts#L166)

Fetch upcoming events from the user's primary Google Calendar.

## Parameters

### candidateId

`string`

### maxResults?

`number` = `50`

## Returns

`Promise`\<[`CalendarEventRaw`](../interfaces/CalendarEventRaw.md)[]\>
