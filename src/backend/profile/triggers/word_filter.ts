import * as coverage from "../coverage"
import {ProfileRuleTrigger} from "../ProfileRuleTrigger"

export class WordFilterTrigger implements ProfileRuleTrigger{
	static table = "trigger_word_filter"
	static fields = {
		triggerId: "id",
		words: "word_list",
		coverage: "coverage",
	}

	type = "word_filter"
	id: number
	words: string[]
	coverage: coverage.name[]

	static fromRow(row: {triggerId: number, words: string, coverage: number} & DProfileRule): WordFilterTrigger{
		const ret = new WordFilterTrigger
		ret.id = row.triggerId
		ret.words = JSON.parse(row.words)
		ret.coverage = coverage.parse(row.coverage)
		return ret
	}
}
