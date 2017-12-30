class ViewPort{
	static readonly COLUMN_WIDTH = 320

	displaySize: number
	displayedColumnStart: Observable<number> = new Observable()
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

		for(let i = 0; i < this.columns.length - 1; ++i){
			const column = this.columns[i]
			column.reportedValue.observe(newValue =>{
				this.columns[i + 1].updateDependency(newValue)
				this.focusColumn(i + 1)
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
			this.columns[i].onRender()
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
