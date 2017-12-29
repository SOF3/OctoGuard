import {Login} from "./Login"
import * as crypto from "crypto"
import {db} from "../../db/db"

export const loginCookies: StringMap<Login> = {}

export function middleware(req, res, next){
	const cont = (cookie: string, newCookie: boolean = false) =>{
		if(loginCookies[cookie] === undefined){
			if(newCookie){
				loginCookies[cookie] = req.login = new Login(cookie)
				next()
				return
			}
			db.select("SELECT user.userId, name, displayName, token, regDate FROM user_session INNER JOIN user ON user.userId = user_session.userId WHERE cookie = ?", [cookie], (result: db.ResultSet<{
				userId: number,
				name: string,
				displayName: string,
				token: string,
				regDate: Date
			}>) =>{
				if(loginCookies[cookie] !== undefined){ // race condition!
					req.login = loginCookies[cookie]
				}else{
					loginCookies[cookie] = req.login = new Login(cookie)
					if(result.length > 0){
						req.login.login(result[0].userId, result[0].name, result[0].displayName, result[0].token, "cookie stored in MySQL")
					}
				}
				next()
			}, error =>{
				db.reportError(error)
				loginCookies[cookie] = req.login = new Login(cookie)
				next()
			})
			return
		}
		const login = req.login = loginCookies[cookie]
		req.login.touch = new Date()
		db.insert_dup("user_session", {
			cookie: cookie,
		}, {
			userId: login.uid,
		}, db.reportError)
		db.update("user", {onlineDate: new Date}, "userId = ?", [login.uid], db.reportError)
		next()
	}

	if(req.cookies.OctoGuardLogin === undefined){
		crypto.randomBytes(20, (err: Error, buf: Buffer) =>{
			const cookie = buf.toString("hex")
			res.cookie("OctoGuardLogin", cookie, {
				secure: false,
				httpOnly: true,
				maxAge: 86400e+3
			})
			cont(cookie, true)
		})
	}else{
		cont(req.cookies.OctoGuardLogin)
	}
}
