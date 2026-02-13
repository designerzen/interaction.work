
// Dispatched events that each person creates
export const EVENT_EMOTION_CHANGED = "emotion-changed"
export const EVENT_INSTRUMENT_CHANGED = "instrument-changed"
export const EVENT_INSTRUMENT_LOADING = "instrument-loading"
export const EVENT_USER_MODE_CHANGED = "usermode-changed"
export const EVENT_PERSON_BORN = "person-born"
export const EVENT_PERSON_DEAD = "person-dead"

export default class PersonEvent extends CustomEvent{
	
	constructor( type:string, data:object ){
		super( type, { detail: data } )
	} 

	clone():PersonEvent{
		return new PersonEvent( (this as any).type, (this as any).detail )
	}
}