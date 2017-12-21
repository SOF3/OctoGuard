import * as curl from "request";
import {TriggeredError} from "../TriggeredError";
import User = GitHubAPI.User;
import Installation = GitHubAPI.Installation;

const PREVIEW_INTEGRATION: string = "application/vnd.github.machine-man-preview+json";

export function whoAmI(token: string, consumer: Consumer<User>){
	_("/user", "GET", token, response => consumer(<User> response));
}

export function listInstalls(token: string, consumer: Consumer<Installation[]>){
	_("/user/installations", "GET", token, response => consumer(<Installation[]> response["installations"]))
}

function _(path: string, method: string, token: string, consumer: Consumer<Object>, body: any = undefined, accept: string[] = [PREVIEW_INTEGRATION], error: Consumer<number> = function(statusCode){
	console.error(`Error ${statusCode}!`);
	throw new TriggeredError(`A ${statusCode} error occurred while trying to access the GitHub API.`, 502);
}){
	console.log(`curl ${method} ${path}`);
	curl({
		url: path,
		baseUrl: "https://api.github.com/",
		method: method,
		headers: {
			"User-Agent": "OctoGuard/0.0",
			Authorization: `bearer ${token}`,
			Accept: accept.join(", ")
		},
		body: body,
		json: true
	}, (err, response, body) =>{
		if(response.statusCode >= 400){
			error(response.statusCode);
		}else{
			consumer(body);
		}
	});
}
