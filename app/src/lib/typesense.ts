import { TypesenseClient } from 'typesense'
import { Job } from '@/types'

export class TypesenseService {
  private client: TypesenseClient

  constructor() {
    this.client = new TypesenseClient({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || 'localhost',
          port: parseInt(process.env.TYPESENSE_PORT || '8108'),
          protocol: 'http'
        }
      ],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
      connectionTimeoutSeconds: 10
    })
  }

  async initializeCollection() {
    try {
      // Check if collection exists
      const collections = await this.client.collections().retrieve()
      const jobCollection = collections.find(c => c.name === 'jobs')

      if (!jobCollection) {
        // Create the jobs collection
        const schema = {
          name: 'jobs',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'company_name', type: 'string', facet: true },
            { name: 'function', type: 'string', facet: true },
            { name: 'major_tags', type: 'string[]', facet: true },
            { name: 'location', type: 'string', facet: true },
            { name: 'remote_flag', type: 'bool', facet: true },
            { name: 'paid_flag', type: 'bool', facet: true },
            { name: 'internship_type', type: 'string', facet: true },
            { name: 'ats_type', type: 'string', facet: true },
            { name: 'posted_at', type: 'int64' },
            { name: 'last_verified_at', type: 'int64' },
            { name: 'source_name', type: 'string', facet: true },
            { name: 'company_size_band', type: 'string', facet: true },
            { name: 'industry_tags', type: 'string[]', facet: true }
          ],
          default_sorting_field: 'posted_at'
        }

        await this.client.collections().create(schema)
        console.log('Typesense collection created successfully')
      }

      return true
    } catch (error) {
      console.error('Error initializing Typesense collection:', error)
      return false
    }
  }

  async indexJobs(jobs: Job[]) {
    try {
      if (!jobs || jobs.length === 0) {
        return { success: true, indexed: 0 }
      }

      // Transform jobs for Typesense
      const documents = jobs.map(job => ({
        id: job.id,
        title: job.title,
        company_name: job.company?.name || '',
        function: job.function,
        major_tags: job.majorTags || [],
        location: job.location || '',
        remote_flag: job.remoteFlag || false,
        paid_flag: job.paidFlag || false,
        internship_type: job.internshipType || '',
        ats_type: job.atsType || '',
        posted_at: new Date(job.postedAt || Date.now()).getTime(),
        last_verified_at: new Date(job.lastVerifiedAt || Date.now()).getTime(),
        source_name: job.sourceName || '',
        company_size_band: job.company?.sizeBand || '',
        industry_tags: job.company?.industryTags || []
      }))

      // Index documents in batches of 100
      const batchSize = 100
      let indexedCount = 0

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize)

        try {
          const result = await this.client
            .collections('jobs')
            .documents()
            .import(batch, { action: 'upsert' })

          indexedCount += batch.length
        } catch (error) {
          console.error(`Error indexing batch ${i}-${i + batchSize}:`, error)
        }
      }

      return {
        success: true,
        indexed: indexedCount,
        total: documents.length
      }
    } catch (error) {
      console.error('Error indexing jobs:', error)
      return {
        success: false,
        error: error.message,
        indexed: 0
      }
    }
  }

  async searchJobs(query: string, filters: any = {}) {
    try {
      const searchParameters: any = {
        q: query || '*',
        query_by: 'title,company_name,location,major_tags',
        sort_by: '_text_match:desc,posted_at:desc',
        page: filters.page || 1,
        per_page: Math.min(filters.limit || 20, 250) // Typesense limit
      }

      // Add filters
      const filterConditions = []

      if (filters.function && filters.function.length > 0) {
        filterConditions.push(`function: [${filters.function.map((f: string) => `'${f}'`).join(',')}]`)
      }

      if (filters.majorTags && filters.majorTags.length > 0) {
        filterConditions.push(`major_tags: [${filters.majorTags.map((t: string) => `'${t}'`).join(',')}]`)
      }

      if (filters.location) {
        filterConditions.push(`location: '${filters.location}'`)
      }

      if (filters.remoteFlag !== undefined) {
        filterConditions.push(`remote_flag: ${filters.remoteFlag}`)
      }

      if (filters.paidFlag !== undefined) {
        filterConditions.push(`paid_flag: ${filters.paidFlag}`)
      }

      if (filters.internshipType && filters.internshipType.length > 0) {
        filterConditions.push(`internship_type: [${filters.internshipType.map((t: string) => `'${t}'`).join(',')}]`)
      }

      if (filters.atsType && filters.atsType.length > 0) {
        filterConditions.push(`ats_type: [${filters.atsType.map((t: string) => `'${t}'`).join(',')}]`)
      }

      if (filterConditions.length > 0) {
        searchParameters.filter_by = filterConditions.join(' && ')
      }

      // Add facet queries
      searchParameters.facet_by = [
        'function',
        'major_tags',
        'location',
        'remote_flag',
        'paid_flag',
        'internship_type',
        'company_name',
        'ats_type'
      ].join(',')

      searchParameters.max_facet_values = 100

      const searchResults = await this.client
        .collections('jobs')
        .documents()
        .search(searchParameters)

      // Transform results
      const jobs = searchResults.hits?.map((hit: any) => ({
        ...hit.document,
        _text_match: hit._text_match,
        _highlight: hit._highlight
      })) || []

      const facets = searchResults.facet_counts || {}

      return {
        success: true,
        jobs,
        total: searchResults.found || 0,
        page: searchResults.page || 1,
        limit: searchResults.per_page || 20,
        facets: this.transformFacets(facets)
      }
    } catch (error) {
      console.error('Error searching jobs:', error)
      return {
        success: false,
        error: error.message,
        jobs: [],
        total: 0,
        facets: {}
      }
    }
  }

  private transformFacets(facets: any) {
    const transformed: any = {}

    Object.keys(facets).forEach(key => {
      if (facets[key] && facets[key].counts) {
        transformed[key] = facets[key].counts.reduce((acc: any, facet: any) => {
          acc[facet.value] = facet.count
          return acc
        }, {})
      }
    })

    return transformed
  }

  async updateJob(job: Job) {
    try {
      const document = {
        id: job.id,
        title: job.title,
        company_name: job.company?.name || '',
        function: job.function,
        major_tags: job.majorTags || [],
        location: job.location || '',
        remote_flag: job.remoteFlag || false,
        paid_flag: job.paidFlag || false,
        internship_type: job.internshipType || '',
        ats_type: job.atsType || '',
        posted_at: new Date(job.postedAt || Date.now()).getTime(),
        last_verified_at: new Date(job.lastVerifiedAt || Date.now()).getTime(),
        source_name: job.sourceName || '',
        company_size_band: job.company?.sizeBand || '',
        industry_tags: job.company?.industryTags || []
      }

      await this.client
        .collections('jobs')
        .documents()
        .upsert(document)

      return { success: true }
    } catch (error) {
      console.error('Error updating job:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async deleteJob(jobId: string) {
    try {
      await this.client
        .collections('jobs')
        .documents(jobId)
        .delete()

      return { success: true }
    } catch (error) {
      console.error('Error deleting job:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getCollectionStats() {
    try {
      const collection = await this.client.collections('jobs').retrieve()
      return {
        success: true,
        num_documents: collection.num_documents,
        num_memory_shards: collection.num_memory_shards
      }
    } catch (error) {
      console.error('Error getting collection stats:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}