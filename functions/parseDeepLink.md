[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / parseDeepLink

# Function: parseDeepLink()

> **parseDeepLink**(`url`): [`DeepLinkRoute`](../type-aliases/DeepLinkRoute.md)

Defined in: [src/lib/navigation/deep-link.ts:31](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/navigation/deep-link.ts#L31)

Parse the current URL into a typed deep-link state object.
Can be called on the server (with a URL object) or client (with location).

## Parameters

### url

`string` \| `URL`

## Returns

[`DeepLinkRoute`](../type-aliases/DeepLinkRoute.md)
