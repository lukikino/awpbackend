package controllers

import (
	"encoding/json"
	"net/http"

	common "github.com/awpbackend/modules/common"
	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron/controller"
)

//comments
type Accountings struct {
	controller.BaseController
	Routes []string
}

func (t *Accountings) GetAccountings() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Operations.View)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.AccountingSearch
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.GetAccountings(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//comments
func NewAccountings() controller.Controller {
	return &Accountings{
		Routes: []string{
			"post;/api/accountings;GetAccountings"},
	}
}
