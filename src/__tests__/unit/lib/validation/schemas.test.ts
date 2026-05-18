import {
  createJobSchema,
  updateJobSchema,
  listJobsQuerySchema,
  scheduleInterviewSchema,
  updateInterviewSchema,
  listInterviewsQuerySchema,
  logOfferSchema,
  updateOfferSchema,
  listOffersQuerySchema,
  uploadDocumentSchema,
  listDocumentsQuerySchema,
  updateProfileSchema,
} from '@/lib/validation/schemas'

// ─── Jobs ──────────────────────────────────────────────────────────────────

describe('createJobSchema', () => {
  const valid = {
    title: 'Software Engineer',
    company: 'Acme Corp',
    description: 'A great role',
    location: 'Remote',
  }

  it('accepts a valid job', () => {
    expect(createJobSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing title', () => {
    const { success } = createJobSchema.safeParse({ ...valid, title: '' })
    expect(success).toBe(false)
  })

  it('rejects title over 200 chars', () => {
    const { success } = createJobSchema.safeParse({ ...valid, title: 'x'.repeat(201) })
    expect(success).toBe(false)
  })

  it('rejects missing company', () => {
    const { success } = createJobSchema.safeParse({ ...valid, company: '' })
    expect(success).toBe(false)
  })

  it('rejects missing description', () => {
    const { success } = createJobSchema.safeParse({ ...valid, description: '' })
    expect(success).toBe(false)
  })

  it('rejects missing location', () => {
    const { success } = createJobSchema.safeParse({ ...valid, location: '' })
    expect(success).toBe(false)
  })

  it('accepts optional salary', () => {
    const { success, data } = createJobSchema.safeParse({ ...valid, salary: 120000 })
    expect(success).toBe(true)
    expect(data?.salary).toBe(120000)
  })

  it('rejects negative salary', () => {
    const { success } = createJobSchema.safeParse({ ...valid, salary: -1 })
    expect(success).toBe(false)
  })

  it('accepts valid recruiter object', () => {
    const { success } = createJobSchema.safeParse({
      ...valid,
      recruiter: { name: 'Jane', email: 'jane@example.com', phone: '555-0100' },
    })
    expect(success).toBe(true)
  })

  it('rejects invalid recruiter email', () => {
    const { success } = createJobSchema.safeParse({
      ...valid,
      recruiter: { email: 'not-an-email' },
    })
    expect(success).toBe(false)
  })

  it('accepts valid applicationUrl', () => {
    const { success } = createJobSchema.safeParse({
      ...valid,
      applicationUrl: 'https://jobs.example.com/apply',
    })
    expect(success).toBe(true)
  })

  it('rejects invalid applicationUrl', () => {
    const { success } = createJobSchema.safeParse({
      ...valid,
      applicationUrl: 'not-a-url',
    })
    expect(success).toBe(false)
  })
})

describe('updateJobSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(updateJobSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a valid stage enum value', () => {
    const { success } = updateJobSchema.safeParse({ stage: 'applied' })
    expect(success).toBe(true)
  })

  it('rejects an invalid stage value', () => {
    const { success } = updateJobSchema.safeParse({ stage: 'invalid_stage' })
    expect(success).toBe(false)
  })

  it('accepts valid priority values', () => {
    for (const priority of ['low', 'medium', 'high']) {
      expect(updateJobSchema.safeParse({ priority }).success).toBe(true)
    }
  })

  it('rejects invalid priority', () => {
    expect(updateJobSchema.safeParse({ priority: 'urgent' }).success).toBe(false)
  })

  it('accepts valid status values', () => {
    for (const status of ['active', 'rejected', 'offered', 'archived']) {
      expect(updateJobSchema.safeParse({ status }).success).toBe(true)
    }
  })

  it('accepts all 14 stage values', () => {
    const stages = [
      'sourced', 'interested', 'resume_tailoring', 'applied', 'recruiter_screen',
      'hiring_manager', 'technical_interview', 'system_design', 'behavioral',
      'final_round', 'offer', 'negotiation', 'rejected', 'archived',
    ]
    for (const stage of stages) {
      expect(updateJobSchema.safeParse({ stage }).success).toBe(true)
    }
  })
})

