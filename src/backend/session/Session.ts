import {Login} from "./Login"
import {AjaxTokenEntry} from "./ajax/AjaxTokenEntry";

export interface Session{
	ajaxTokens?: StringMapping<AjaxTokenEntry>;
	login: Login | undefined;
}
