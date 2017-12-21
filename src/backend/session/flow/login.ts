import {Session} from "../Session";
import {TriggeredError} from "../../TriggeredError";
import * as curl from "request";
import * as secrets from "../../secrets";
import * as queryString from "query-string";
import * as ghApi from "../../gh/api";
import {Login} from "../Login";

export function loginFlow(req, res, next){
	if(!req.query.code || !req.query.state){
		next(new TriggeredError("Missing GET parameter code or state", 400));
		return;
	}
	const session: Session = req.session;
	if(!session.ajaxTokens.hasOwnProperty(req.query.state)){
		next(new TriggeredError("You spent more than 5 minutes to login. Please try again.\n" +
			"If it still does not work, please make sure you have enabled cookies.\n" +
			"If you have been redirected from a third-party website (other than OctoGuard and GitHub), please do not " +
			"proceed, because the third-party website may be a phishing website.", 401, "error-relog"));
		return;
	}
	delete session.ajaxTokens[req.query.state];

	curl.post("https://github.com/login/oauth/access_token", {
		form: {
			client_id: secrets.secrets.ghApp.clientId,
			client_secret: secrets.secrets.ghApp.secret,
			code: req.query.code,
			state: req.query.state
		}
	}, continueLoginFlow(req, res));
}

function continueLoginFlow(req, res){
	return function(err, httpResponse, body){
		const {access_token: token}: {access_token: string} = queryString.parse(body);
		console.log("Logged in!");
		ghApi.whoAmI(token, user =>{
			console.log(`Login ${user.login}!`);
			const login: Login = req.session.login;
			Login.login(login, user.id, user.login, user.name === null ? user.login : user.name, token);
			console.log(login);
			res.redirect("/");
		});
	};
}
