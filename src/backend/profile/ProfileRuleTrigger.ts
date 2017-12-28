import {db} from "../db/db"
import {WordFilterTrigger} from "./triggers/word_filter"
import {ThrottleTrigger} from "./triggers/throttle"

export interface ProfileRuleTrigger{
	type: string
	id: number
}

export interface ProfileRuleTriggerStatic{
	table: string
	fields: db.FieldList

	fromRow(row: StringMap<CellValue>): ProfileRuleTrigger
}

declare const ProfileRuleTrigger: ProfileRuleTriggerStatic
export const ProfileRuleTriggers: ProfileRuleTriggerStatic[] = [
	WordFilterTrigger,
	ThrottleTrigger,
]
