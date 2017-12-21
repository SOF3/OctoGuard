function ajax(path: string, args: {}, success: JQuery.Ajax.SuccessCallback<any>): void{
	if(path.charAt(0) !== "/"){
		path = "/" + path;
	}
	$.post("/ajax/request", {path: path}, token =>{
		$.ajax("/ajax" + path, {
			headers: {
				"X-Ajax-Token": token
			},
			dataType: "json",
			data: JSON.stringify(args),
			method: "POST",
			success: success
		});
	}, "text");
}

$(function(): void{
	$(".action-login").click(function(){
		window.location.assign(`https://github.com/login/oauth/authorize?client_id=${CommonConstants.ghApp.clientId}&state=${CommonConstants.longAjaxToken}`);
	})
});
