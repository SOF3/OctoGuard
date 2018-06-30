/*
 * OctoGuard
 *
 * Copyright (C) 2018 SOFe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require("fs")
const path = require("path")

const secrets = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "secrets", "secrets.json")).toString("UTF-8"))
const EOL = `
`

const defPath = path.join(__dirname, "app", "secrets", "type.go")
const stream = fs.createWriteStream(defPath)
stream.write(`// generated stub from secrets/secrets.json

package secrets

type Type = `)
emitObject(secrets, 1)
stream.write(EOL)
stream.end()

function emitObject(object, indents){
	const type = typeof object
	if(type === "string"){
		stream.write("string")
		return
	}
	if(type === "number"){
		stream.write(Number.isInteger(object) ? "int" : "float64")
		return
	}
	if(type === "boolean"){
		stream.write("bool")
		return
	}
	if(object instanceof Array){
		stream.write("[]")
		emitObject(object[0], indents + 1)
		return
	}

	stream.write("struct {" + EOL)
	for(const key in object){
		if(!object.hasOwnProperty(key)) continue
		stream.write("\t".repeat(indents))
		stream.write(key + " ")
		emitObject(object[key], indents + 1)
		stream.write(EOL)
	}
	stream.write("\t".repeat(indents - 1))
	stream.write("}")
}
