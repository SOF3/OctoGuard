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

package secrets

import (
	"bufio"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"os"
)

var Secrets Type

var Db *sqlx.DB

func Init() {
	err := detectHashVersion()
	if err != nil {
		panic(err)
	}

	file, err := os.Open("data/secrets/secrets.json")
	if err != nil {
		panic(err)
	}
	decoder := json.NewDecoder(bufio.NewReader(file))
	err = decoder.Decode(&Secrets)
	if err != nil {
		panic(err)
	}
	if err = file.Close(); err != nil {
		panic(err)
	}

	Db = sqlx.MustConnect("mysql", fmt.Sprintf("%s:%s@%s(%s:%d)/%s",
		Secrets.MySQL.Username,
		Secrets.MySQL.Password,
		Secrets.MySQL.Protocol,
		Secrets.MySQL.Host,
		Secrets.MySQL.Port,
		Secrets.MySQL.Schema))
}
