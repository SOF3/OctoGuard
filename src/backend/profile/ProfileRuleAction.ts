import {db} from "../db/db"
import {LabelAction} from "./actions/label"
import {LockAction} from "./actions/lock"

export interface ProfileRuleAction{
	actionId: number
}

export interface ProfileRuleActionStatic{
	table: string
	fields: db.FieldList

	fromRow(row: StringMap<CellValue>): ProfileRuleAction
}

declare const ProfileRuleAction: ProfileRuleActionStatic
export const ProfileRuleActions: ProfileRuleActionStatic[] = [
	LabelAction,
	LockAction,
]
