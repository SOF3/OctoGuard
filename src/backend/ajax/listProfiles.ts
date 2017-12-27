import * as gh_api from "../gh/api"
import {AjaxRequest, OnError_AR2DB, OnError_AR2GH} from "./knownEnds"
import {db} from "../db/db"
import {Profile} from "../profile/Profile"
import {ProfileRule} from "../profile/ProfileRule"
import {Object_size} from "../utils/helper"
import {Login} from "../session/login/Login"
import Installation = GitHubAPI.Installation
import Join = db.Join

export = (req: AjaxRequest<ListProfilesReq, ListProfilesRes>) =>{
	const onError = OnError_AR2DB(req.onError)

	gh_api.listInstalls(req.login.token, (installsArray: Installation[]) =>{
		const installsByInstallId: StringMap<Installation> = {}
		const installsByUid: StringMap<Installation> = {}
		const uids: number[] = []
		for(let i = 0; i < installsArray.length; ++i){
			installsArray[i].profiles = {}
			installsByInstallId[installsArray[i].id] = installsArray[i]
			installsByUid[installsArray[i].account.id] = installsArray[i]
			uids.push(installsArray[i].account.id)
		}

		const where: db.IWhereClause = new db.ListWhereClause("owner", uids)

		const profilesQuery = Profile.baseQuery()
		profilesQuery.where = profilesQuery.whereArgs = where
		profilesQuery.execute((profileResultSet: db.ResultSet<DProfile>) =>{
			const profiles: StringMap<IProfile> = {}
			for(const i in profileResultSet){
				const profile = Profile.fromRow(profileResultSet[i])
				installsByUid[profile.owner].profiles[profile.profileId] = profile
				profiles[profileResultSet[i].profileId] = profile
			}

			ProfileRule.load(where, where, rules =>{
				for(const key in rules){
					const rule: ProfileRule = rules[key]
					const profile = profiles[rule.profileId]
					profile.rules.push(rule)
				}

				for(const installId in installsByInstallId){
					const install = installsByInstallId[installId]
					if(Object_size(install.profiles) === 0){
						install.profiles[-1] = Profile.defaultProfile(install.account.id, req.login.regDate)
					}
				}

				req.consume({installations: installsByInstallId})
			}, onError, [
				Join.INNER_ON("profile", "profileId", "profile_rule", "ruleId"),
			])
		}, onError)
	}, OnError_AR2GH(req.onError))
}

function sendResult(consume: Function, installs: StringMap<Installation>, profiles: StringMap<IProfile>, login: Login){
	for(const installId in installs){
		const install: Installation & {profiles?: StringMap<IProfile>} = installs[installId]
		const orgProfiles = install.profiles = {} as StringMap<IProfile>
		for(const profileId in profiles){
			const profile: IProfile = profiles[profileId]
			if(profile.owner === install.account.id){
				orgProfiles[profile.profileId] = profile
			}
		}
		if(Object_size(orgProfiles) === 0){
			orgProfiles[-1] = Profile.defaultProfile(install.account.id, login.regDate)
		}
	}
	consume({installations: installs})
}
