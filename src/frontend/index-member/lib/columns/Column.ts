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

class OrgRepo{
	repo: Repository
	org: Installation

	constructor(repo: GitHubAPI.Repository, org: GitHubAPI.Installation){
		this.repo = repo
		this.org = org
	}
}

const installRepoWatch: StringMap<Observable<Repository[]>> = {}
