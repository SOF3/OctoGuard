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

package callback

import (
	"fmt"
	"github.com/SOF3/OctoGuard/app/log"
	"github.com/SOF3/OctoGuard/app/middleware"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"github.com/SOF3/OctoGuard/app/secrets"
	"github.com/SOF3/OctoGuard/app/util"
	"io/ioutil"
	"net/http"
	"net/url"
)

func Auth() middleware.RequestHandler {
	return func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (err error) {
		req.ParseForm()
		resp, err := http.PostForm("https://github.com/login/oauth/access_token", url.Values(map[string][]string{
			"client_id":     {secrets.Secrets.GitHub.Integration.ClientID},
			"client_secret": {secrets.Secrets.GitHub.Integration.ClientSecret},
			"code":          req.Form["code"],
		}))
		if err != nil {
			return
		}

		bytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return
		}
		resp.Body.Close()

		tokenResult, err := url.ParseQuery(string(bytes))
		if err != nil {
			return
		}

		token, exists := tokenResult["access_token"]
		if !exists || len(token) == 0 {
			return util.ErrorString("GitHub does not approve this login, try again")
		}

		err = extra.Session.Login(token[0])
		if err != nil {
			return
		}

		log.Info(extra.RequestId, fmt.Sprintf("%s (#%d) logged in", *extra.Session.User().Name, *extra.Session.User().ID))

		http.Redirect(res, req, "/", 302)

		return
	}
}
