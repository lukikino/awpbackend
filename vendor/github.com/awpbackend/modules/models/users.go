package models

import (
	"crypto/sha512"
	"fmt"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

type User struct {
	ID          int          `db:"id" json:"ID"`
	Account     string       `db:"account" json:"account"`
	Password    string       `json:"password"`
	State       int          `db:"state" json:"state"`
	Permissions []Permission `json:"permissions"`
	CreatedTime string       `db:"created_time" json:"createdTime"`
	UpdateTime  string       `db:"update_time" json:"updateTime"`
	Total       int          `db:"total" json:"total"`
}

type Permission struct {
	ID          int    `db:"id" json:"ID"`
	Active      bool   `db:"active" json:"active"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	CreatedTime string `db:"created_time" json:"createdTime"`
	UpdateTime  string `db:"update_time" json:"updateTime"`
	Total       int    `db:"total" json:"total"`
}

type usersTree struct {
	UserID   int    `db:"user_id" json:"userID"`
	Account  string `db:"account" json:"account"`
	ParentID int    `db:"parent_id" json:"parentID"`
}

//common use
func EncryptedPassword(pwd, pwdMask string) string {
	maskedPwd := make([]byte, 128)
	//use id to genrator mask
	maskSha512 := sha512.New()
	maskSha512.Write([]byte(pwdMask))
	mask := []byte(fmt.Sprintf("%x", maskSha512.Sum(nil)))
	pwdb := []byte(pwd)
	//use mask and pwd do bitwise cal
	for i, el := range pwdb {
		maskedPwd[i] = el & mask[i]
	}

	//sha result string
	sha_512 := sha512.New()
	sha_512.Write(maskedPwd)
	return fmt.Sprintf("%x", sha_512.Sum(nil))
}

func GetUsers(loginID int, admin bool) ReturnData {
	db := GetConnection()
	mm := []User{}
	err := db.Select(&mm, "call sp_getUsers(?,?)", loginID, admin)
	returnData := BoxingToResult(mm, err)
	return returnData
}

func GetUsersTree(loginID int) ReturnData {
	db := GetConnection()
	at := []usersTree{}
	err := db.Select(&at, "call sp_getUsersTree(?)", loginID)
	returnData := BoxingToResult(at, err)
	return returnData
}

func GetUserPermissions(loginID int, id string, admin bool) ReturnData {
	db := GetConnection()
	m := []Permission{}
	err := db.Select(&m, "call sp_getUserPermissions(?,?,?)", loginID, id, admin)
	returnData := BoxingToResult(m, err)
	return returnData
}

func EditUserPermissions(loginID int, data User) ReturnData {
	db := GetConnection()
	var count int64
	var parr []string
	var pstr string
	if len(data.Permissions) > 0 {
		for _, el := range data.Permissions {
			if el.Active {
				parr = append(parr, fmt.Sprintf("%v", el.Name))
			}
		}
		pstr = strings.Join(parr, ",")
	}
	err := db.Get(&count, "call sp_editUserPermissions(?,?,?)", loginID, data.ID, pstr)
	returnData := BoxingToResult(count, err)
	return returnData
}

func ChangeUserPassword(loginID int, id, pw string) ReturnData {
	db := GetConnection()
	var count int64
	var err error
	u := User{}
	db.Get(&u, "call sp_getUser(?,?)", loginID, id)
	if u.ID != 0 {
		pwd := EncryptedPassword(pw, u.Account)
		err = db.Get(&count, "call sp_editUserPassword(?,?,?)", loginID, id, pwd)
	}
	returnData := BoxingToResult(count, err)
	return returnData
}

func ToggleUserActive(loginID int, id string) ReturnData {
	db := GetConnection()
	u := User{}
	err := db.Get(&u, "call sp_editUserActive(?,?)", loginID, id)
	returnData := BoxingToResult(u, err)
	return returnData
}

func AddUser(loginID int, ip string, data User, admin bool) ReturnData {
	db := GetConnection()
	var id int64
	pwd := EncryptedPassword(data.Password, data.Account)
	err := db.Get(&id, "call sp_addUser(?,?,?,?,?)", ip, loginID, data.Account, pwd, admin)
	returnData := BoxingToResult(id, err)
	return returnData
}
