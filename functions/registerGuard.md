[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / registerGuard

# Function: registerGuard()

> **registerGuard**(`isDirty`, `options?`): `UnregisterFn`

Defined in: [src/lib/navigation/guards.ts:66](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/navigation/guards.ts#L66)

Register a navigation guard.

`isDirty` — called before navigation; if true, the guard fires.
Returns an unregister function; call it in a useEffect cleanup.

## Parameters

### isDirty

() => `boolean`

### options?

[`GuardOptions`](../interfaces/GuardOptions.md) = `{}`

## Returns

`UnregisterFn`
