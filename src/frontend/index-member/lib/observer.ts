class Observable<T>{
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

	public triggerAll(){
		for(let i = 0; i < this.observers.length; ++i){
			this.observers[i](this.value, this.value)
		}
	}

	public observe(observer: Observer<T>): void{
		if(this.observers.indexOf(observer) !== -1){
			throw "Observer already added"
		}
		this.observers.push(observer)
	}

	public onceNotNull(observer: Observer<T>): void{
		if(this.value !== null){
			observer(this.value, null)
			return
		}
		const wrapper: Observer<T> = (newValue: T | null, oldValue: T | null) =>{
			if(newValue !== null){
				this.removeObserver(wrapper)
				observer(newValue, oldValue)
			}
		}
		this.observe(wrapper)
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
