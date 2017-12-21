import * as express from "express";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as lessMiddleware from "less-middleware";
import * as session from "express-session";
import * as secrets from "./secrets";
import {TriggeredError} from "./TriggeredError";
import * as ajax from "./session/ajax/ajax";
import * as debug from "./debug/debug";
import * as index from "./ui/index";
import * as flow from "./session/flow";
import * as webhook from "./webhook/webhook";
import {AjaxTokenEntry} from "./session/ajax/AjaxTokenEntry";
import {Session} from "./session/Session";

const app = express();

app.set("views", path.join("views"));
app.set("view engine", "pug");
app.locals.escapeHtml = require("escape-html");

app.use(favicon(path.join(__dirname, "..", "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, "..", "public")));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(session({
	secret: secrets.secrets.cookieSecrets,
	name: "OctoGuardSession",
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 86400
	}
}));

app.use(ajax.clean);

app.use("/ajax", ajax.router);
app.use("/debug", debug.router);
app.get("/gh/callback/auth", flow.loginFlow);
app.get("/gh/callback/setup", flow.setupFlow);
app.use("/gh/webhook", webhook.entry);
app.use("/", index.router);

// catch 404 and forward to error handler
app.use(function(req, res, next){
	const err = new TriggeredError(`The URL ${req.path} is invalid`, 404);
	next(err);
});

// error handler
// noinspection JSUnusedLocalSymbols
app.use(function(err: Error | TriggeredError, req, res, next){
	let title = "500 Internal Server Error";
	if(err instanceof TriggeredError && err.status){
		res.status(err.status || 500);
		if(err.status === 400){
			title = "400 Bad Request";
		}else if(err.status === 401){
			title = "401 Access Denied";
		}else if(err.status === 403){
			title = "403 Forbidden";
		}else if(err.status === 404){
			title = "404 Not Found";
		}else if(err.status === 410){
			title = "410 Gone";
		}
	}else{
		res.status(500);
	}

	const session: Session = req.session;
	const login = session.login.loggedIn ? {
		name: session.login.name,
		uid: session.login.uid,
		displayName: session.login.displayName
	} : null;
	const longAjaxToken = AjaxTokenEntry.create(session, "?#@Long Ajax Token@#?", 300e+3).key;
	res.locals.CommonConstants = {
		ghApp: {
			id: secrets.secrets.ghApp.id,
			clientId: secrets.secrets.ghApp.clientId,
			name: secrets.secrets.ghApp.name,
		},
		longAjaxToken: longAjaxToken,
		login: login
	};

	res.render(err instanceof TriggeredError ? err.template : "error", {
		title: title,
		message: err.message,
		trace: debug.isRequestDebugger(req) ? err.stack : ""
	});
});

export = app;
