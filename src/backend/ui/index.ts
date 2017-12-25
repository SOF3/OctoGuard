import * as express from "express"
import {secrets} from "../secrets"
import {IS_DEBUGGING, isRequestDebugger} from "../debug/debug"
import {TriggeredError} from "../utils/TriggeredError"
import * as coverage from "../profile/coverage"

export const router = express.Router()

// init CommonConstants
router.use((req, res, next) =>{
	if(IS_DEBUGGING && !isRequestDebugger(req)){
		next(new TriggeredError("Server is under maintenance.", 403))
		return
	}
	const login = req.login.loggedIn ? {
		name: req.login.name,
		uid: req.login.uid,
		displayName: req.login.displayName,
	} : null
	res.locals.CommonConstants = {
		ghApp: {
			id: secrets.ghApp.id,
			clientId: secrets.ghApp.clientId,
			name: secrets.ghApp.name,
		},
		login: login
	}
	res.locals.CoverageTypes = coverage.types
	next()
})

router.get("/", (req, res) =>{
	if(req.login.loggedIn){
		res.render("index-member", {
			title: "OctoGuard"
		})
	}else{
		res.render("index-anon", {
			title: "OctoGuard"
		})
	}
})
