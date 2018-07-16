package controllers

import (
	"encoding/json"
	"net/http"

	common "github.com/awpbackend/modules/common"
	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron/controller"
)

//Todo is a controller for Todo list
type Transactions struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *Transactions) GetTransactions() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Transactions.View)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.TransactionSearch
	// if body, err := ioutil.ReadAll(req.Body); err != nil {
	// 	t.Ctx.Data["Message"] = err.Error()
	// 	t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
	// 	return
	// } else {
	// 	if err2 := json.Unmarshal(body, &data); err2 != nil {
	// 		t.Ctx.Data["Message"] = err.Error()
	// 		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
	// 		return
	// 	} else {
	// 		t.RenderJSON(m.GetTransactions(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	// 	}
	// }
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.GetTransactions(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//NewTodo returns a new  todo list controller
func NewTransactions() controller.Controller {
	return &Transactions{
		Routes: []string{
			"post;/api/transactions;GetTransactions",
		},
	}
}
