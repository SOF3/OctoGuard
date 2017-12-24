declare type ProfileVisibility = "public" | "organization" | "collaborator"

declare interface IProfile{
	profileId: number
	owner: number
	name: string
	created: Date
	updated: Date
	visibility: ProfileVisibility
	rules: IProfileRule[]
}

declare interface IProfileRule{
	ruleId: number
	profileId: number
}
