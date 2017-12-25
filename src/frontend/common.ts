function linkify(selector: string, url: string){
	$(selector).attr("href", url)
}

function ajax(path: string, args: ReqSuper, success: JQuery.Ajax.SuccessCallback<any>): void{
	if(path.charAt(0) !== "/"){
		path = "/" + path
	}
	$.post("/ajax/request", {path: path}, token => console.log(token) || $.ajax("/ajax" + path, {
			contentType: "application/json",
			headers: {"X-Ajax-Token": token},
			dataType: "json",
			data: JSON.stringify(args),
			error: jqXHR => alert(`Error ${jqXHR.status}: ${jqXHR.responseText}`),
			method: "POST",
			success: success
		})
		, "text")
}

const ajaxQueue: QueuedAjaxRequest[] = []

class QueuedAjaxRequest{
	path: string
	options: JQuery.AjaxSettings
	completed: boolean = false
	_this = this

	constructor(path: string, options: JQuery.AjaxSettings){
		this.path = path
		this.options = options
	}

	dispatch(): void{
		$.ajax(this.path, this.options)
	}

	onComplete(): void{
		this.completed = true
		console.assert(this === ajaxQueue[0])
		ajaxQueue.shift()
		if(ajaxQueue.length > 0){
			ajaxQueue[0].dispatch()
		}
	}
}

function atomicPost(path: string, args: {}, success: JQuery.Ajax.SuccessCallback<any>, dataType?: string){
	atomicAjax(path, {
		dataType: dataType,
		method: "POST",
		data: args,
		success: success
	})
}

function atomicAjax(path: string, options: JQuery.AjaxSettings){
	const request: QueuedAjaxRequest = new QueuedAjaxRequest(path, options)
	const onComplete: () => void = () => request.onComplete()
	if(options.success){
		if(options.success instanceof Array){
			options.success.unshift(onComplete)
		}else{
			options.success = [onComplete, options.success]
		}
	}else{
		options.success = [onComplete]
	}
	if(options.error){
		if(options.error instanceof Array){
			options.error.unshift(onComplete)
		}else{
			options.error = [onComplete, options.error]
		}
	}else{
		options.error = [onComplete]
	}

	ajaxQueue.push(request)
	if(ajaxQueue.length === 1){
		ajaxQueue[0].dispatch()
	}
}

function login(){
	$.post("/ajax/request", {path: "Special:auth-callback", long: true}, token =>{
		window.location.assign(`https://github.com/login/oauth/authorize?client_id=${CommonConstants.ghApp.clientId}&state=${token}`)
	}, "text")
}

$(function(){
	(function updateTimestamps(){
		const now = new Date
		const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
		const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		$(".timestamp[data-timestamp]").each(function(){
			const $this = $(this)
			const time = <number> $this.data("timestamp")
			const date = new Date(time)
			const timeDiff = Math.abs(now.getTime() - time)
			if(now.getFullYear() !== date.getFullYear()){
				$this.text(`${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`)
				return
			}
			if(timeDiff > 86400e+3 * 7){
				$this.text(`${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
				return
			}
			if(now.getDate() !== date.getDate()){ // within one week, different day
				$this.text(`${WEEKDAYS[date.getDay()]}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
				return
			}
			if(timeDiff > 3600e+3 * 4){
				$this.text(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
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
		setTimeout(updateTimestamps, 1e+3)
	})()

	$("a#action-login").click(login)
})
