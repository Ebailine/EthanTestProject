import { google } from 'googleapis'
import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client'
import { OutreachEmail, Contact } from '@/types'

// Gmail Integration
export class GmailService {
  private oauth2Client: any

  constructor(credentials: { clientId: string; clientSecret: string }) {
    this.oauth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`
    )
  }

  async createDrafts(emails: OutreachEmail[], accessToken: string) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken })
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

      const draftIds = []

      for (const email of emails) {
        const message = this.createEmailMessage(email)
        const draft = await gmail.users.drafts.create({
          userId: 'me',
          requestBody: {
            message: {
              raw: message
            }
          }
        })

        draftIds.push(draft.data.id)
      }

      return {
        success: true,
        draftIds,
        message: `Created ${draftIds.length} email drafts in Gmail`
      }
    } catch (error) {
      console.error('Gmail draft creation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async sendEmails(draftIds: string[], accessToken: string) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken })
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

      const sentMessages = []

      for (const draftId of draftIds) {
        // Get draft content
        const draft = await gmail.users.drafts.get({
          userId: 'me',
          id: draftId
        })

        // Send the email
        const message = await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: draft.data.message?.raw
          }
        })

        // Delete the draft after sending
        await gmail.users.drafts.delete({
          userId: 'me',
          id: draftId
        })

        sentMessages.push(message.data.id)
      }

      return {
        success: true,
        sentMessageIds: sentMessages,
        message: `Sent ${sentMessages.length} emails successfully`
      }
    } catch (error) {
      console.error('Gmail send error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  private createEmailMessage(email: OutreachEmail): string {
    const emailContent = [
      `To: ${email.contact?.email}`,
      `Subject: ${email.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      email.bodyText
    ].join('\n')

    return Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
}

// Outlook Integration
class OutlookAuthProvider implements AuthenticationProvider {
  constructor(private accessToken: string) {}

  async getAccessToken(): Promise<string> {
    return this.accessToken
  }
}

export class OutlookService {
  async createDrafts(emails: OutreachEmail[], accessToken: string) {
    try {
      const authProvider = new OutlookAuthProvider(accessToken)
      const graphClient = Client.initWithMiddleware({ authProvider })

      const draftIds = []

      for (const email of emails) {
        const draft = await graphClient
          .api('/me/messages')
          .post({
            subject: email.subject,
            body: {
              contentType: 'text',
              content: email.bodyText
            },
            toRecipients: [
              {
                emailAddress: {
                  address: email.contact?.email
                }
              }
            ],
            isDraft: true
          })

        draftIds.push(draft.id)
      }

      return {
        success: true,
        draftIds,
        message: `Created ${draftIds.length} email drafts in Outlook`
      }
    } catch (error) {
      console.error('Outlook draft creation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async sendEmails(draftIds: string[], accessToken: string) {
    try {
      const authProvider = new OutlookAuthProvider(accessToken)
      const graphClient = Client.initWithMiddleware({ authProvider })

      const sentMessages = []

      for (const draftId of draftIds) {
        // Send the draft
        const message = await graphClient
          .api(`/me/messages/${draftId}/send`)
          .post({})

        sentMessages.push(message.id)
      }

      return {
        success: true,
        sentMessageIds: sentMessages,
        message: `Sent ${sentMessages.length} emails successfully`
      }
    } catch (error) {
      console.error('Outlook send error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Universal Email Service
export class EmailService {
  private gmailService: GmailService
  private outlookService: OutlookService

  constructor() {
    this.gmailService = new GmailService({
      clientId: process.env.GMAIL_CLIENT_ID!,
      clientSecret: process.env.GMAIL_CLIENT_SECRET!
    })
    this.outlookService = new OutlookService()
  }

  async createDrafts(
    emails: OutreachEmail[],
    provider: 'gmail' | 'outlook',
    accessToken: string
  ) {
    switch (provider) {
      case 'gmail':
        return await this.gmailService.createDrafts(emails, accessToken)
      case 'outlook':
        return await this.outlookService.createDrafts(emails, accessToken)
      default:
        throw new Error(`Unsupported email provider: ${provider}`)
    }
  }

  async sendEmails(
    draftIds: string[],
    provider: 'gmail' | 'outlook',
    accessToken: string
  ) {
    switch (provider) {
      case 'gmail':
        return await this.gmailService.sendEmails(draftIds, accessToken)
      case 'outlook':
        return await this.outlookService.sendEmails(draftIds, accessToken)
      default:
        throw new Error(`Unsupported email provider: ${provider}`)
    }
  }

  async validateEmailAccess(provider: 'gmail' | 'outlook', accessToken: string) {
    try {
      if (provider === 'gmail') {
        const gmail = google.gmail({ version: 'v1', auth: accessToken })
        const profile = await gmail.users.getProfile({ userId: 'me' })
        return {
          success: true,
          email: profile.data.emailAddress,
          provider
        }
      } else {
        const authProvider = new OutlookAuthProvider(accessToken)
        const graphClient = Client.initWithMiddleware({ authProvider })
        const user = await graphClient.api('/me').get()
        return {
          success: true,
          email: user.mail || user.userPrincipalName,
          provider
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider
      }
    }
  }
}