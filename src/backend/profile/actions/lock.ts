import {ProfileRuleAction} from "../ProfileRuleAction"

export class LockAction implements ProfileRuleAction{
	static table = "action_lock"
	static fields = {
		actionId: "id",
		duration: "duration",
	}

	type = "lock"
	id: number
	duration: number

	static fromRow(row: {actionId: number, duration: number} & DProfileRule): LockAction{
		const ret = new LockAction
		ret.id = row.actionId
		ret.duration = row.duration
		return ret
	}
}
