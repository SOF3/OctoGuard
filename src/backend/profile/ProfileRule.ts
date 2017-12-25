import {db} from "../db/db"
import * as coverage from "./coverage"

export abstract class ProfileRule implements IProfileRule{
	ruleId: number
	profileId: number
	updated: Date
	type: string

	protected init(row: DProfileRule): void{
		this.ruleId = row.ruleId
		this.profileId = row.profileId
		this.updated = row.updated
		this.type = row.type
	}
}

export class WordFilterRule extends ProfileRule{
	static ruleType = "WordFilter"

	static table = "rule_word_filter"
	static fields = {
		words: "word_list",
		coverage: "coverage",
	}

	words: string[]
	coverage: coverage.name[]

	static fromRow(row: {words: string, coverage: number} & DProfileRule): ProfileRule{
		const rule = new WordFilterRule
		rule.init(row)
		rule.words = <string[]> JSON.parse(row.words)
		rule.coverage = coverage.parse(row.coverage)
		return rule
	}
}

export class ThrottleRule extends ProfileRule{
	static ruleType = "Throttle"

	static table = "rule_throttle"
	static fields = {}

	max: number;
	period: number;

	static fromRow(row: {max: number, period: number} & DProfileRule): ProfileRule{
		const rule = new ThrottleRule
		rule.init(row)
		rule.max = row.max;
		rule.period = row.period
		return rule
	}
}

export type ProfileRuleImpl = Extends<ProfileRule> & {
	ruleType: string
	table: string
	fields: db.FieldList

	fromRow(row: StringMap<CellValue>): ProfileRule
}

export const ProfileRuleTypes: ProfileRuleImpl[] = [
	WordFilterRule,
	ThrottleRule,
]
