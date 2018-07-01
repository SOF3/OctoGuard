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

package dashboard

import (
	"github.com/SOF3/OctoGuard/app/frontend/html/data"
	"github.com/SOF3/OctoGuard/app/middleware"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"html/template"
	"net/http"
)

func Handler() middleware.RequestHandler {
	view := template.Must(template.New("dashboard.html").ParseFiles("views/dashboard.html"))

	return func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (err error) {
		return view.Execute(res, data.DashboardData{
			Version: data.CreateVersionData(),
			Login:   data.CreateLoginData(extra.Session),
		})
		return
	}
}
