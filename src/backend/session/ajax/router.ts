import * as express from "express"
import {TriggeredError} from "../../utils/TriggeredError"
import {AjaxTokenEntry} from "./AjaxTokenEntry"
import {AjaxRequest, ARH, knownEnds} from "../../ajax/knownEnds"
import * as crypto from "crypto"

export const router = express.Router()

export let tokenStore = {}

router.post("/request", (req, res, next) =>{
	if(req.body.path === undefined){
		next(new TriggeredError("Missing POST parameter 'path'", 400))
		return
	}

	crypto.randomBytes(20, (err: Error, buf: Buffer) =>{
		const token = buf.toString("hex")
		tokenStore[token] = new AjaxTokenEntry(token, req.body.path, req.body.long ? 300e+3 : 10e+3)
		res.set("Content-Type", "text/plain")
		res.send(token)
	})
})

router.use((req, res, next) =>{
	if(req.get("X-Ajax-Token") == null){
		next(new TriggeredError("Missing header X-Ajax-Token", 400))
		return
	}
	const token: string = req.get("X-Ajax-Token")
	if(tokenStore[token] === undefined){
		next(new TriggeredError(`Non-existent X-Ajax-Token: ${token}`, 401))
		return
	}
	const entry: AjaxTokenEntry = tokenStore[token]
	delete tokenStore[token]
	const path = req.path
	if(path !== entry.path){
		next(new TriggeredError("The requested path is inconsistent with the path provided in the AJAX token request", 401))
		return
	}

	if(!req.login.loggedIn){
		next(new TriggeredError("Login is required for this action", 401))
		return
	}

	let handler: ARH<ReqSuper, ResSuper> = knownEnds[path.substr(1)]
	handler(new AjaxRequest(req.login, req.body,
		response => res.set("Content-Type", "application/json").send(JSON.stringify(response)),
		(status, message) => res.status(status).set("Content-Type", "text/plain").send(message),
	))
})

router.use((err: Error | TriggeredError, req, res, next) =>{
	res.status(err instanceof TriggeredError ? (err.status || 500) : 500)
	console.error(err)
	res.send(JSON.stringify(err.message, null, "\t"))
})
