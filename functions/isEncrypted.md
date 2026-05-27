[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isEncrypted

# Function: isEncrypted()

> **isEncrypted**(`value`): `boolean`

Defined in: [src/lib/crypto/tokenEncryption.ts:112](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/crypto/tokenEncryption.ts#L112)

Returns true if the given string looks like an encrypted value
(has the `iv:tag:ciphertext` compound format).
Useful during migration to check if a token needs re-encryption.

## Parameters

### value

`string`

## Returns

`boolean`
