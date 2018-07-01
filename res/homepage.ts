declare var PublicConsts: PublicConstsType

$(() => {
	function getCookie(name): string | undefined{
		const value = "; " + document.cookie
		const parts = value.split("; " + name + "=")
		if(parts.length == 2){
			return parts.pop().split(";").shift()
		}else{
			return undefined
		}
	}

	$("#HomepageLogin").on("click", () => {
		if(getCookie(PublicConsts.Cookies.Use) !== "true"){
			if(!confirm("By logging in with GitHub, you agree to our privacy policy, including the use of cookies. Continue?")){
				return
			}
		}

		document.cookie = `${PublicConsts.Cookies.Use}=true; expires=Fri, 31 Dec 9999 23:59:59 GMT`

		window.location.assign(`https://github.com/login/oauth/authorize?client_id=${PublicConsts.GitHub.Integration.ClientID}`)
	})
})
