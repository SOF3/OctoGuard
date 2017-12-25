declare type ProfileVisibility = "public" | "organization" | "collaborator"

declare type CellValue = number | Date | Buffer | string

declare interface DProfile extends StringMap<CellValue>{
	profileId: number
	owner: number
	name: string
	created: Date
	updated: Date
	visibility: ProfileVisibility
}

declare interface IProfile{
	profileId: number
	owner: number
	name: string
	created: Date
	updated: Date
	visibility: ProfileVisibility
	rules: IProfileRule[]
}

declare interface DProfileRule extends StringMap<CellValue>{
	ruleId: number
	profileId: number
	updated: Date
	type: string
}

declare interface IProfileRule{
	ruleId: number
	profileId: number
	updated: Date
	type: string
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
