[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / encrypt

# Function: encrypt()

> **encrypt**(`plaintext`): `string`

Defined in: [src/lib/crypto/tokenEncryption.ts:57](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/crypto/tokenEncryption.ts#L57)

Encrypt a plaintext string using AES-256-GCM.
Returns a base64url-safe compound string: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`.

## Parameters

### plaintext

`string`

## Returns

`string`