describe('listJobsQuerySchema', () => {
  it('applies defaults for limit, offset, sortBy, sortOrder', () => {
    const data = listJobsQuerySchema.parse({})
    expect(data.limit).toBe(50)
    expect(data.offset).toBe(0)
    expect(data.sortBy).toBe('updatedAt')
    expect(data.sortOrder).toBe('desc')
  })

  it('coerces string limit to number', () => {
    const data = listJobsQuerySchema.parse({ limit: '10' })
    expect(data.limit).toBe(10)
  })

  it('rejects limit over 100', () => {
    expect(listJobsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
  })

  it('rejects limit below 1', () => {
    expect(listJobsQuerySchema.safeParse({ limit: 0 }).success).toBe(false)
  })

  it('rejects offset below 0', () => {
    expect(listJobsQuerySchema.safeParse({ offset: -1 }).success).toBe(false)
  })

  it('accepts valid sortBy values', () => {
    const valid = ['matchScore', 'appliedAt', 'salary', 'company', 'title', 'updatedAt']
    for (const sortBy of valid) {
      expect(listJobsQuerySchema.safeParse({ sortBy }).success).toBe(true)
    }
  })

  it('rejects invalid sortBy', () => {
    expect(listJobsQuerySchema.safeParse({ sortBy: 'createdAt_bad' }).success).toBe(false)
  })
})

// ─── Interviews ────────────────────────────────────────────────────────────

describe('scheduleInterviewSchema', () => {
  const valid = {
    jobId: 'job-123',
    type: 'technical',
    scheduledAt: new Date().toISOString(),
  }

  it('accepts a valid interview', () => {
    expect(scheduleInterviewSchema.safeParse(valid).success).toBe(true)
  })

  it('applies default duration of 60', () => {
    const data = scheduleInterviewSchema.parse(valid)
    expect(data.duration).toBe(60)
  })

  it('rejects duration under 15', () => {
    expect(scheduleInterviewSchema.safeParse({ ...valid, duration: 10 }).success).toBe(false)
  })

  it('rejects duration over 240', () => {
    expect(scheduleInterviewSchema.safeParse({ ...valid, duration: 250 }).success).toBe(false)
  })

  it('rejects invalid interview type', () => {
    expect(scheduleInterviewSchema.safeParse({ ...valid, type: 'coffee_chat' }).success).toBe(false)
  })

  it('rejects missing jobId', () => {
    expect(scheduleInterviewSchema.safeParse({ ...valid, jobId: '' }).success).toBe(false)
  })

  it('rejects invalid scheduledAt', () => {
    expect(scheduleInterviewSchema.safeParse({ ...valid, scheduledAt: 'not-a-date' }).success).toBe(false)
  })

  it('rejects invalid meetingLink', () => {
    expect(scheduleInterviewSchema.safeParse({ ...valid, meetingLink: 'not-a-url' }).success).toBe(false)
  })
})

// ─── Offers ────────────────────────────────────────────────────────────────

describe('logOfferSchema', () => {
  const valid = {
    jobId: 'job-456',
    salary: 150000,
  }

  it('accepts a valid offer', () => {
    expect(logOfferSchema.safeParse(valid).success).toBe(true)
  })

  it('applies default negotiated=false and status=received', () => {
    const data = logOfferSchema.parse(valid)
    expect(data.negotiated).toBe(false)
    expect(data.status).toBe('received')
  })

  it('rejects missing jobId', () => {
    expect(logOfferSchema.safeParse({ salary: 100000 }).success).toBe(false)
  })

  it('rejects zero or negative salary', () => {
    expect(logOfferSchema.safeParse({ ...valid, salary: 0 }).success).toBe(false)
    expect(logOfferSchema.safeParse({ ...valid, salary: -5000 }).success).toBe(false)
  })

  it('accepts valid status values', () => {
    for (const status of ['received', 'accepted', 'rejected', 'pending']) {
      expect(logOfferSchema.safeParse({ ...valid, status }).success).toBe(true)
    }
  })

  it('rejects invalid status', () => {
    expect(logOfferSchema.safeParse({ ...valid, status: 'countered' }).success).toBe(false)
  })
})

// ─── Documents ─────────────────────────────────────────────────────────────

describe('uploadDocumentSchema', () => {
  const valid = {
    name: 'My Resume',
    type: 'resume',
    content: 'Resume content here',
  }

  it('accepts a valid document', () => {
    expect(uploadDocumentSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing name', () => {
    expect(uploadDocumentSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(uploadDocumentSchema.safeParse({ ...valid, type: 'spreadsheet' }).success).toBe(false)
  })

  it('rejects empty content', () => {
    expect(uploadDocumentSchema.safeParse({ ...valid, content: '' }).success).toBe(false)
  })

  it('accepts all valid document types', () => {
    const types = ['resume', 'cover_letter', 'portfolio', 'research', 'notes', 'other']
    for (const type of types) {
      expect(uploadDocumentSchema.safeParse({ ...valid, type }).success).toBe(true)
    }
  })
})

// ─── Profile ───────────────────────────────────────────────────────────────

describe('updateProfileSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true)
  })

  it('rejects invalid email format', () => {
    expect(updateProfileSchema.safeParse({ email: 'not-email' }).success).toBe(false)
  })

  it('accepts valid email', () => {
    expect(updateProfileSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('rejects name over 200 chars', () => {
    expect(updateProfileSchema.safeParse({ name: 'x'.repeat(201) }).success).toBe(false)
  })

  it('accepts valid preferences', () => {
    const { success } = updateProfileSchema.safeParse({
      preferences: {
        targetRoles: ['Engineer', 'Manager'],
        salaryExpectation: 120000,
        jobTypes: ['full_time'],
        workArrangement: ['remote', 'hybrid'],
      },
    })
    expect(success).toBe(true)
  })

  it('rejects invalid jobType', () => {
    expect(
      updateProfileSchema.safeParse({
        preferences: { jobTypes: ['freelance', 'gig'] },
      }).success
    ).toBe(false)
  })
})
