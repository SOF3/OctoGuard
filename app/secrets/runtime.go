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

package secrets

import (
	"github.com/SOF3/OctoGuard/app/util"
	"io/ioutil"
	"strings"
)

const VersionName = "1.0.0"

var HashVersion string

func detectHashVersion() (err error) {
	exists, err := util.DirExists(".git")
	if err != nil {
		return
	}

	if exists {
		var contents []byte
		contents, err = ioutil.ReadFile(".git/HEAD")
		if err != nil {
			return
		}
		HashVersion = strings.TrimSpace(string(contents))
		if len(HashVersion) == 40 {
			return
		}
		if len(HashVersion) >= 5 && HashVersion[0:5] == "ref: " {
			filename := ".git/" + HashVersion[5:]
			exists, err = util.FileExists(filename)
			if err != nil {
				return
			}
			if exists {
				contents, err = ioutil.ReadFile(filename)
				if err != nil {
					return
				}
				HashVersion = strings.TrimSpace(string(contents))
				return
			}
		}
	}
	HashVersion = strings.Repeat("0", 40)
	return
}
