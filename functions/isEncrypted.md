[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isEncrypted

# Function: isEncrypted()

> **isEncrypted**(`value`): `boolean`

Defined in: [src/lib/crypto/tokenEncryption.ts:112](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/crypto/tokenEncryption.ts#L112)

Returns true if the given string looks like an encrypted value
(has the `iv:tag:ciphertext` compound format).
Useful during migration to check if a token needs re-encryption.

## Parameters

### value

`string`

## Returns

`boolean`
