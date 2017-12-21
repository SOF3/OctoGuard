import Secrets = OctoGuard.Secrets;
import {OctoGuard} from "../shared/secrets"

const fs = require("fs");

export let secrets: Secrets;

export function reload(){
	secrets = JSON.parse(fs.readFileSync("secrets/secrets.json"));
}

reload();
