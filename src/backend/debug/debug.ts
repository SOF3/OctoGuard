import * as express from "express"
import {TriggeredError} from "../utils/TriggeredError"
import {secrets} from "../secrets"

export const IS_DEBUGGING: boolean = true

export const router = express.Router()
	.use((req, res, next) =>{
		if(!isRequestDebugger(req)){
			next(new TriggeredError("Only debuggers are authorized to access this page", 403))
			return
		}
		next()
	})

// .get("/dump-session", require("./dumpSession"))

export function isRequestDebugger(req): boolean{
	return isDebugger(req.connection.remoteAddress)
}

export function isDebugger(address: string): boolean{
	return secrets.debug.addresses.indexOf(address) !== -1
}
