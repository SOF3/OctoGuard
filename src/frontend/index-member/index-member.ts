const x = {} as any

const orgs: StringMap<Installation> = {} // indexed by UID

$(function(){
	const headWrapper = $("#head-wrapper")
	const bodyWrapper = $("#body-wrapper")

	document.body.style.height = document.body.style.maxHeight = window.innerHeight + "px"
	document.body.style.display = "block"

	headWrapper.css("height", `${Header.HEIGHT}px`)
		.css("min-height", `${Header.HEIGHT}px`)
		.css("max-height", `${Header.HEIGHT}px`)
	bodyWrapper.css("height", `${window.innerHeight - Header.HEIGHT}px`)
		.css("min-height", `${window.innerHeight - Header.HEIGHT}px`)
		.css("max-height", `${window.innerHeight - Header.HEIGHT}px`)

	const viewPort = x.v = new ViewPort
	const orgsColumn = new OrgsColumn
	const profilesColumn = new ProfilesColumn
	const rulesColumn = new RulesColumn
	const triggersColumn = new TriggersColumn
	viewPort.columns = [orgsColumn, profilesColumn, rulesColumn, triggersColumn]
	viewPort.render(bodyWrapper)

	ajax("listProfiles", {} as ListProfilesReq, (res: ListProfilesRes) =>{
		for(const i in res.installations){
			orgs[res.installations[i].account.id] = res.installations[i]
		}
		orgsColumn.updateDependency(res.installations)
	})
})
