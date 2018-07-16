package controllers

import (
	"encoding/json"
	"net/http"

	common "github.com/awpbackend/modules/common"
	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron/controller"
)

//comments
type Operations struct {
	controller.BaseController
	Routes []string
}

func (t *Operations) GetOperations() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Operations.View)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.OperationSearch
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.GetOperations(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//comments
func NewOperations() controller.Controller {
	return &Operations{
		Routes: []string{
			"post;/api/operations;GetOperations"},
	}
}
