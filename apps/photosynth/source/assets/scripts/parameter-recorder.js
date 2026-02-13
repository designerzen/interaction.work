// Ok, here's a fun one...
// RECORD Vars just save it and it will record the time
export class ParamaterRecorder{

	#audioContext:BaseAudioContext

	get now(){
		return this.#audioContext.currentTime
	}
	get recording(){
		return this.parameters
	}
	get isActive(){
		return this.isRecording
	}

	constructor( audioContext, options={} ) {
		this.#audioContext = audioContext
		this.isRecording = false
		this.parameters
		this.startTime = this.now()
		this.reset()
	}

	reset(){
		this.parameters = new Map()
	}

	add( values, time ){
		time = time ?? this.now()
		if (!this.isRecording)
		{
			this.startTime = time
			this.isRecording = true
		}
		// save whatever you want innit
		const elapsed = Math.floor(time - this.startTime)
		this.parameters.set(elapsed, values)
	}

	getValuesAtTime(time){
		return this.parameters[time]
	}

	export(){
		const data = {}
		this.parameters.forEach((value,key)=>data[key] = value )
		return JSON.stringify( data )
	}
}