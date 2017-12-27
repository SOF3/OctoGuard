$(function(){
	class Message{
		value: string

		emit(...args: string[]): string{
			let ret = this.value
			for(let i = 0; i < args.length; ++i){
				ret = ret.replace(`\${${i}}`, args[i])
			}
			return ret
		}
	}

	function _(message: string){
		const ret = new Message
		ret.value = message
		return ret
	}

	class ObservableValue<T>{
		private value: T | null = null
		private observers: Observer<T>[]

		public set(value: T | null): void{
			this.value = value
			for(let i = 0; i < this.observers.length; ++i){
				this.observers[i](value)
			}
		}

		public observe(observer: Observer<T>): void{
			if(this.observers.indexOf(observer) !== -1){
				throw "Observer already added"
			}
			this.observers.push(observer)
		}

		public removeObserver(observer: Observer<T>): void{
			if(this.observers.indexOf(observer) === -1){
				throw "Observer was not added"
			}
			this.observers.splice(this.observers.indexOf(observer), 1)
		}
	}

	interface Observer<T>{
		(newValue: T | null): void
	}

	class ViewPort{
		static COLUMN_WIDTH = 320

		displaySize: number = Math.floor(window.innerWidth / ViewPort.COLUMN_WIDTH)
		displayedColumnStart: number = 0
		columns: Column<any, any>[]

		render(wrapper: JQuery): void{
			for(let i = 0; i < this.columns.length; ++i){
				const column = this.columns[i]
				column.reportedValue.observe(newValue =>{
					this.columns[i + 1].updateDependency(newValue)
				})
				wrapper.append(column.$)
			}
		}
	}

	abstract class Column<R, D>{
		name: Message
		placeholder: Message
		reportedValue: ObservableValue<R> = new ObservableValue<R>()

		$: JQuery
		protected $placeHolder: JQuery
		protected $content: JQuery

		protected constructor(name: Message, placeholder: Message){
			this.name = name
			this.placeholder = placeholder
			this.$ = $("<div></div>")
				.append($(`<h3 class="column-title"></h3>`).text(this.name.emit()))
				.append(this.$placeHolder = $(`<p class="column-placeholder"></p>`).text(this.placeholder.emit()))
				.append(this.$content = $(`<div class="column-content"></div>`))
		}

		abstract updateDependency(newValue: D)
	}

	class OrgsColumn extends Column<Installation, Installation[]>{
		constructor(){
			super(_("Installed orgs and repos"), _("Loading..."))
		}

		updateDependency(installations: Installation[]){
			// render columns
		}
	}

	class ProfilesColumn extends Column<IProfile, Installation | null>{
		constructor(){
			super(_("Profile List"), _("The profiles owned by the organization will be displayed here."))
		}

		updateDependency(newValue: GitHubAPI.Installation | null){
			// render profiles in this installation, or switch back to placeholder
		}
	}

	class RulesColumn extends Column<IProfileRule, IProfile | null>{
		constructor(){
			super(_("Edit Profile"), _("Select a profile first."))
		}

		updateDependency(newValue: IProfile | null){
			// render settings and rules in this profile, or switch back to placeholder
		}
	}

	class TriggersColumn extends Column<never, IProfileRule | null>{
		constructor(){
			super(_("Edit rule"), _("Select a rule first."))
		}

		updateDependency(newValue: IProfileRule | null){
			// render triggers and actions in this rule, or switch back to placeholder
		}
	}

	const viewPort = new ViewPort
	viewPort.columns = [new OrgsColumn, new ProfilesColumn, new RulesColumn, new TriggersColumn]

	viewPort.render($("#body-wrapper"))
})
