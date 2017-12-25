// Note: This is a star event, not a subscription event!
import * as express from "express"
import {BaseWebhookPayload} from "../interface"

export function handle(payload: BaseWebhookPayload & {
	// TODO
}, res: express.Response){

}
