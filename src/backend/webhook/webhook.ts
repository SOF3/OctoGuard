import * as express from "express"
import * as body_parser from "body-parser"
import * as crypto from "crypto"
import {secrets} from "../secrets"
import {WebhookHandler} from "./interface"

export const router = express.Router()

router.use(body_parser.json({
	verify: (req, res, buffer: Buffer, encoding: string): void =>{
		const given = req.headers["x-hub-signature"]
		if(given.substring(0, 5) !== "sha1="){
			throw "Invalid hmac algo"
		}
		const hmac = crypto.createHmac("sha1", secrets.ghApp.webhookSecret)
		hmac.update(buffer)
		const digest = hmac.digest("hex")
		if(digest.length + 5 !== given.length || digest !== given.substring(5)){
			throw "Cannot verify body"
		}
	},
}))

const handlerTypes: StringMap<WebhookHandler> = {
	ping: require("./events/ping"),
	issues: require("./events/issues"),
	issue_comment: require("./events/issue_comment"),

}

router.post("/", (req, res) =>{
	const event = req.headers["x-github-event"]
	console.info(`Handling ${event} webhook event`)

	if(handlerTypes[event] === undefined){
		res.status(422).set("Content-Type", "text/plain").send("Unsupported event type: " + event)
		return
	}

	handlerTypes[event].handle(req.body, res)
})

router.use("/", (req, res) =>{
	res.status(405).set("Content-Type", "text/plain").send("Method not allowed")
})
