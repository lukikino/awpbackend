package models

import (
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/awpbackend/modules/common"

	con "github.com/gernest/utron/config"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	cache "github.com/patrickmn/go-cache"
)

const TimeZone = 8

// const DatetimeFormat = "2006/01/02 15:04:05"
const DatetimeFormat = "2006-01-02 15:04:05"

var Ch = cache.New(5*time.Minute, 30*time.Second)
var db *sqlx.DB

type LoginStatus struct {
	ID                int                    `db:"id" json:"ID,omitempty"`
	Account           string                 `db:"account" json:"account,omitempty"`
	Permissions       *[]Permission          `db:"permissions" json:"-"`
	ClientPermissions *common.PermissionEnum `json:"permissions,omitempty"`
	CreatedTime       string                 `db:"created_time" json:"createdTime,omitempty"`
}

type ListUsers struct {
	UserID  int    `db:"id" json:"userID"`
	Account string `db:"account" json:"account"`
}

type ListMachines struct {
	ID          int    `db:"id" json:"ID"`
	StoreName   string `db:"store_name" json:"storeName"`
	MachineName string `db:"machine_name" json:"machineName"`
	PCBID       string `db:"pcb_id" json:"pcbID"`
}

type ListGameTypes struct {
	ID   int    `json:"ID"`
	Name string `json:"name"`
}

func Login(account, pw, ip string) ReturnData {
	db := GetConnection()
	var err error
	u := LoginStatus{}
	ps := []Permission{}
	pwd := EncryptedPassword(pw, account)
	err = db.Get(&u, "call sp_login(?,?,?)", account, pwd, ip)
	if err == nil && u != (LoginStatus{}) {
		_ = db.Select(&ps, "call sp_loginPermisisons(?)", u.ID)
		p := common.PermissionEnum{}
		for _, item := range ps {
			if item.Active {
				name := strings.Split(item.Name, "_")[0]
				action := strings.Split(item.Name, "_")[1]

				v := reflect.ValueOf(&p).Elem()
				for i := 0; i < v.Type().NumField(); i++ {
					v2 := v.Field(i)
					foundName := common.Contains(strings.Split(v.Type().Field(i).Tag.Get("db"), ","), name)
					fmt.Println(v.Type().Field(i).Tag)
					if foundName {
						for j := 0; j < v2.Type().NumField(); j++ {
							foundAction := common.Contains(strings.Split(v2.Type().Field(j).Tag.Get("db"), ","), action)
							if foundAction {
								v2.Field(j).SetString("true")
								break
							}
						}
						break
					}
				}
			}
		}
		u.Permissions = &ps
		u.ClientPermissions = &p
	}
	returnData := BoxingToResult(u, err)
	return returnData
}

func GetListUsers(loginID int) ReturnData {
	db := GetConnection()
	var err error
	u := []ListUsers{}
	err = db.Select(&u, "call sp_getListUsers(?)", loginID)
	return BoxingToResult(u, err)
}

func GetListMachines(loginID int) ReturnData {
	db := GetConnection()
	var err error
	u := []ListMachines{}
	err = db.Select(&u, "call sp_getListMachines(?)", loginID)
	return BoxingToResult(u, err)
}

func CacheConfig(config *con.Config) {
	Ch.Set("config", config, cache.NoExpiration)
}

func GetConfig(name string) reflect.Value {
	config, found := Ch.Get("config")
	if found {
		rs := reflect.ValueOf(*config.(*con.Config))
		rs2 := reflect.New(rs.Type()).Elem()
		rs2.Set(rs)
		return rs2.FieldByName(name)
	} else {
		// app, _ := utron.NewMVC()
		// rs := reflect.ValueOf(*app.Config)
		// rs2 := reflect.New(rs.Type()).Elem()
		// rs2.Set(rs)
		// Ch.Set("config", app.Config, cache.NoExpiration)
		// return rs2.FieldByName(name)
		return reflect.ValueOf(con.Config{SessionKeyPair: []string{"", ""}}).FieldByName(name)
	}
}

func GetConnection() *sqlx.DB {
	if db == nil {
		db, _ = sqlx.Open("mysql", GetConfig("DatabaseConn").String())
	}
	return db
}

func BoxingToResult(data interface{}, err error) ReturnData {
	returnData := ReturnData{}
	returnData.Data = data
	if err != nil {
		returnData.Message = err.Error()
		returnData.Code = "500"
	} else if data == nil {
		returnData.Code = "200"
		returnData.Data = nil
		returnData.Message = "Success"
	} else {
		returnData.Code = "200"
		if reflect.TypeOf(data).Kind() == reflect.Array || reflect.TypeOf(data).Kind() == reflect.Slice {
			vacct := reflect.ValueOf(data)
			if vacct.Len() > 0 {
				st := vacct.Slice(0, 1).Index(0).Type()
				_, totalExist := st.FieldByName("Total")
				if totalExist {
					// fmt.Println(vacct.Slice(0, 1))
					// fmt.Println(vacct.Slice(0, 1).Index(0).FieldByName("Total"))
					returnData.Total = (int)(vacct.Slice(0, 1).Index(0).FieldByName("Total").Int())
				}
			}
		} else if reflect.TypeOf(data).Kind() == reflect.Int64 {
			vacct := reflect.ValueOf(data)
			if vacct.Int() > 0 {
				returnData.Code = "200"
				returnData.Message = "Success"
			} else {
				returnData.Code = "500"
				returnData.Message = "No Affected Rows"
			}
		}
	}
	return returnData
}

func ErrorResult(message, code string) ReturnData {
	returnData := ReturnData{}
	returnData.Message = message
	returnData.Code = code
	return returnData
}

func FakeDataGenrator(dest interface{}, number int) {

}

type ReturnData struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
	Total   int         `json:"total"`
}
