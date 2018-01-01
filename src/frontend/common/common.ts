function linkify(selector: string, url: string){
	$(selector).attr("href", url)
}

const nop: () => void = () => void 0

function ajax<Q extends ReqSuper, S extends ResSuper>(path: string, args: Q = {} as Q, success: JQuery.Ajax.SuccessCallback<any> & ((res: S) => void) = nop): void{
	if(path.charAt(0) !== "/"){
		path = "/" + path
	}
	$.post("/ajax/request", {path: path}, token => $.ajax("/ajax" + path, {
			contentType: "application/json",
			headers: {"X-Ajax-Token": token},
			dataType: "json",
			data: JSON.stringify(args),
			error: jqXHR =>{
				if(jqXHR.status !== 0){
					alert(`Error ${jqXHR.status}: ${jqXHR.responseText}`)
				}else{
					console.log(jqXHR)
				}
			},
			method: "POST",
			success: success
		})
		, "text")
}

function login(){
	$.post("/ajax/request", {path: "Special:auth-callback", long: true}, token =>{
		window.location.assign(`https://github.com/login/oauth/authorize?client_id=${CommonConstants.ghApp.clientId}&state=${token}`)
	}, "text")
}

$(function(){
	setInterval(() =>{
		const now = new Date
		const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
		const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		$(".timestamp[data-timestamp]").each(function(){
			const $this = $(this)
			const time = parseInt($this.attr("data-timestamp"))
			const date = new Date(time)
			const timeDiff = Math.abs(now.getTime() - time)
			const hours: string = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours().toString()
			const minutes: string = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes().toString()
			const seconds: string = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds().toString()
			if(now.getFullYear() !== date.getFullYear()){
				$this.text(`${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`)
				return
			}
			if(timeDiff > 86400e+3 * 7){
				$this.text(`${MONTHS[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}:${seconds}`)
				return
			}
			if(now.getDate() !== date.getDate()){ // within one week, different day
				$this.text(`${WEEKDAYS[date.getDay()]}, ${hours}:${minutes}:${seconds}`)
				return
			}
			if(timeDiff > 3600e+3 * 4){
				$this.text(`${hours}:${minutes}:${seconds}`)
				return
			}
			let text = ""
			if(timeDiff >= 3600e+3){
				text = `${Math.floor(timeDiff / 3600e+3)} hours `
			}else if(timeDiff >= 60e+3){
				text = `${Math.floor(timeDiff / 60e+3)} minutes `
			}else{
				text = `${Math.floor(timeDiff / 1e+3)} seconds `
			}
			$this.text(text + (now.getTime() > time ? "ago" : "later"))
		})
	}, 1e+3)

	linkify("a#install-add", `https://github.com/apps/${CommonConstants.ghApp.name}/installations/new`)
	$("a#action-login").click(login)
	$("a#action-logout").click(() => ajax("logout"))
})
