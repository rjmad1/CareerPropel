[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / decrypt

# Function: decrypt()

> **decrypt**(`ciphertext`): `string`

Defined in: [src/lib/crypto/tokenEncryption.ts:80](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/crypto/tokenEncryption.ts#L80)

Decrypt a compound ciphertext string produced by `encrypt()`.
Throws if the authentication tag verification fails (data tampering detected).

## Parameters

### ciphertext

`string`

## Returns

`string`
