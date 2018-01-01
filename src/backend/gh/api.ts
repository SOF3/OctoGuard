import * as curl from "request"
import {ClientRequest, IncomingMessage} from "http"
import User = GitHubAPI.User
import Installation = GitHubAPI.Installation
import Repository = GitHubAPI.Repository

const PREVIEW_INTEGRATION: string = "application/vnd.github.machine-man-preview+json"

export namespace gh{
	export function whoAmI(token: string, consumer: (user: User)=>void, error: GHErrorHandler){
		_("/user", "GET", token, (response: User)=>consumer(response), error)
	}

	export function listInstalls(token: string, consumer: (installations: Installation[])=>void, error: GHErrorHandler){
		_("/user/installations", "GET", token, response=>consumer(response["installations"] as Installation[]), error)
	}

	export function getInstallRepos(installationId: number, token: string, consume: (repos: Repository[])=>void, error: GHErrorHandler){
		_(`/user/installations/${installationId}/repositories?per_page=100`, "GET", token, consume, error, undefined, [PREVIEW_INTEGRATION], (r: InstallReposResponse)=>r.repositories)
	}

	export enum OrganizationRole {
		OWNER, // one of owners
		MEMBER, // normal member
		NONE // not in org
	}

	export function getMembership(organizationId: number, username: string, token: string, consume: (role: OrganizationRole)=>void, onError: GHErrorHandler){
		_(`/organizations/${organizationId}/memberships/${username}`, "GET", token, (result: {
			role: "member" | "admin"
		})=>{
			consume(result.role === "member" ? OrganizationRole.MEMBER : OrganizationRole.OWNER)
		}, (error, status)=>{
			if(status === 404){
				consume(OrganizationRole.NONE)
			}else{
				onError(error, status)
			}
		})
	}
}

export interface GHErrorHandler{
	(message: string, statusCode: number | null): void
}

type InstallReposResponse = GenericResponse & {
	total_count: number,
	repositories: Repository[]
}

type GenericResponse = {} | any[]

function _(path: string, method: string, token: string,
           consume: (object: Object) => void,
           error: GHErrorHandler,
           body?: any,
           accept: string[] = [PREVIEW_INTEGRATION],
           followAdapter: ((r: GenericResponse) => any[]) | null = null){
	console.debug(`curl: ${method} ${path}`)
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
			console.error("curl error: " + response.statusCode)
			console.trace(JSON.stringify(body))
			error("An error occurred while accessing the GitHub API", response.statusCode)
		}else{
			const link: string | undefined = <string> response.headers.link
			body = followAdapter === null ? body : followAdapter(body)
			let linked: boolean = false
			if(link){
				const match: RegExpExecArray | null = /<https:\/\/api\.github\.com(\/[^>]+)>; rel="next"/.exec(link)
				if(match !== null){
					const follow = match[1]
					linked = true
					_(follow, method, token, (append) =>{
						body = (body as any[]).concat(append) // tail recursion! $append should contain all pages from the next one onwards
						consume(body)
					}, error, body, accept, followAdapter)
				}
			}
			if(!linked){
				consume(body)
			}
		}
	})
}
