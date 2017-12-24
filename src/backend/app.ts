import * as express from "express"
import * as path from "path"
import * as favicon from "serve-favicon"
import * as logger from "morgan"
import * as cookie_parser from "cookie-parser"
import * as body_parser from "body-parser"
import * as less_middleware from "less-middleware"
import * as session from "express-session"
import {TriggeredError} from "./utils/TriggeredError"
import * as ajax from "./session/ajax/ajax"
import * as debug from "./debug/debug"
import * as index from "./ui/index"
import * as flow from "./session/flow"
import * as webhook from "./webhook/webhook"
import {Session} from "./session/Session"
import {secrets} from "./secrets"

const app = express()

app.set("views", path.join("views"))
app.set("view engine", "pug")
app.locals.escapeHtml = require("escape-html")

app.use(favicon(path.join(__dirname, "..", "public", "favicon.ico")))
app.use(logger("dev"))
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended: false}))
app.use(cookie_parser())
app.use(less_middleware(path.join(__dirname, "..", "public")))
app.use(express.static(path.join(__dirname, "..", "public")))
app.use(session({
	secret: secrets.cookieSecrets,
	name: "OctoGuardSession",
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 86400e+3,
	}
}))

app.use(ajax.clean)

app.use("/ajax", ajax.router)
app.use("/debug", debug.router)
app.get("/gh/callback/auth", flow.loginFlow)
app.get("/gh/callback/setup", flow.setupFlow)
app.use("/gh/webhook", webhook.entry)
app.use("/", index.router)

// catch 404 and forward to error handler
app.use((req, res, next) =>{
	const err = new TriggeredError(`The URL ${req.path} is invalid`, 404)
	next(err)
})

// error handler
// noinspection JSUnusedLocalSymbols
app.use((err: Error | TriggeredError, req, res, next) =>{
	let title = "500 Internal Server Error"
	if(err instanceof TriggeredError && err.status){
		res.status(err.status || 500)
		if(err.status === 400){
			title = "400 Bad Request"
		}else if(err.status === 401){
			title = "401 Access Denied"
		}else if(err.status === 403){
			title = "403 Forbidden"
		}else if(err.status === 404){
			title = "404 Not Found"
		}else if(err.status === 410){
			title = "410 Gone"
		}
	}else{
		res.status(500)
	}

	const session: Session | null = req.session
	const login = session && session.login && session.login.loggedIn ? {
		name: session.login.name,
		uid: session.login.uid,
		displayName: session.login.displayName
	} : null
	res.locals.CommonConstants = {
		ghApp: {
			id: secrets.ghApp.id,
			clientId: secrets.ghApp.clientId,
			name: secrets.ghApp.name,
		},
		login: login
	}

	res.render(err instanceof TriggeredError ? err.template : "error", {
		title: title,
		message: err.message,
		trace: debug.isRequestDebugger(req) ? err.stack : ""
	})
})

export = app
