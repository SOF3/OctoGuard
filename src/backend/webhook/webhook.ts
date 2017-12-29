import * as express from "express"
import * as body_parser from "body-parser"
import * as crypto from "crypto"
import {secrets} from "../secrets"
import {BaseWebhookPayload, WebhookHandler} from "./interface"
import {db} from "../db/db"
import {Profile} from "../profile/Profile"

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
	issues: require("./events/issues"),
	issue_comment: require("./events/issue_comment"),
	membership: require("./events/membership"),
	organization: require("./events/organization"),
	pull_request: require("./events/pull_request"),
	pull_request_review: require("./events/pull_request_review"),
	pull_request_review_comment: require("./events/pull_request_review_comment"),
	repository: require("./events/repository"),
	team: require("./events/team"),
	team_add: require("./events/team_add"),
	watch: require("./events/watch"),
}

router.post("/", (req, res) =>{
	const event = req.headers["x-github-event"]
	console.info(`Handling ${event} webhook event`)

	if(handlerTypes[event] === undefined){
		res.status(422).set("Content-Type", "text/plain").send("Unsupported event type: " + event)
		return
	}

	const reportError: db.ErrorHandler = (error: db.SqlError) =>{
		reportError(error)
		res.status(500).send("Database error")
	}

	const locateProfile = (profileId) =>{
		const query = Profile.baseQuery()
		query.where = "profileId = ?"
		query.whereArgs = [profileId]
		query.execute((result: db.ResultSet<DProfile>) =>{
			payload.profile = Profile.fromRow(result[0])
			handlerTypes[event].handle(payload, res)
		}, reportError)
	}

	const payload: BaseWebhookPayload = req.body
	db.select("SELECT profileId FROM repo_profile_map WHERE repoId = ?", [payload.repository.id], result =>{
		if(result.length > 0){
			locateProfile(result[0].pid)
			return
		}
		db.select("SELECT profileId FROM profile WHERE owner = ? AND name = ?", [payload.repository.owner.id, Profile.DEFAULT_NAME], result =>{
			if(result.length > 0){
				locateProfile(result[0].pid)
				return
			}
			payload.profile = Profile.defaultProfile(payload.repository.owner.id, new Date) // the regDate doesn't matter here
			handlerTypes[event].handle(payload, res)
		}, reportError)
	}, reportError)
})

router.use("/", (req, res) =>{
	res.status(405).set("Content-Type", "text/plain").send("Method not allowed")
})
