import {db} from "../db/db"
import {LabelAction} from "./actions/label"
import {LockAction} from "./actions/lock"
import {CommentAction} from "./actions/comment"

export interface ProfileRuleAction{
	type: string
	id: number
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
	CommentAction,
]
