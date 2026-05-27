[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DELETE

# Function: DELETE()

> **DELETE**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

Defined in: [src/app/api/admin/users/route.ts:127](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/app/api/admin/users/route.ts#L127)

DELETE /api/admin/users
Remove a role from a user
Protected: Requires authentication + 'roles.manage' permission

Query parameters:
- email: User email
- role: Role name to remove

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>
