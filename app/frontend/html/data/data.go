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

package data

import (
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"github.com/SOF3/OctoGuard/app/secrets"
)

type HomepageData struct {
	Version VersionData
}

type DashboardData struct {
	Version VersionData
	Login   LoginData
}

type VersionData struct {
	Name string
	Hash string
}

type LoginData struct {
	Name   string
	UserId int64
}

func CreateVersionData() VersionData {
	return VersionData{
		Name: secrets.VersionName,
		Hash: secrets.HashVersion[0:7],
	}
}

func CreateLoginData(session extras.Session) LoginData {
	user := session.User()
	return LoginData{
		Name:   *user.Name,
		UserId: *user.ID,
	}
}
