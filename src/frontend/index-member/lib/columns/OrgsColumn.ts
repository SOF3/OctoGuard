class OrgsColumn extends Column<Installation | OrgRepo, StringMap<Installation>>{
	constructor(){
		super(_("Installed orgs and repos"), _("Loading..."))
	}

	updateDependency(installations: StringMap<Installation>){
		this.$content.empty()
		for(const installId in installations){
			const install = installations[installId]

			const pair = new SpoilerPair(_("Show installed repos"))
			pair.spoiler.append(`<p class="placeholder-text">Loading...</p>`)
			this.$content.append($(`<div class="list-item-wrapper"></div>`)
				.append($(`<div class="list-item-header"></div>`)
					.append($(`<p class="list-item-title"></p>`).text(install.account.login))
					.append($(`<p class="list-item-detail"></p>`).text("Last changed: ")
						.append($(`<span class="timestamp"></span>`)
							.attr("data-timestamp", new Date(install.updated_at).getTime())))
					.append($(`<p class="list-item-detail"></p>`)
						.text(`Installed in ${install.repository_selection} repos `)
						.append($(`<a class="action" target="_blank">(Edit)</a>`).attr("href", install.html_url)))
					.click(() => this.reportedValue.set(install)))
				.append(pair.toggle)
				.append(pair.spoiler))

			installRepoWatch[install.account.id] = new Observable<Repository[]>()
			installRepoWatch[install.account.id].onceNotNull((repos: Repository[]) =>{
				pair.spoiler.empty()
				for(let i = 0; i < repos.length; ++i){
					pair.spoiler.append($(`<div class="small-list-item"></div>`)
						.append($(`<a class="action"></a>`).text(repos[i].name)
							.click(() => this.reportedValue.set(new OrgRepo(repos[i], install)))))
				}
			})

			ajax("installDetails", {
				installId: parseInt(installId),
			} as InstallDetailsReq, (repos: InstallDetailsRes) => installRepoWatch[install.account.id].set(repos))
		}
		this.$content.append($("<div></div>")
			.append($(`<a class="action" target="_blank">Install OctoGuard in more organizations</a>`)
				.attr("href", `https://github.com/apps/${CommonConstants.ghApp.name}/installations/new`)))
		this.useContent()
	}
}
