declare type ProfileVisibility = "public" | "organization" | "collaborator"

declare type CellValue = number | Date | Buffer | string

declare interface DProfile extends StringMap<CellValue>{
	profileId: number
	owner: number
	name: string
	created: Date
	updated: Date
	visibility: number
}

declare interface IProfile{
	profileId: number
	owner: number
	name: string
	created: number
	updated: number
	visibility: ProfileVisibility
	rules: IProfileRule[]
}

declare interface DProfileRule extends StringMap<CellValue>{
	ruleId: number
	profileId: number
	updated: Date
}

declare interface IProfileRule{
	ruleId: number
	profileId: number
	updated: Date
	triggers: IProfileRuleTrigger[]
	actions: IProfileRuleAction[]
}

declare interface IProfileRuleTrigger{
	type: string | "word_filter" | "throttle"
	id: number
}
declare interface IProfileRuleAction{
	type: string | "comment" | "label" | "lock"
}

declare interface IProfileRuleCoverage {
	issue_title
	issue_body
	issue_creation
	issue_comment
	pr_title
	pr_body
	pr_creation
	pr_comment
	commit_comment
}
