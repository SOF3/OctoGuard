import {ProfileRuleAction} from "../ProfileRuleAction"

export class CommentAction implements ProfileRuleAction{
	static table = "action_label"
	static fields = {
		actionId: "id",
		template: "template",
	}

	type: "label"
	id: number
	template: string

	static fromRow(row: {actionId: number, template: string} & DProfileRule): CommentAction{
		const ret = new CommentAction
		ret.id = row.actionId
		ret.template = row.template
		return ret
	}
}
