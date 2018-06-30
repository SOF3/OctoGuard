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

package ctrl

import (
	"encoding/json"
	"errors"
	"github.com/SOF3/OctoGuard/app/middleware"
	"github.com/SOF3/OctoGuard/app/middleware/extras"
	"github.com/SOF3/OctoGuard/app/util"
	"net/http"
	"reflect"
	"strconv"
	"strings"
)

type AjaxHandler = func(req *http.Request, extra *extras.RequestExtra, params_ interface{}, res http.ResponseWriter) (statusCode int, ret interface{}, err error)

type requiredField struct {
	name         string
	fieldType    reflect.Type
	array        bool
	defaultValue reflect.Value
	optional     bool
}

func stringToType(kind reflect.Kind, v reflect.Value, s string) (err error) {
	bitSize := 0
	switch kind {
	case reflect.String:
		v.SetString(s)
	case reflect.Int8:
		bitSize = 8
		fallthrough
	case reflect.Int16:
		if bitSize == 0 {
			bitSize = 16
		}
		fallthrough
	case reflect.Int32:
		if bitSize == 0 {
			bitSize = 32
		}
		fallthrough
	case reflect.Int64:
		fallthrough
	case reflect.Int:
		if bitSize == 0 {
			bitSize = 64
		}
		var i int64
		i, err = strconv.ParseInt(s, 10, 64)
		if err != nil {
			return
		}
		v.SetInt(i)

	case reflect.Uint8:
		bitSize = 8
		fallthrough
	case reflect.Uint16:
		if bitSize == 0 {
			bitSize = 16
		}
		fallthrough
	case reflect.Uint32:
		if bitSize == 0 {
			bitSize = 32
		}
		fallthrough
	case reflect.Uint64:
		fallthrough
	case reflect.Uint:
		if bitSize == 0 {
			bitSize = 64
		}
		var i uint64
		i, err = strconv.ParseUint(s, 10, bitSize)
		if err != nil {
			return
		}
		v.SetUint(i)
	case reflect.Float32:
		bitSize = 32
		fallthrough
	case reflect.Float64:
		if bitSize == 0 {
			bitSize = 64
		}
		var f float64
		f, err = strconv.ParseFloat(s, bitSize)
		if err != nil {
			return
		}
		v.SetFloat(f)
	case reflect.Bool:
		if strings.EqualFold(s, "true") ||
			strings.EqualFold(s, "t") ||
			strings.EqualFold(s, "yes") ||
			strings.EqualFold(s, "y") ||
			strings.EqualFold(s, "on") ||
			strings.EqualFold(s, "1") {
			v.SetBool(true)
			break
		}
		if strings.EqualFold(s, "false") ||
			strings.EqualFold(s, "f") ||
			strings.EqualFold(s, "no") ||
			strings.EqualFold(s, "n") ||
			strings.EqualFold(s, "off") ||
			strings.EqualFold(s, "0") {
			v.SetBool(false)
			break
		}
		return errors.New("unknown boolean value " + s)
	default:
		panic(errors.New("unknown kind " + kind.String()))
	}

	return nil
}

func Ajax(input interface{}, handler AjaxHandler, needToken bool, needLogin bool) middleware.RequestHandler {
	t, fields := fieldsFromStruct(input)

	return func(req *http.Request, res http.ResponseWriter, extra *extras.RequestExtra) (err error) {
		if req.Method != "POST" {
			errRes(res, 405, "Method not allowed. Only POST is accepted.")
			return
		}

		if err = req.ParseForm(); err != nil {
			errRes(res, 400, "Bad request. Error parsing POST form.")
			return
		}

		if needLogin && !extra.Session.LoggedIn() {
			errRes(res, 401, "Access denied. Please login first. Session may have expired; try refreshing the page.")
			return
		}
		if needToken {
			token, exists := req.Header["OctoGuard-Ajax-Token"]
			if !exists || len(token) == 0 {
				errRes(res, 400, `Bad request. The header "OctoGuard-Ajax-Token" is required.`)
				return
			}
			exists = extra.Session.AjaxConsume(token[0], req.URL.Path)
			if !exists {
				errRes(res, 401, "Access denied. Ajax token is invalid.")
				return
			}
		}

		params := reflect.New(t)
		for i, field := range fields {
			param, exists := req.PostForm[field.name]
			if !exists || len(param) == 0 { // missing
				if !field.optional { // required
					errRes(res, 400, "Bad request. The parameter "+field.name+" is required but missing.")
					return
				}

				if field.array {
					params.Field(i).Set(reflect.MakeSlice(field.fieldType, 0, 0))
				} else {
					params.Field(i).Set(field.defaultValue)
				}
				continue
			}

			if field.array {
				slice := reflect.MakeSlice(field.fieldType, len(param), len(param))
				for j := 0; j < len(param); j++ {
					ptr := slice.Index(j)
					err = stringToType(field.fieldType.Elem().Kind(), ptr, param[j])
					if err != nil {
						return
					}
				}
				params.Field(i).Set(slice)
			} else {
				err = stringToType(field.fieldType.Kind(), params.Elem().Field(i), param[0])
				if err != nil {
					return
				}
			}
		}

		code, ret, err := handler(req, extra, params.Elem().Interface(), res)
		if err != nil {
			return
		}
		res.WriteHeader(code)
		encoder := json.NewEncoder(res)
		encoder.SetIndent("\r\n", "\t")
		err = encoder.Encode(ret)
		return
	}
}

func fieldsFromStruct(input interface{}) (t reflect.Type, fields []requiredField) {
	t = reflect.TypeOf(input)
	if t.Kind() != reflect.Struct {
		panic(errors.New("input should be a direct struct"))
	}
	v := reflect.ValueOf(input)

	fields = make([]requiredField, t.NumField())
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		rf := requiredField{
			name:      util.CamelToSnakeCase(field.Name, "-"),
			fieldType: field.Type,
		}

		kind := field.Type.Kind()
		if kind == reflect.Slice {
			rf.array = true
			rf.optional = true
			kind = field.Type.Elem().Kind()
		}
		if kind != reflect.String &&
			kind != reflect.Int &&
			kind != reflect.Int8 &&
			kind != reflect.Int16 &&
			kind != reflect.Int32 &&
			kind != reflect.Int64 &&
			kind != reflect.Uint &&
			kind != reflect.Uint8 &&
			kind != reflect.Uint16 &&
			kind != reflect.Uint32 &&
			kind != reflect.Uint64 &&
			kind != reflect.Float32 &&
			kind != reflect.Float64 &&
			kind != reflect.Bool {
			panic(errors.New("unsupported kind " + kind.String() + " in field " + field.Name))
		}

		if value, ok := field.Tag.Lookup("name"); ok {
			rf.name = value
		}
		if _, ok := field.Tag.Lookup("optional"); ok {
			rf.optional = true
			rf.defaultValue = v.Field(i)
		}
		fields[i] = rf
	}

	return
}

func errRes(res http.ResponseWriter, statusCode int, err string) {
	res.Header().Set("Content-Type", "text/plain")
	res.WriteHeader(statusCode)
	res.Write([]byte(err))
}
