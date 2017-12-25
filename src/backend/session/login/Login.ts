import * as db from "../../db/db"

export class Login{
	loggedIn: boolean = false
	uid: number | null
	name: string | null
	displayName: string | null
	token: string | null
	regDate: Date
	touch: Date = new Date

	login(uid: number, name: string, displayName: string, token: string): void{
		this.loggedIn = true
		this.uid = uid
		this.name = name
		this.displayName = displayName
		this.token = token
		this.regDate = new Date

		db.keyInsert("user", {
			uid: uid,
			regDate: new Date,
		}, {
			name: name,
			onlineDate: new Date,
		}, db.reportError)
		db.select("SELECT regDate FROM user WHERE uid = ?", [uid], result =>{
			this.regDate = <Date> result[0].regDate
		}, db.reportError)
	}
}
