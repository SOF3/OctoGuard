import * as db from "../db/db"

export class Login{
	loggedIn: boolean = false
	uid: number | null
	name: string | null
	displayName: string | null
	token: string | null
	regDate: Date

	static login(login: Login, uid: number, name: string, displayName: string, token: string): void{
		login.loggedIn = true
		login.uid = uid
		login.name = name
		login.displayName = displayName
		login.token = token
		login.regDate = new Date()

		db.keyInsert("user", {
			uid: uid,
			regDate: new Date,
		}, {
			name: name,
			onlineDate: new Date,
		}, db.reportError)
		db.select("SELECT regDate FROM user WHERE uid = ?", [uid], result =>{
			login.regDate = <Date> result[0].regDate
		}, db.reportError)
	}
}
