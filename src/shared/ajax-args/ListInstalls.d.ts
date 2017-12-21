import Installation = GitHubAPI.Installation;

declare interface ListInstallsReq extends ReqSuper{

}

declare interface ListInstallsRes extends ResSuper{
	[installationId: string]: Installation;
}
