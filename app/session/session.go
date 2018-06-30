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

package session

import (
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"github.com/SOF3/OctoGuard/app/secrets"
	"github.com/SOF3/OctoGuard/app/util"
	"net/http"
	"sync"
	"time"
)

type Session struct {
	mutex    sync.RWMutex
	temp     bool
	loggedIn bool
	userName string
	userID   uint
	token    string

	ajax *util.ExpiringSyncMap
}

func newSession() *Session {
	s := new(Session)

	s.ajax = util.NewExpiringSyncMap(time.Duration(secrets.Secrets.HTTP.Timeout.Ajax) * time.Millisecond)

	return s
}

func (s *Session) Temp() bool {
	return s.temp
}

func (s *Session) LoggedIn() bool {
	s.mutex.RLock()
	val := s.loggedIn
	s.mutex.RUnlock()
	return val
}
func (s *Session) UserName() string {
	s.mutex.RLock()
	val := s.userName
	s.mutex.RUnlock()
	return val
}
func (s *Session) UserID() uint {
	s.mutex.RLock()
	val := s.userID
	s.mutex.RUnlock()
	return val
}
func (s *Session) Token() string {
	s.mutex.RLock()
	val := s.token
	s.mutex.RUnlock()
	return val
}
func (s *Session) AjaxPrepare(target string) (token string, err error) {
	for {
		token, err = util.CryptoSecureRandomString([]rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 20)
		if err != nil {
			return
		}

		success := s.ajax.Set(token, target, false)
		if !success {
			continue
		}

		return
	}
}
func (s *Session) AjaxConsume(token string, target string) bool {
	value, exists := s.ajax.Delete(token)
	if !exists {
		return false
	}
	return value.(string) == target
}

var sessionMap *util.ExpiringSyncMap

func Init() {
	sessionMap = util.NewExpiringSyncMap(time.Duration(secrets.Secrets.HTTP.Timeout.Session) * time.Millisecond)
}

func GetCreateSession(req *http.Request, res http.ResponseWriter) (extras.Session, error) {
	cookieObject, err := req.Cookie(secrets.Secrets.HTTP.Cookies.Session)
	if err != nil && err != http.ErrNoCookie {
		return nil, err
	}

	if cookieObject != nil {
		cookie := cookieObject.Value
		session, exists := sessionMap.GetExists(cookie)
		if exists {
			return session.(*Session), nil
		}
	}

	cookieObject, err = req.Cookie(secrets.Secrets.HTTP.Cookies.Use)
	if err != nil && err != http.ErrNoCookie {
		return nil, err
	}
	sendCookies := err != http.ErrNoCookie && cookieObject != nil && cookieObject.Value == "true"

	newSession := newSession()

	if !sendCookies {
		newSession.temp = true
		return newSession, nil
	}

	for {
		cookie, err := util.CryptoSecureRandomString([]rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 20)
		if err != nil {
			return nil, err
		}

		success := sessionMap.Set(cookie, newSession, false)
		if !success {
			continue
		}

		cookieObject = &http.Cookie{
			Name:     secrets.Secrets.HTTP.Cookies.Session,
			Path:     "/",
			Value:    cookie,
			HttpOnly: true,
			Secure:   secrets.Secrets.HTTP.Secure,
			MaxAge:   secrets.Secrets.HTTP.Timeout.Session,
		}
		http.SetCookie(res, cookieObject)

		return newSession, nil
	}
}
