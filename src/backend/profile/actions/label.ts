import {ProfileRuleAction} from "../ProfileRuleAction"

export class LabelAction implements ProfileRuleAction{
	static table = "action_label"
	static fields = {
		actionId: "actionId",
		name: `${LabelAction.table}.name`,
	}

	name: string
	actionId: number

	static fromRow(row: {actionId: number, name: string} & DProfileRule): LabelAction{
		const ret = new LabelAction
		ret.name = row.name
		ret.actionId = row.actionId
		return ret
	}
}
