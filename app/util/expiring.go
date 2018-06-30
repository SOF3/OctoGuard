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

package util

import (
	"sync"
	"time"
)

type ExpiringSyncMap struct {
	mutex      sync.RWMutex
	entries    map[string]entry
	expireTime time.Duration
}

func NewExpiringSyncMap(expireTime time.Duration) *ExpiringSyncMap {
	return &ExpiringSyncMap{
		entries:    make(map[string]entry),
		expireTime: expireTime,
	}
}

type entry struct {
	expiry time.Time
	value  interface{}
}

func (m *ExpiringSyncMap) Exists(key string) (exists bool) {
	m.mutex.RLock()
	_, exists = m.entries[key]
	m.mutex.RUnlock()
	return
}

func (m *ExpiringSyncMap) Delete(key string) (value interface{}, exists bool) {
	m.mutex.Lock()
	value, exists = m.entries[key]
	if exists {
		delete(m.entries, key)
	}
	m.mutex.Unlock()
	return
}

func (m *ExpiringSyncMap) Get(key string) interface{} {
	m.mutex.RLock()
	ret, exists := m.entries[key]
	m.mutex.RUnlock()
	if exists && ret.expiry.After(time.Now()) {
		return ret.value
	}
	// we don't need to expire it, because it is not important to release memory if we aren't appending.
	return nil
}

func (m *ExpiringSyncMap) GetExists(key string) (interface{}, bool) {
	m.mutex.RLock()
	ret, exists := m.entries[key]
	m.mutex.RUnlock()
	if exists && ret.expiry.After(time.Now()) {
		return ret.value, true
	}
	// we don't need to expire it, because it is not important to release memory if we aren't appending.
	return nil, false
}

func (m *ExpiringSyncMap) Set(key string, value interface{}, overwrite bool) bool {
	// shared lock for reading expiry dates of all entries (slow)
	deletions := make([]string, 0)
	m.mutex.RLock()
	for k, e := range m.entries {
		if !e.expiry.After(time.Now()) {
			deletions = append(deletions, k)
		}
	}
	m.mutex.RUnlock()

	m.mutex.Lock()
	// exclusive lock for reading expiry dates
	if len(deletions) > 0 {
		for _, k := range deletions {
			e, exists := m.entries[k]
			if exists && !e.expiry.After(time.Now()) {
				// check expiry again in case something happened between m.mutex.RUnlock() and m.mutex.Lock()
				delete(m.entries, k)
			}
		}
	}

	// finally, fill the value
	if !overwrite {
		if _, exists := m.entries[key]; exists {
			m.mutex.Unlock()
			return false
		}
	}

	m.entries[key] = entry{
		expiry: time.Now().Add(m.expireTime),
		value:  value,
	}
	m.mutex.Unlock()
	return true
}
