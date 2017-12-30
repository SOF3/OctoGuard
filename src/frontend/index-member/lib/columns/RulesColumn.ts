class RulesColumn extends Column<IProfileRule, IProfile | null>{
	constructor(){
		super(_("Edit Profile"), _("Select a profile first."))
	}

	updateDependency(profile: IProfile | null){
		const orgRole = (role: string) => orgs[profile.owner].target_type === "User" ? "yourself" :
			`${role} of @${orgs[profile.owner].account.login}`

		if(profile === null){
			this.usePlaceholder()
			return
		}
		this.useContent()
		this.$content.empty()

		const nameSpan = $("<span></span>").text(profile.name)
		if(profile.name !== CommonConstants.defaultProfileName){
			nameSpan.addClass("item-name-edit")
				.click(function(this: HTMLSpanElement){
					const newName = prompt("Enter a new profile name", profile.name)
					this.innerText = newName
					profile.name = newName
				})
		}

		this.$content.append($(`<div>Profile name: </div>`).append(nameSpan))

		this.$content.append($(`<div>Visibility: </div>`)
			.append(object2select({
				public: _("Everyone can view the profile's settings"),
				organization: _(`Only ${orgRole("members")} can view the profile's settings`),
				collaborator: _("Only collaborators of repos using this profile can view the profile's settings"),
			}).change(function(this: HTMLSelectElement){
				profile.visibility = this.value as ProfileVisibility

			}))
			.append(` (Only ${orgRole("owners")} can edit the profile)`))
	}
}
