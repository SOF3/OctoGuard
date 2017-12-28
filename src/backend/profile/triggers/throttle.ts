import {ProfileRuleTrigger} from "../ProfileRuleTrigger"
import * as coverage from "../coverage"

export class ThrottleTrigger implements ProfileRuleTrigger{
	static table = "trigger_throttle"
	static fields = {
		max: "max",
		period: "period",
		coverage: "coverage",
		triggerId: "id",
	}

	type = "throttle"
	id: number
	max: number
	period: number
	coverage: coverage.name[]

	static fromRow(row: {triggerId: number, max: number, period: number, coverage: number} & DProfileRule): ThrottleTrigger{
		const ret = new ThrottleTrigger
		ret.id = row.triggerId
		ret.max = row.max
		ret.period = row.period
		ret.coverage = coverage.parse(row.coverage)
		return ret
	}
}
