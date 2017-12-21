const fs = require("fs");
const path = require("path");

const secrets = JSON.parse(fs.readFileSync(path.join(__dirname, "../secrets/secrets.json")).toString("UTF-8"));
const EOL = `
`;

const defPath = path.join(__dirname, "..", "src", "shared", "secrets.d.ts");
const stream = fs.createWriteStream(defPath);
stream.write(`export namespace OctoGuard{
	interface Secrets`);
emitObject(secrets, 2);
stream.write(EOL + "}" + EOL);
stream.end();

function emitObject(object, indents){
	const type = typeof object;
	if(type === "string" || type === "number" || type === "boolean"){
		stream.write(type);
		return;
	}
	if(object.constructor === Array){
		emitObject(object[0], indents + 1);
		stream.write("[]");
		return;
	}

	stream.write("{" + EOL);
	for(const key in object){
		if(!object.hasOwnProperty(key)) continue;
		stream.write("\t".repeat(indents));
		stream.write(key + ": ");
		emitObject(object[key], indents + 1);
		stream.write(EOL);
	}
	stream.write("\t".repeat(indents - 1));
	stream.write("}");
}
