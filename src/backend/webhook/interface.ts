import * as express from "express"
import User = GitHubAPI.User

export interface WebhookHandler{
	event: string

	handle(payload: {}, res: express.Response): void
}

export interface BaseWebhookPayload{
	repository: Repository
	sender: User
	installation: WebhookInstallation
}

declare interface WebhookInstallation{
	id: number
}
