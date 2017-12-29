import {ProfileRuleAction} from "../ProfileRuleAction"

export class LockAction implements ProfileRuleAction{
	static table = "action_lock"
	static fields = {
		actionId: "actionId",
		duration: "duration",
	}

	id: number
	type = "lock"
	duration: number

	static fromRow(row: {actionId: number, duration: number} & DProfileRule): LockAction{
		const ret = new LockAction
		ret.id = row.actionId
		ret.duration = row.duration
		return ret
	}
}
