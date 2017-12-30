class RulesColumn extends Column<IProfileRule, IProfile | null>{
	constructor(){
		super(_("Edit Profile"), _("Select a profile first."))
	}

	updateDependency(newValue: IProfile | null){
		// render settings and rules in this profile, or switch back to placeholder
	}
}
