import {Login} from "./Login"
import * as crypto from "crypto"

export const loginCookies = {}

export function middleware(req, res, next){
	const cont = (cookie: string) =>{
		if(loginCookies[cookie] === undefined){
			loginCookies[cookie] = req.login = new Login
			next()
			return
		}
		req.login = loginCookies[cookie]
		req.login.touch = new Date()
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
			cont(cookie)
		})
	}else{
		cont(req.cookies.OctoGuardLogin)
	}
}
