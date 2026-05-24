[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / encrypt

# Function: encrypt()

> **encrypt**(`plaintext`): `string`

Defined in: [src/lib/crypto/tokenEncryption.ts:57](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/crypto/tokenEncryption.ts#L57)

Encrypt a plaintext string using AES-256-GCM.
Returns a base64url-safe compound string: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`.

## Parameters

### plaintext

`string`

## Returns

`string`
