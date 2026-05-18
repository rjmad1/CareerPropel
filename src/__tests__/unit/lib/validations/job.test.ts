import {
  CreateJobInputSchema,
  UpdateJobInputSchema,
  JobFilterSchema,
} from '@/lib/validations/job'

const ALL_STAGES = [
  'sourced', 'interested', 'resume_tailoring', 'applied', 'recruiter_screen',
  'hiring_manager', 'technical_interview', 'system_design', 'behavioral',
  'final_round', 'offer', 'negotiation', 'rejected', 'archived',
] as const

describe('CreateJobInputSchema', () => {
  const validInput = {
    title: 'Frontend Engineer',
    company: 'Widgets Inc.',
  }

  it('accepts minimal valid input', () => {
    expect(CreateJobInputSchema.safeParse(validInput).success).toBe(true)
  })

  it('trims whitespace from title and company', () => {
    const data = CreateJobInputSchema.parse({ title: '  Dev  ', company: '  Corp  ' })
    expect(data.title).toBe('Dev')
    expect(data.company).toBe('Corp')
  })

  it('defaults stage to "sourced"', () => {
    const data = CreateJobInputSchema.parse(validInput)
    expect(data.stage).toBe('sourced')
  })

  it('accepts all valid stage values', () => {
    for (const stage of ALL_STAGES) {
      expect(CreateJobInputSchema.safeParse({ ...validInput, stage }).success).toBe(true)
    }
  })

  it('rejects empty title', () => {
    expect(CreateJobInputSchema.safeParse({ ...validInput, title: '' }).success).toBe(false)
  })

  it('rejects title over 255 characters', () => {
    expect(
      CreateJobInputSchema.safeParse({ ...validInput, title: 'x'.repeat(256) }).success
    ).toBe(false)
  })

  it('rejects empty company', () => {
    expect(CreateJobInputSchema.safeParse({ ...validInput, company: '' }).success).toBe(false)
  })

  it('rejects company over 255 characters', () => {
    expect(
      CreateJobInputSchema.safeParse({ ...validInput, company: 'x'.repeat(256) }).success
    ).toBe(false)
  })

  it('accepts valid url', () => {
    expect(
      CreateJobInputSchema.safeParse({ ...validInput, url: 'https://example.com/jobs/1' }).success
    ).toBe(true)
  })

  it('rejects invalid url', () => {
    expect(
      CreateJobInputSchema.safeParse({ ...validInput, url: 'not-a-url' }).success
    ).toBe(false)
  })

  it('accepts empty string for url', () => {
    expect(CreateJobInputSchema.safeParse({ ...validInput, url: '' }).success).toBe(true)
  })

  it('accepts notes within 2000 chars', () => {
    expect(
      CreateJobInputSchema.safeParse({ ...validInput, notes: 'a'.repeat(2000) }).success
    ).toBe(true)
  })

  it('rejects notes over 2000 chars', () => {
    expect(
      CreateJobInputSchema.safeParse({ ...validInput, notes: 'a'.repeat(2001) }).success
    ).toBe(false)
  })

  it('accepts empty string for notes', () => {
    expect(CreateJobInputSchema.safeParse({ ...validInput, notes: '' }).success).toBe(true)
  })

  it('rejects invalid stage value', () => {
    expect(
      CreateJobInputSchema.safeParse({ ...validInput, stage: 'unknown_stage' }).success
    ).toBe(false)
  })
})

describe('UpdateJobInputSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(UpdateJobInputSchema.safeParse({}).success).toBe(true)
  })

  it('trims whitespace from title', () => {
    const data = UpdateJobInputSchema.parse({ title: '  Engineer  ' })
    expect(data.title).toBe('Engineer')
  })

  it('rejects empty string title (if provided)', () => {
    expect(UpdateJobInputSchema.safeParse({ title: '' }).success).toBe(false)
  })

  it('rejects empty string company (if provided)', () => {
    expect(UpdateJobInputSchema.safeParse({ company: '' }).success).toBe(false)
  })

  it('accepts all valid stage values', () => {
    for (const stage of ALL_STAGES) {
      expect(UpdateJobInputSchema.safeParse({ stage }).success).toBe(true)
    }
  })

  it('rejects invalid stage', () => {
    expect(UpdateJobInputSchema.safeParse({ stage: 'bad_stage' }).success).toBe(false)
  })

  it('accepts valid url', () => {
    expect(
      UpdateJobInputSchema.safeParse({ url: 'https://example.com/job' }).success
    ).toBe(true)
  })

  it('accepts empty url string', () => {
    expect(UpdateJobInputSchema.safeParse({ url: '' }).success).toBe(true)
  })

  it('rejects invalid url', () => {
    expect(UpdateJobInputSchema.safeParse({ url: 'bad-url' }).success).toBe(false)
  })
})

describe('JobFilterSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(JobFilterSchema.safeParse({}).success).toBe(true)
  })

  it('accepts all valid filter fields', () => {
    const { success } = JobFilterSchema.safeParse({
      company: 'Acme',
      search: 'engineer',
      stage: 'applied',
      sortBy: 'matchScore',
      sortDir: 'asc',
    })
    expect(success).toBe(true)
  })

  it('accepts "asc" and "desc" for sortDir', () => {
    expect(JobFilterSchema.safeParse({ sortDir: 'asc' }).success).toBe(true)
    expect(JobFilterSchema.safeParse({ sortDir: 'desc' }).success).toBe(true)
  })

  it('rejects invalid sortDir', () => {
    expect(JobFilterSchema.safeParse({ sortDir: 'random' }).success).toBe(false)
  })
})
