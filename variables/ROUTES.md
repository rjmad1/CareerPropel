[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ROUTES

# Variable: ROUTES

> `const` **ROUTES**: `object`

Defined in: [src/lib/navigation/routes.ts:10](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/navigation/routes.ts#L10)

Canonical route registry for CareerPropel.

ALL route construction MUST go through this file.
Never build path strings inline in components.

## Type Declaration

### ANALYTICS

> `readonly` **ANALYTICS**: `"/analytics"` = `'/analytics'`

### API\_KEYS

> `readonly` **API\_KEYS**: `"/api-keys"` = `'/api-keys'`

### AUDIT\_LOGS

> `readonly` **AUDIT\_LOGS**: `"/audit-logs"` = `'/audit-logs'`

### CALENDAR

> `readonly` **CALENDAR**: `"/calendar"` = `'/calendar'`

### DASHBOARD

> `readonly` **DASHBOARD**: `"/dashboard"` = `'/dashboard'`

### DOCUMENT\_DETAIL

> `readonly` **DOCUMENT\_DETAIL**: (`id`) => `` `/documents/${string}` ``

#### Parameters

##### id

`string`

#### Returns

`` `/documents/${string}` ``

### DOCUMENTS

> `readonly` **DOCUMENTS**: `"/documents"` = `'/documents'`

### EMAILS

> `readonly` **EMAILS**: `"/emails"` = `'/emails'`

### FORGOT\_PASSWORD

> `readonly` **FORGOT\_PASSWORD**: `"/forgot-password"` = `'/forgot-password'`

### HOME

> `readonly` **HOME**: `"/"` = `'/'`

### INTERVIEW\_DETAIL

> `readonly` **INTERVIEW\_DETAIL**: (`id`) => `` `/interviews/${string}` ``

#### Parameters

##### id

`string`

#### Returns

`` `/interviews/${string}` ``

### INTERVIEW\_PREP

> `readonly` **INTERVIEW\_PREP**: `"/interview-prep"` = `'/interview-prep'`

### INTERVIEW\_PREP\_JOB

> `readonly` **INTERVIEW\_PREP\_JOB**: (`jobId`) => `` `/interview-prep/${string}` ``

#### Parameters

##### jobId

`string`

#### Returns

`` `/interview-prep/${string}` ``

### INTERVIEWS

> `readonly` **INTERVIEWS**: `"/interviews"` = `'/interviews'`

### JOB\_DETAIL

> `readonly` **JOB\_DETAIL**: (`jobId`) => `` `/jobs/${string}` ``

#### Parameters

##### jobId

`string`

#### Returns

`` `/jobs/${string}` ``

### JOB\_SEARCH

> `readonly` **JOB\_SEARCH**: `"/job-search"` = `'/job-search'`

### JOBS

> `readonly` **JOBS**: `"/jobs"` = `'/jobs'`

### LOGIN

> `readonly` **LOGIN**: `"/login"` = `'/login'`

### NETWORKING

> `readonly` **NETWORKING**: `"/networking"` = `'/networking'`

### OFFER\_DETAIL

> `readonly` **OFFER\_DETAIL**: (`id`) => `` `/offers/${string}` ``

#### Parameters

##### id

`string`

#### Returns

`` `/offers/${string}` ``

### OFFERS

> `readonly` **OFFERS**: `"/offers"` = `'/offers'`

### ONBOARDING

> `readonly` **ONBOARDING**: `"/onboarding"` = `'/onboarding'`

### PROFILE

> `readonly` **PROFILE**: `"/profile"` = `'/profile'`

### PROFILE\_ACCOMPLISHMENTS

> `readonly` **PROFILE\_ACCOMPLISHMENTS**: `"/profile/accomplishments"` = `'/profile/accomplishments'`

### PROFILE\_APPRAISALS

> `readonly` **PROFILE\_APPRAISALS**: `"/profile/appraisals"` = `'/profile/appraisals'`

### REGISTER

> `readonly` **REGISTER**: `"/register"` = `'/register'`

### RESET\_PASSWORD

> `readonly` **RESET\_PASSWORD**: `"/reset-password"` = `'/reset-password'`

### RESUME\_LAB

> `readonly` **RESUME\_LAB**: `"/resume-lab"` = `'/resume-lab'`

### SETTINGS

> `readonly` **SETTINGS**: `object`

#### SETTINGS.ACCOUNT

> `readonly` **ACCOUNT**: `"/settings/account"` = `'/settings/account'`

#### SETTINGS.AI\_PROVIDERS

> `readonly` **AI\_PROVIDERS**: `"/settings/ai-providers"` = `'/settings/ai-providers'`

#### SETTINGS.INTEGRATIONS

> `readonly` **INTEGRATIONS**: `"/settings/integrations"` = `'/settings/integrations'`

#### SETTINGS.SECURITY

> `readonly` **SECURITY**: `"/settings/security"` = `'/settings/security'`

### VERIFY\_EMAIL

> `readonly` **VERIFY\_EMAIL**: `"/verify-email"` = `'/verify-email'`
