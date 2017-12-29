import {ProfileRuleAction} from "../ProfileRuleAction"

export class LabelAction implements ProfileRuleAction{
	static table = "action_label"
	static fields = {
		actionId: "actionId",
		name: `${LabelAction.table}.name`,
	}

	type: "label"
	id: number
	name: string

	static fromRow(row: {actionId: number, name: string} & DProfileRule): LabelAction{
		const ret = new LabelAction
		ret.id = row.actionId
		ret.name = row.name
		return ret
	}
}
