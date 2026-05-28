[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / encrypt

# Function: encrypt()

> **encrypt**(`plaintext`): `string`

Defined in: [src/lib/crypto/tokenEncryption.ts:57](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/crypto/tokenEncryption.ts#L57)

Encrypt a plaintext string using AES-256-GCM.
Returns a base64url-safe compound string: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`.

## Parameters

### plaintext

`string`

## Returns

`string`
