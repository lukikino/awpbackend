package controllers

import (
	"net/http"
	"strconv"

	common "github.com/awpbackend/modules/common"
	"github.com/awpbackend/modules/common/gametype"
	"github.com/awpbackend/modules/common/transactiontype"
	m "github.com/awpbackend/modules/models"
	"github.com/gorilla/sessions"

	"github.com/gernest/utron/controller"
)

// "github.com/awpbackend/modules/common/transactiontype"

//Todo is a controller for Todo list
type Common struct {
	controller.BaseController
	Routes []string
}

type Lists struct {
	Users            []m.ListUsers                          `json:"users"`
	Machines         []m.ListMachines                       `json:"machines"`
	Stores           []string                               `json:"stores"`
	TransactionTypes []transactiontype.ListTransactionTypes `json:"transactionTypes"`
	GameTypes        []gametype.ListGameTypes               `json:"gameTypes"`
}

// var key1 = m.GetConfig("SessionKeyPair").Index(0).String()
// var key2 = m.GetConfig("SessionKeyPair").Index(1).String()
//   var Store = sessions.NewCookieStore(([]byte)(key1), ([]byte)(key2))
var Store *sessions.CookieStore

//Home renders a todo list
func (t *Common) GetPermissionList() {
	p := common.GetStaticPermissions()
	t.RenderJSON(m.BoxingToResult(p, nil), http.StatusOK)
}

//Home renders a todo list
func (t *Common) GeUsersTree() {
	// req := t.Ctx.Request()
	t.RenderJSON(m.GetUsersTree(GetLoginStatus(t.Ctx.Request()).ID), http.StatusOK)
}

func (t *Common) GetListUsers() {
	t.RenderJSON(m.GetListUsers(GetLoginStatus(t.Ctx.Request()).ID), http.StatusOK)
}

func (t *Common) GetLists() {
	list := Lists{}
	list.Users = m.GetListUsers(GetLoginStatus(t.Ctx.Request()).ID).Data.([]m.ListUsers)
	list.Machines = m.GetListMachines(GetLoginStatus(t.Ctx.Request()).ID).Data.([]m.ListMachines)
	for _, item := range list.Machines {
		if !common.Contains(list.Stores, item.StoreName) {
			list.Stores = append(list.Stores, item.StoreName)
		}
	}
	list.TransactionTypes = transactiontype.GetTransactionTypes()
	list.GameTypes = gametype.GetGameTypes()
	t.RenderJSON(m.BoxingToResult(list, nil), http.StatusOK)
}
func (t *Common) GenFakeData() {
	m.GenFakeData()
}

func (t *Common) GenTransactions() {
	turns, err := strconv.Atoi(t.Ctx.Params["turns"])
	if err == nil {
		m.GenTransactions(turns)
	}
}

//NewTodo returns a new  todo list controller
func NewCommon() controller.Controller {
	return &Common{
		Routes: []string{
			"get;/api/common/permissionlist;GetPermissionList",
			"get;/api/common/getuserstree;GeUsersTree",
			"get;/api/common/list/users;GetListUsers",
			"get;/api/common/list/all;GetLists",
			"get;/api/common/fake;GenFakeData",
			"get;/api/common/faketurn/{turns};GenTransactions",
		},
	}
}
