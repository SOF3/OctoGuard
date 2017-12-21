import {Login} from "./Login"

export interface Session{
	ajaxTokens: Object | undefined;
	login: Login | undefined;
}
