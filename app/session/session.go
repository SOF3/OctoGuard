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
	"context"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"github.com/SOF3/OctoGuard/app/secrets"
	"github.com/SOF3/OctoGuard/app/util"
	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
	"net/http"
	"sync"
	"time"
)

type Session struct {
	mutex    sync.RWMutex
	temp     bool
	loggedIn bool
	user     *github.User
	token    string

	ghClient *github.Client

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

func (s *Session) LoggedIn() (loggedIn bool) {
	s.mutex.RLock()
	loggedIn = s.loggedIn
	s.mutex.RUnlock()
	return
}
func (s *Session) User() (user *github.User) {
	s.mutex.RLock()
	user = s.user
	s.mutex.RUnlock()
	return
}
func (s *Session) Token() (token string) {
	s.mutex.RLock()
	token = s.token
	s.mutex.RUnlock()
	return
}

func (s *Session) Login(token string) (err error) {
	s.mutex.Lock()
	s.ghClient = github.NewClient(oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(&oauth2.Token{
		AccessToken: token,
	})))
	user, _, err := s.ghClient.Users.Get(context.Background(), "")
	if err != nil {
		return
	}

	s.loggedIn = true
	s.user = user
	s.token = token

	s.mutex.Unlock()

	return
}
func (s *Session) GitHubClient() *github.Client {
	return s.ghClient
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
