export class Profile implements IProfile{
	static DEFAULT_NAME = "Default Profile"

	profileId: number
	owner: number
	name: string
	created: Date
	updated: Date
	visibility: ProfileVisibility
	rules: IProfileRule[]

	static defaultProfile(ownerUid: number, regDate: Date): Profile{
		const p = new Profile
		p.profileId = -1
		p.owner = ownerUid
		p.name = Profile.DEFAULT_NAME
		p.created = regDate
		p.updated = regDate
		return p
	}

	static visibility_num2str(number: number): ProfileVisibility{
		switch(number){
			case 0:
				return "public"
			case 1:
				return "organization"
			case 2:
				return "collaborator"
		}
		throw "Invalid visibility"
	}

	static visibility_str2num(string: ProfileVisibility): number{
		switch(string){
			case "public":
				return 0
			case "organization":
				return 1
			case "collaborator":
				return 2
		}
		throw "Invalid visibility"
	}
}
