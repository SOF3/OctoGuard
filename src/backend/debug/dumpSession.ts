export = (req, res) =>{
	res.set("Content-Type", "application/json");
	res.send(JSON.stringify(Object.assign({now: new Date()}, req.session), null, "\t"));
}
