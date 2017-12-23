import {Login} from "./Login"
import {AjaxTokenEntry} from "./ajax/AjaxTokenEntry";

export interface Session{
	queueId: string;
	ajaxTokens?: StringMapping<AjaxTokenEntry>;
	login: Login | undefined;
}
