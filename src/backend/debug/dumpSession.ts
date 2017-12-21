export = (req, res) =>{
	res.set("Content-Type", "application/json");
	res.send(JSON.stringify(req.session, null, "\t"));
}
