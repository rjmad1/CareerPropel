[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / HistoryEntry

# Interface: HistoryEntry

Defined in: [src/lib/navigation/history.ts:11](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/history.ts#L11)

In-process navigation history tracker.

Supplements the browser history API with application-level metadata:
labels, entity names, scroll positions, filter snapshots.

This does NOT replace the browser history stack — it only annotates it.
Native back/forward navigation is always left to the browser.

## Properties

### enteredAt

> **enteredAt**: `number`

Defined in: [src/lib/navigation/history.ts:16](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/history.ts#L16)

***

### label?

> `optional` **label?**: `string`

Defined in: [src/lib/navigation/history.ts:14](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/history.ts#L14)

***

### pathname

> **pathname**: `string`

Defined in: [src/lib/navigation/history.ts:12](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/history.ts#L12)

***

### scrollY

> **scrollY**: `number`

Defined in: [src/lib/navigation/history.ts:15](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/history.ts#L15)

***

### search

> **search**: `string`

Defined in: [src/lib/navigation/history.ts:13](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/history.ts#L13)
