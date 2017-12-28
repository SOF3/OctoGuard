const x = {} as any
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
		private observers: Observer<T>[] = []

		constructor(initialValue: T | null = null){
			this.set(initialValue)
		}

		public get(): T | null{
			return this.value
		}

		public set(value: T | null): void{
			const oldValue = this.value
			this.value = value
			for(let i = 0; i < this.observers.length; ++i){
				this.observers[i](value, oldValue)
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
		(newValue: T | null, oldValue: T | null): void
	}

	class Header{
		static readonly HEIGHT = 50
	}

	class ViewPort{
		static readonly COLUMN_WIDTH = 320

		displaySize: number
		displayedColumnStart: ObservableValue<number> = new ObservableValue()
		columns: Column<any, any>[]
		useEffects: boolean = false

		render(wrapper: JQuery): void{
			this.displayedColumnStart.observe((newColumn, oldColumn) => this.onColumnChange(oldColumn, newColumn))

			this.displaySize = Math.floor(wrapper.width() / ViewPort.COLUMN_WIDTH)
			const leftButtonWrapper = $(`<div class="body-scroll-button-wrapper"></div>`)
			const leftButton = $(`<div class="body-scroll-button"></div>`).text("<")
			const rightButtonWrapper = leftButtonWrapper.clone()
			const rightButton = leftButton.clone().text(">")

			leftButton.appendTo(leftButtonWrapper).click(() =>{
				if(this.displayedColumnStart.get() > 0){
					this.displayedColumnStart.set(this.displayedColumnStart.get() - 1)
				}
			})
			rightButton.appendTo(rightButtonWrapper).click(() =>{
				if(this.displayedColumnStart.get() + this.displaySize < this.columns.length){
					this.displayedColumnStart.set(this.displayedColumnStart.get() + 1)
				}
			})
			rightButton.appendTo(rightButtonWrapper)


			this.displayedColumnStart.observe(newValue =>{
				if(newValue === 0){
					leftButton.addClass("disabled")
				}else{
					leftButton.removeClass("disabled")
				}
				if(newValue + this.displaySize === this.columns.length){
					rightButton.addClass("disabled")
				}else{
					rightButton.removeClass("disabled")
				}
			})

			for(let i = 0; i < this.columns.length; ++i){
				const column = this.columns[i]
				column.reportedValue.observe(newValue =>{
					this.columns[i + 1].updateDependency(newValue)
				})
				wrapper.append(column.$)
			}
			if(this.columns.length <= this.displaySize){
				leftButton.css("display", "none")
				rightButton.css("display", "none")
			}
			this.displayedColumnStart.set(0)

			for(let i = 0; i < this.displaySize; ++i){
				this.columns[i].$.css("display", "block")
			}

			leftButtonWrapper.prependTo(wrapper)
			rightButtonWrapper.appendTo(wrapper)
		}

		onColumnChange(oldColumn: number, newColumn: number): void{
			const DURATION = 200
			if(oldColumn < newColumn){
				// viewport moves rightward
				for(let i = oldColumn; i < newColumn; ++i){
					this.columns[i].$.hide("slide", {direction: "left"}, DURATION)
				}
				for(let i = oldColumn + this.displaySize; i < newColumn + this.displaySize; ++i){
					this.columns[i].$.show("slide", {direction: "right"}, DURATION)
				}
			}else{
				// newColumn < oldColumn, viewport moves leftward
				for(let i = newColumn; i < oldColumn; ++i){
					this.columns[i].$.show("slide", {direction: "left"}, DURATION)
				}
				for(let i = newColumn + this.displaySize; i < oldColumn + this.displaySize; ++i){
					this.columns[i].$.hide("slide", {direction: "right"}, DURATION)
				}
			}
		}

		focusColumn(column: number): void{
			if(this.displayedColumnStart.get() > column){
				this.displayedColumnStart.set(column)
			}else if(this.displayedColumnStart.get() + this.displaySize <= column){
				this.displayedColumnStart.set(column - this.displaySize + 1)
			}
		}
	}

	abstract class Column<R, D>{
		name: Message
		placeholder: Message
		reportedValue: ObservableValue<R> = new ObservableValue<R>()
		usingPlaceholder: boolean = true

		$: JQuery
		protected $placeholder: JQuery
		protected $content: JQuery

		protected constructor(name: Message, placeholder: Message){
			this.name = name
			this.placeholder = placeholder
			this.$ = $(`<div class="regular-column"></div>`)
				.append($(`<h3 class="column-title"></h3>`).text(this.name.emit()))
				.append(this.$placeholder = $(`<p class="column-placeholder"></p>`).text(this.placeholder.emit()))
				.append(this.$content = $(`<div class="column-content"></div>`))
		}

		abstract updateDependency(newValue: D)

		protected togglePlaceholder(): void{
			const DURATION = 300
			this.$content.toggle("fold", {}, DURATION)
			this.$placeholder.toggle("fold", {}, DURATION)
			this.usingPlaceholder = !this.usingPlaceholder
		}

		protected usePlaceholder(): void{
			if(this.usingPlaceholder){
				return
			}
			this.togglePlaceholder()
		}

		protected useContent(): void{
			if(!this.usingPlaceholder){
				return
			}
			this.togglePlaceholder()
		}
	}

	class OrgsColumn extends Column<Installation, StringMap<Installation>>{
		constructor(){
			super(_("Installed orgs and repos"), _("Loading..."))
		}

		updateDependency(installations: StringMap<Installation>){

			this.useContent()
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

	const headWrapper = $("#head-wrapper")
	const bodyWrapper = $("#body-wrapper")

	document.body.style.height = window.innerHeight + "px"

	headWrapper.css("height", `${Header.HEIGHT}px`)
	bodyWrapper.css("height", `${window.innerHeight - Header.HEIGHT}px`)

	const viewPort = x.v = new ViewPort
	const orgsColumn = new OrgsColumn
	const profilesColumn = new ProfilesColumn
	const rulesColumn = new RulesColumn
	const triggersColumn = new TriggersColumn
	viewPort.columns = [orgsColumn, profilesColumn, rulesColumn, triggersColumn]
	viewPort.render(bodyWrapper)


	ajax("listProfiles", <ListProfilesReq> {}, (res: ListProfilesRes) =>{
		orgsColumn.updateDependency(res.installations)
	})
})
