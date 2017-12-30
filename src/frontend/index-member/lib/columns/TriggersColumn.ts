class TriggersColumn extends Column<never, IProfileRule | null>{
	constructor(){
		super(_("Edit rule"), _("Select a rule first."))
	}

	updateDependency(newValue: IProfileRule | null){
		// render triggers and actions in this rule, or switch back to placeholder
	}
}
