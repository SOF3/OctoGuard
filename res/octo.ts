function ctrl<Output>(path: string, params: {(key: string): any}, onComplete: (data: Output) => void): void{
	$.post("/token", {
		target: path,
	}, (result: TokenOutput) => {
		$.ajax({
			method: "POST",
			url: path,
			headers: {
				"OctoGuard-Ajax-Token": result.Token,
			},
			data: params,
			dataType: "json",
			success: data => onComplete(data),
			error: jqXHR => {
				alert(`Error: ${jqXHR.responseText}`)
			},
		})
	})
}
