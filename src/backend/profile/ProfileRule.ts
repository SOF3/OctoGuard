import {db} from "../db/db"
import {ProfileRuleTrigger, ProfileRuleTriggers} from "./ProfileRuleTrigger"
import {ProfileRuleAction, ProfileRuleActions} from "./ProfileRuleAction"
import Join = db.Join

export class ProfileRule implements IProfileRule{
	ruleId: number
	profileId: number
	updated: Date

	triggers: ProfileRuleTrigger[] = []
	actions: ProfileRuleAction[] = []

	static load(where: db.WhereClause, whereArgs: db.WhereArgs, onReady: (rules: StringMap<ProfileRule>) => void, onError: db.ErrorHandler, joins: db.Join[] = []){
		const baseQuery: db.SelectQuery = new db.SelectQuery()
		baseQuery.fields = {
			ruleId: "profile_rule.ruleId",
			profileId: "profile_rule.profileId",
			updated: "profile_rule.updated",
		}
		baseQuery.from = "profile_rule"
		baseQuery.where = where
		baseQuery.whereArgs = whereArgs
		baseQuery.joins = joins
		baseQuery.execute((result: db.ResultSet<DProfileRule>) =>{
			const rules: StringMap<ProfileRule> = {}
			for(let i = 0; i < result.length; ++i){
				const rule = new ProfileRule
				rule.ruleId = result[i].ruleId
				rule.profileId = result[i].profileId
				rule.updated = result[i].updated
				rules[rule.ruleId] = rule
			}

			let remainingTasks = ProfileRuleTriggers.length + ProfileRuleActions.length
			for(let i = 0; i < ProfileRuleTriggers.length; ++i){
				const triggerType = ProfileRuleTriggers[i]
				const triggerQuery = new db.SelectQuery
				triggerQuery.fields = Object.assign({ruleId: "profile_rule.ruleId"}, triggerType.fields)
				triggerQuery.from = triggerType.table
				triggerQuery.joins = [Join.INNER_ON("profile_rule", "ruleId", triggerType.table, "ruleId")]
					.concat(joins)
				triggerQuery.where = where
				triggerQuery.whereArgs = whereArgs
				triggerQuery.execute(triggers =>{
					for(let i = 0; i < triggers.length; ++i){
						const trigger = triggerType.fromRow(triggers[i])
						rules[triggers[i].ruleId as number].triggers.push(trigger)
					}
					if(--remainingTasks <= 0){
						onReady(rules)
					}
				}, onError)
			}
			for(let i = 0; i < ProfileRuleActions.length; ++i){
				const actionType = ProfileRuleActions[i]
				const actionQuery = new db.SelectQuery
				actionQuery.fields = Object.assign({ruleId: "profile_rule.ruleId"}, actionType.fields)
				actionQuery.from = actionType.table
				actionQuery.joins = [Join.INNER_ON("profile_rule", "ruleId", actionType.table, "ruleId")]
					.concat(joins)
				actionQuery.where = where
				actionQuery.whereArgs = whereArgs
				actionQuery.execute(actions =>{
					for(let i = 0; i < actions.length; ++i){
						const action = actionType.fromRow(actions[i])
						rules[actions[i].ruleId as number].actions.push(action)
					}
					if(--remainingTasks <= 0){
						onReady(rules)
					}
				}, onError)
			}
		}, onError)
	}
}
