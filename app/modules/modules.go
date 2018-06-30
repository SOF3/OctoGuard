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

package modules

import (
	"github.com/SOF3/OctoGuard/app/frontend/api/public-consts"
	"github.com/SOF3/OctoGuard/app/frontend/ctrl/token"
	"github.com/SOF3/OctoGuard/app/frontend/gh/callback"
	"github.com/SOF3/OctoGuard/app/frontend/html/dashboard"
	"github.com/SOF3/OctoGuard/app/frontend/html/homepage"
	"github.com/SOF3/OctoGuard/app/middleware"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"net/http"
	"strings"
)

func Register() {
	fileServer := http.StripPrefix("/res", http.FileServer(http.Dir("res")))
	http.Handle("/res/", middleware.With(func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (err error) {
		if strings.HasSuffix(req.URL.Path, "/") {
			http.NotFound(res, req)
		} else {
			fileServer.ServeHTTP(res, req)
		}
		return nil
	}, middleware.StaticMiddlewares...))

	home := homepage.Handler()
	dash := dashboard.Handler()

	http.Handle("/", middleware.With(func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (err error) {
		if req.URL.Path == "/" {
			if extra.Session.LoggedIn() {
				return dash(req, res, extra)
			} else {
				return home(req, res, extra)
			}
		} else {
			http.NotFound(res, req)
			return nil
		}
	}, middleware.HtmlMiddlewares...))

	http.Handle("/PublicConsts", middleware.With(public_consts.Handler()))
	http.Handle("/gh/callback/auth", middleware.With(callback.Auth(), middleware.CtrlMiddlewares...))

	http.Handle("/token", middleware.With(token.Handler(), middleware.CtrlMiddlewares...))
}
