import Installation = GitHubAPI.Installation

declare interface ListProfilesReq extends ReqSuper{

}

declare interface ListProfilesRes extends ResSuper{
	installations: StringMapping<Installation>
	profiles: StringMapping<IProfile>
}
