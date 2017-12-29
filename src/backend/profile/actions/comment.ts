import {ProfileRuleAction} from "../ProfileRuleAction"

export class CommentAction implements ProfileRuleAction{
	static table = "action_comment"
	static fields = {
		actionId: "actionId",
		template: "template",
	}

	type: "comment"
	id: number
	template: string

	static fromRow(row: {actionId: number, template: string} & DProfileRule): CommentAction{
		const ret = new CommentAction
		ret.id = row.actionId
		ret.template = row.template
		return ret
	}
}
