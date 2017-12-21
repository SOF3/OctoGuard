import * as curl from "request"
import {ClientRequest, IncomingMessage} from "http"
import User = GitHubAPI.User;
import Installation = GitHubAPI.Installation;
import Repository = GitHubAPI.Repository;

const PREVIEW_INTEGRATION: string = "application/vnd.github.machine-man-preview+json";

export interface GHErrorHandler{
	(message: string, statusCode: number | null): void;
}

export function whoAmI(token: string, consumer: (user: User) => void, error: GHErrorHandler){
	_("/user", "GET", token, response => consumer(<User> response), error);
}

export function listInstalls(token: string, consumer: (installations: Installation[]) => void, error: GHErrorHandler){
	_("/user/installations", "GET", token, response => consumer(<Installation[]> response["installations"]), error);
}

type InstallReposResponse = GenericResponse & {
	total_count: number,
	repositories: Repository[]
}

export function getInstallRepos(installationId: number, token: string, consume: (repos: Repository[]) => void, error: GHErrorHandler){
	_(`/user/installations/${installationId}/repositories?per_page=3`, "GET", token, consume, error, undefined, [PREVIEW_INTEGRATION], (r: InstallReposResponse) => r.repositories);
}

type GenericResponse = StringMapping<any> | any[]

function _(path: string, method: string, token: string,
           consume: (object: Object) => void,
           error: GHErrorHandler,
           body: any = undefined,
           accept: string[] = [PREVIEW_INTEGRATION],
           followAdapter: ((r: GenericResponse) => any[]) | null = null){
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
	}, (err: ClientRequest, response: IncomingMessage, body: GenericResponse) =>{
		if(response.statusCode >= 400){
			error("An error occurred while accessing the GitHub API", response.statusCode);
		}else{
			const link: string | undefined = <string> response.headers.Link;
			body = followAdapter === null ? body : followAdapter(body);
			if(link){
				const match: RegExpExecArray | null = /<https:\/\/api\.github\.com(\/[^>]+)>; rel="next"/.exec(link);
				if(match !== null){
					const follow = match[1];
					_(follow, method, token, (append) =>{
						body = (<any[]> body).concat(append); // tail recursion! $append should contain all pages from the next one onwards
					}, error, body, accept, followAdapter);
				}
			}
			consume(body);
		}
	});
}
