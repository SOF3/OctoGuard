import * as express from "express"
import {BaseWebhookPayload} from "../interface"
import Issue = GitHubAPI.Issue
import Label = GitHubAPI.Label
import Account = GitHubAPI.Account

export function handle(payload: BaseWebhookPayload & {
	action: "assigned" | "unassigned" | "labeled" | "unlabeled" | "opened" | "edited" | "milestoned" | "demilestoned" | "closed" | "reopened"
	issue: Issue
	changes?: {
		title?: {from: string}
		body?: {from: string}
	}
	assignee?: Account
	label?: Label
}, res: express.Response){

}
