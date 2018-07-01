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

type UserError struct {
	error string
	// user  bool
}

func ErrorString(err string) UserError {
	return UserError{
		error: err,
	}
}

func ErrorError(err error) UserError {
	return UserError{
		error: err.Error(),
	}
}

// func ErrorString(err string, user bool) UserError {
// 	return UserError{
// 		error: err,
// 		user: user,
// 	}
// }
//
// func ErrorError(err error, user bool) UserError {
// 	return UserError{
// 		error: err.Error(),
// 		user: user,
// 	}
// }

func (e UserError) Error() string {
	return e.error
}

// func (e UserError) User() bool {
// 	return e.user
// }
