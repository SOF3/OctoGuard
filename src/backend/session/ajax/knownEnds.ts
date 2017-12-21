import {Session} from "../Session";

function _(name: string){
	return require("../../ajax/" + name);
}

export interface AjaxRequestHandler{
	(session: Session, consumer: Consumer<any>): void;
}

export const knownEnds: Mapping<AjaxRequestHandler> = {
	listInstalls: _("listInstalls")
};
