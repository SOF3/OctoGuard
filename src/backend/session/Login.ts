export class Login{
	loggedIn: boolean = false;
	uid: number | null;
	name: string | null;
	displayName: string | null;
	token: string | null;

	static login(login: Login, uid: number, name: string, displayName: string, token: string): void{
		login.loggedIn = true;
		login.uid = uid;
		login.name = name;
		login.displayName = displayName;
		login.token = token;
	}
}
