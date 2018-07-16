package controllers

import (
	"encoding/json"
	"net/http"

	common "github.com/awpbackend/modules/common"
	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron/controller"
)

//comments
type Reports struct {
	controller.BaseController
	Routes []string
}

//comments
func (t *Reports) GetReportJackpot() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().ReportJackpot.View)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.ReportSearch
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.GetReportJackpot(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//comments
func (t *Reports) GetReportMachine() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().ReportMachine.View)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.ReportSearch
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.GetReportMachine(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//comments
func (t *Reports) GetReportRevenue() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().ReportRevenue.View)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.ReportSearch
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.GetReportRevenue(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//comments
func NewReports() controller.Controller {
	return &Reports{
		Routes: []string{
			"post;/api/reports/jackpot;GetReportJackpot",
			"post;/api/reports/machine;GetReportMachine",
			"post;/api/reports/revenue;GetReportRevenue",
		},
	}
}
