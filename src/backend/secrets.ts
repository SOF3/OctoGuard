import Secrets = OctoGuard.Secrets;

const fs = require("fs");

export let secrets: Secrets;

export function reload(){
	secrets = JSON.parse(fs.readFileSync("secrets/secrets.json"));
}

reload();
