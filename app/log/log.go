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

package log

import (
	"fmt"
	"github.com/SOF3/OctoGuard/app/secrets"
	"github.com/SOF3/OctoGuard/app/util"
	"log"
	"os"
	"sync"
	"time"
)

var levels = map[string]int{
	"error":   5,
	"warn":    4,
	"info":    3,
	"debug":   2,
	"verbose": 1,
}

type logFile struct {
	level      string
	mutex      sync.Mutex
	currentDay string
	file       *os.File
}

func (f *logFile) getFile() *os.File {
	now := time.Now()
	today := "data/logs/" + now.Format("Jan/") + f.level + "." + now.Format("2") + ".log"
	f.mutex.Lock()
	if f.currentDay != today {
		f.currentDay = today
		f.file = util.MustOpenWrite(today)
	}
	file := f.file
	f.mutex.Unlock()
	return file
}

var logFiles = map[string]*logFile{
	"error":   {level: "error"},
	"warn":    {level: "warn"},
	"info":    {level: "info"},
	"debug":   {level: "debug"},
	"verbose": {level: "verbose"},
}

func write(level string, ref string, message string) {
	go func() {
		file := logFiles[level].getFile()
		line := fmt.Sprintf("%s [%s] %s\n", time.Now().Format("Jan 2 15:04:05.999"), ref, message)
		file.WriteString(line)

		if levels[secrets.Secrets.Log.Stderr] <= levels[level] {
			log.Print(line)
		}
	}()
}
