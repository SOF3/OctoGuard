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
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"github.com/SOF3/OctoGuard/app/log"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
)

var logMiddleware = func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (cont bool, err error) {
	ray := req.Header.Get("cf-ray")
	if ray != "" {
		md5Sum := md5.Sum([]byte(ray))
		extra.RequestId = hex.EncodeToString(md5Sum[:8]) + "-" + ray
	} else {
		extra.RequestId = strconv.FormatUint(rand.Uint64(), 10)
		if len(extra.RequestId) < 16 {
			extra.RequestId = strings.Repeat("0", 16-len(extra.RequestId)) + extra.RequestId
		} else {
			extra.RequestId = extra.RequestId[:16]
		}
	}

	log.Verbose(extra.RequestId, fmt.Sprintf("%s: %s %s", req.RemoteAddr, req.Method, req.URL.Path))
	return true, nil
}
