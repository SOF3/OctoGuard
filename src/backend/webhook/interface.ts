import * as express from "express"
import {Profile} from "../profile/Profile"
import User = GitHubAPI.User

export interface WebhookHandler{
	handle(payload: {}, res: express.Response): void
}

export interface BaseWebhookPayload{
	repository: Repository
	sender: User
	installation: WebhookInstallation
	profileId?: number
	profile?: Profile
}

declare interface WebhookInstallation{
	id: number
}
