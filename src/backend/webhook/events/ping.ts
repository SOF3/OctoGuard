// According to observation, this event is not triggered.

import * as express from "express"

export = (payload: {
	zen: string,
	hook_id: number,
	hook: {}
}, res: express.Response): void =>{
	res.send("Pong")
}
