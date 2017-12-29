import {db} from "../../db/db"

export class Login{
	loggedIn: boolean = false
	cookie: string
	uid: number | null = null
	name: string | null = null
	displayName: string | null = null
	token: string | null = null
	regDate: Date = null
	touch: Date = new Date

	constructor(cookie: string){
		this.cookie = cookie
	}

	login(uid: number, name: string, displayName: string, token: string, method: string): void{
		this.loggedIn = true
		this.uid = uid
		this.name = name
		this.displayName = displayName
		this.token = token
		this.regDate = new Date

		console.info(`User ${name} logged in by ${method}`)

		db.insert_dup("user", {
			userId: uid,
			regDate: new Date,
		}, {
			name: name,
			displayName: displayName,
			token: token,
			onlineDate: new Date,
		}, db.reportError, () => db.select("SELECT regDate FROM user WHERE userId = ?", [uid], result =>{
			this.regDate = <Date> result[0].regDate
		}, db.reportError))
	}

	logout(){
		this.loggedIn = false
		this.uid = this.name = this.displayName = this.token = this.regDate = this.touch = null
	}
}
