import * as express from "express"
import {BaseWebhookPayload} from "../interface"
import Issue = GitHubAPI.Issue
import IssueComment = GitHubAPI.IssueComment

export function handle(payload: BaseWebhookPayload & {
	action: "created" | "edited" | "deleted"
	changes?: {
		body?: {from: string}
	}
	issue: Issue
	comment: IssueComment
}, res: express.Response){

}
