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

package token

import (
	"github.com/SOF3/OctoGuard/app/frontend/ctrl"
	"github.com/SOF3/OctoGuard/app/middleware"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"net/http"
)

type params struct {
	Target string
}
type output struct {
	Token string
}

func Handler() middleware.RequestHandler {
	return ctrl.Ajax(params{}, func(req *http.Request, extra *extras.RequestExtra, params_ interface{}, res http.ResponseWriter) (statusCode int, ret interface{}, err error) {
		params := params_.(params)
		token, err := extra.Session.AjaxPrepare(params.Target)
		if err != nil {
			return
		}

		return 201, output{
			Token: token,
		}, nil
	}, false, false)
}
