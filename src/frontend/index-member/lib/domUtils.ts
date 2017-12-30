class SpoilerPair{
	displayed: boolean = false
	toggle: JQuery
	spoiler: JQuery

	constructor(show: Message, hide: Message = show){
		this.spoiler = $(`<div class="list-item-spoiler" style="display: none;"></div>`)
		const expand = $(`<a class="action"></a>`).text(show.emit())
			.click(() =>{
				if(this.displayed){
					expand.text(show.emit())
					expand.removeClass("spoiler-displayed")
					this.spoiler.css("display", "none")
				}else{
					expand.text(hide.emit())
					expand.addClass("spoiler-displayed")
					this.spoiler.css("display", "block")
				}
				this.displayed = !this.displayed
			})
		this.toggle = $(`<p class="list-item-spoiler-tag"></p>`)
			.append(expand)
	}
}

function object2select(object: StringMap<Message>) : JQuery<HTMLSelectElement>{
	const select = $("<select></select>") as JQuery<HTMLSelectElement>
	for(const key in object){
		select.append($("<option></option>").attr("value", key).text(object[key].emit()))
	}
	return select
}
