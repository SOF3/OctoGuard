declare interface EditProfileReq extends ReqSuper{
	profileId: number
	name?: string
	visibility ?: ProfileVisibility
}

declare interface EditProfileRes extends ResSuper{

}
