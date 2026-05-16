'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  company: string
  stage: string
  url?: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchJobs()
    }
  }, [status])

  async function fetchJobs() {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      const data = await response.json()
      
      if (data.data) {
        setJobs(data.data)
      }
      setError('')
    } catch (err) {
      setError('Failed to fetch jobs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, url, stage: 'interested' })
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      setTitle('')
      setCompany('')
      setUrl('')
      await fetchJobs()
    } catch (err) {
      setError('Failed to add job')
      console.error(err)
    }
  }

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">CareerPropel Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Add Job Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add New Job</h2>
            {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
            <form onSubmit={handleAddJob} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="url"
                placeholder="Job URL (optional)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Job
              </button>
            </form>
          </div>

          {/* Jobs List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Jobs</h2>
              <button
                onClick={fetchJobs}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : jobs.length === 0 ? (
              <p className="text-gray-500">No jobs yet. Add one to get started!</p>
            ) : (
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-bold">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {job.stage}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* API Test Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">✅ Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Status:</strong> <span className="text-green-600">✓ Authenticated</span></p>
            <p className="text-gray-600 mt-4">
              Your authentication is working! All API endpoints are protected and will only return your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
