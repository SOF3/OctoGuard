import * as express from "express";
import * as secrets from "../secrets";
import {Session} from "../session/Session";
import {AjaxTokenEntry} from "../session/ajax/AjaxTokenEntry";

export const router = express.Router();

// init CommonConstants
router.use((req, res, next) =>{
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
	next();
});

router.get("/", (req, res) =>{
	if(req.session.login.loggedIn){
		res.render("index-member", {
			title: "OctoGuard"
		});
	}else{
		res.render("index-anon", {
			title: "OctoGuard"
		});
	}
});