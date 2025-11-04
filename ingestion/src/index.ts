import dotenv from 'dotenv'
import { GreenhouseConnector } from './connectors/greenhouse'
import { LeverConnector } from './connectors/lever'
import { GovPortalConnector } from './connectors/gov-portal'
import { JobNormalizer } from './normalizer'
import { logger } from './lib/logger'

dotenv.config()

class IngestionService {
  private connectors = [
    new GreenhouseConnector(),
    new LeverConnector(),
    new GovPortalConnector(),
  ]

  private normalizer = new JobNormalizer()

  async run(): Promise<void> {
    logger.info('Starting job ingestion...')

    try {
      const allJobs = []

      for (const connector of this.connectors) {
        logger.info(`Running connector: ${connector.name}`)

        try {
          const jobs = await connector.fetchJobs()
          logger.info(`Fetched ${jobs.length} jobs from ${connector.name}`)
          allJobs.push(...jobs)
        } catch (error) {
          logger.error(`Error in connector ${connector.name}:`, error)
          continue
        }
      }

      logger.info(`Total jobs fetched: ${allJobs.length}`)

      // Normalize and deduplicate jobs
      const normalizedJobs = await this.normalizer.normalize(allJobs)
      logger.info(`Normalized to ${normalizedJobs.length} unique jobs`)

      // Save to database
      // TODO: Implement database saving
      logger.info('Job ingestion completed successfully')

    } catch (error) {
      logger.error('Job ingestion failed:', error)
      throw error
    }
  }
}

// Run the service if this file is executed directly
if (require.main === module) {
  const service = new IngestionService()
  service.run()
    .then(() => {
      logger.info('Ingestion service completed')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Ingestion service failed:', error)
      process.exit(1)
    })
}

export { IngestionService }