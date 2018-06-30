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

package middleware

import (
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"net/http"
)

type RequestHandler = func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (err error)

type Middleware = func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (cont bool, err error)

type middlewareHandler struct {
	handler     RequestHandler
	middlewares []Middleware
}

func (h *middlewareHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	extra := extras.NewExtra()
	var err error = nil
	for _, middleware := range h.middlewares {
		var cont bool
		cont, err = middleware(r, w, extra)
		if err != nil {
			break
		}
		if !cont {
			return
		}
	}

	if err == nil {
		err = h.handler(r, w, extra)
	}

	if err != nil {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(500)
		w.Write([]byte("500 Internal Server Error"))
	}
}

func With(handler RequestHandler, middlewares ...Middleware) http.Handler {
	return &middlewareHandler{
		middlewares: middlewares,
		handler:     handler,
	}
}

var StaticMiddlewares = []Middleware{
	logMiddleware,
}
var HtmlMiddlewares = []Middleware{
	logMiddleware,
	sessionMiddleware,
}
var CtrlMiddlewares = []Middleware{
	logMiddleware,
	sessionMiddleware,
}
