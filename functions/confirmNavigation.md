[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / confirmNavigation

# Function: confirmNavigation()

> **confirmNavigation**(`message?`): `boolean`

Defined in: [src/lib/navigation/guards.ts:99](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/navigation/guards.ts#L99)

Ask the user to confirm navigation when guards are dirty.
Uses native `window.confirm` as a fallback; prefer the in-app
UnsavedChangesModal from useUnsavedChangesGuard hook for better UX.

## Parameters

### message?

`string`

## Returns

`boolean`
