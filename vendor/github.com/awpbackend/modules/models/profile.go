package models

import (
	_ "github.com/go-sql-driver/mysql"
)

type UserPassword struct {
	OldPassword string `json:"oldPassword"`
	Password    string `json:"password"`
}

func ChangeSelfPassword(loginID int, oldpw, pw string) ReturnData {
	db := GetConnection()
	var count int64
	var err error
	u := User{}
	db.Get(&u, "call sp_getUser(?,?)", loginID, loginID)
	if u.ID != 0 {
		oldpwd := EncryptedPassword(oldpw, u.Account)
		pwd := EncryptedPassword(pw, u.Account)
		err = db.Get(&count, "call sp_editSelfPassword(?,?,?)", loginID, oldpwd, pwd)
	}
	returnData := BoxingToResult(count, err)
	return returnData
}
