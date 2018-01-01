import Repository = GitHubAPI.Repository

declare interface InstallDetailsReq extends ReqSuper{
	installId: number
}

declare interface InstallDetailsRes extends ResSuper, Array<Repository & {profileId: number}>{
}
