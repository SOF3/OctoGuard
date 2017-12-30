abstract class Column<R, D>{
	static readonly TOGGLE_DURATION = 300

	name: Message
	placeholder: Message
	reportedValue: Observable<R> = new Observable<R>()
	usingPlaceholder: boolean = true

	$: JQuery
	protected $title: JQuery
	protected $placeholder: JQuery
	protected $content: JQuery

	protected constructor(name: Message, placeholder: Message){
		this.name = name
		this.placeholder = placeholder
		this.$ = $(`<div class="regular-column"></div>`)
			.append(this.$title = $(`<h3 class="column-title"></h3>`).text(this.name.emit()))
			.append(this.$placeholder = $(`<p class="placeholder-text"></p>`).text(this.placeholder.emit()))
			.append(this.$content = $(`<div class="column-content"></div>`))
	}

	onRender(){
		this.$content.css("height", (window.innerHeight - Header.HEIGHT - 40 /* $title height */ - 20 /* twice .regular-column padding */) + "px")
	}

	abstract updateDependency(newValue: D)

	protected togglePlaceholder(): void{
		this.$content.toggle("fold", {}, Column.TOGGLE_DURATION)
		this.$placeholder.toggle("fold", {}, Column.TOGGLE_DURATION)
		this.usingPlaceholder = !this.usingPlaceholder
	}

	protected usePlaceholder(): void{
		if(this.usingPlaceholder){
			return
		}
		this.togglePlaceholder()
	}

	protected useContent(doubleFold: boolean = false): void{
		if(!this.usingPlaceholder){
			if(!doubleFold){
				return
			}
			this.$content.toggle("fold", {}, Column.TOGGLE_DURATION)
			setTimeout(() => this.$content.toggle("fold", {}, Column.TOGGLE_DURATION), Column.TOGGLE_DURATION)
			return
		}
		this.togglePlaceholder()
	}
}

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

class OrgRepo{
	repo: Repository
	org: Installation

	constructor(repo: GitHubAPI.Repository, org: GitHubAPI.Installation){
		this.repo = repo
		this.org = org
	}
}

const installRepoWatch: StringMap<Observable<Repository[]>> = {}
