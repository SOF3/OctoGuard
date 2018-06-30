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

package public_consts

import (
	"encoding/json"
	"github.com/SOF3/OctoGuard/app/middleware"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"github.com/SOF3/OctoGuard/app/secrets"
	"net/http"
)

func Handler() middleware.RequestHandler {
	return func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (err error) {
		res.Header().Set("Content-Type", "application/javascript")
		consts, err := json.Marshal(secrets.PublicConstants())
		if err != nil {
			return
		}
		_, err = res.Write(append([]byte("var PublicConsts = "), consts...))
		return
	}
}
