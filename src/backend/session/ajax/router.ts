import * as express from "express"
import {TriggeredError} from "../../TriggeredError"
import {Session} from "../Session"
import {AjaxTokenEntry} from "./AjaxTokenEntry"
import {AjaxRequest, ARH, knownEnds} from "./knownEnds"

const router = express.Router();
export = router;

router.post("/request", (req, res, next) =>{
	if(req.body.path === undefined){
		next(new TriggeredError("Missing POST parameter 'path'", 400));
		return;
	}
	const entry = AjaxTokenEntry.create(req.session, req.body.path);
	res.set("Content-Type", "text/plain");
	res.send(entry.key);
});

router.use((req, res, next) =>{
	const session: Session = req.session;
	if(req.get("X-Ajax-Token") == null){
		next(new TriggeredError("Missing header X-Ajax-Token", 400));
		return;
	}
	const token: string = req.get("X-Ajax-Token");
	if(session.ajaxTokens[token] === undefined){
		next(new TriggeredError("Non-existent X-Ajax-Token", 401));
		return;
	}
	const entry: AjaxTokenEntry = session.ajaxTokens[token];
	delete session.ajaxTokens[token];
	const path = req.path;
	if(path !== entry.path){
		next(new TriggeredError("The requested path is inconsistent with the path provided in the AJAX token request", 401));
		return;
	}

	let handler: ARH<ReqSuper, ResSuper> = knownEnds[path.substr(1)];
	handler(new AjaxRequest(req.session, req.body, (response) =>{
		res.set("Content-Type", "application/json").send(JSON.stringify(response));
	}, (status, message) =>{
		res.status(status);
		res.set("Content-Type", "text/plain").send(message);
	}));
});
