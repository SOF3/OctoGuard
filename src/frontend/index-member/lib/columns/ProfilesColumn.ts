class ProfilesColumn extends Column<IProfile, Installation | OrgRepo | null>{
	constructor(){
		super(_("Profile List"), _("The profiles owned by the organization will be displayed here."))
	}

	updateDependency(newValue: GitHubAPI.Installation | OrgRepo | null){
		if(newValue === null){
			this.usePlaceholder()
			return
		}

		this.useContent()
		this.$content.empty()
		const install: Installation = newValue instanceof OrgRepo ? newValue.org : newValue

		this.$content.append($(`<h4>Profiles of @</h4>`).append(install.account.login))
		for(const i in install.profiles){
			const profile: IProfile = install.profiles[i]
			const pair = new SpoilerPair(_("Show repos using this profile"))
			pair.spoiler.append(`<p class="placeholder-text">Loading...</p>`)

			const wrapper = $(`<div class="list-item-wrapper"></div>`)
				.append($(`<div class="list-item-header"></div>`)
					.append($(`<p class="list-item-title"></p>`).text(profile.name))
					.append($(`<p class="list-item-detail">Created: </p>`)
						.append($(`<span class="timestamp"></span>`)
							.attr("data-timestamp", profile.created)))
					.append($(`<p class="list-item-detail">Last changed: </p>`)
						.append($(`<span class="timestamp"></span>`)
							.attr("data-timestamp", profile.updated)))
					.append($(`<p class="list-item-detail"></p>`)
						.text({
							public: "Visible to everyone",
							organization: `Only visible to ${install.target_type === "User" ? "yourself" :
								`members of @${install.account.login}`}`,
							collaborator: "Only visible to collaborators of repos using this profile",
						}[profile.visibility]))
					.click(() => this.reportedValue.set(profile)))
				.append(pair.toggle)
				.append(pair.spoiler)
				.appendTo(this.$content)

			installRepoWatch[install.account.id].onceNotNull((repos: Repository[]) =>{
				pair.spoiler.empty()
				for(let j = 0; j < repos.length; ++j){
					const repoProfileId = (repos[j] as (Repository & {profileId: number})).profileId
					if(repoProfileId === profile.profileId || (repoProfileId === -1 && profile.name === CommonConstants.defaultProfileName)){
						pair.spoiler.append($(`<div class="small-list-item"></div>`).text(repos[j].name))
					}
					if(newValue instanceof OrgRepo && newValue.repo.id === repos[j].id){
						this.$content.animate({
							scrollTop: wrapper.offset().top,
						}, 500)
						wrapper.css("background-color", "#b25fff")
						setTimeout(() => wrapper.animate({
							backgroundColor: "#FFFFFF",
						}, 500), 500)
					}
				}
				// TODO highlight selected profile matching OrgRepo.repo, if any
			})
		}
	}
}
