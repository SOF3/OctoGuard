import * as gh from "../gh/api";
import {Session} from "../session/Session";
import Installation = GitHubAPI.Installation;

export = (session: Session, consumer: Consumer<ListInstallsResponse>) =>{
	gh.listInstalls(session.login.token, (installations: Installation[]) =>{
		const result: ListInstallsResponse = {};
		for(let i = 0; i < installations.length; ++i){
			result[installations[i].id] = installations[i];
		}
		consumer(result);
	});
	consumer({});
}
