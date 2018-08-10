package controllers

import (
	"encoding/json"
	"net/http"

	m "github.com/awpbackend/modules/models"

	"github.com/gernest/utron/controller"
)

//Todo is a controller for Todo list
type Layout struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *Layout) Home() {
	t.Ctx.Data = map[string]interface{}{
		"id":     "index",
		"title":  "title",
		"header": "My Header",
		"footer": "My Footer",
	}
	t.Ctx.Template = "layoutHTML"
	t.HTML(http.StatusOK)
}

func (t *Layout) Redirect() {
	t.Ctx.Redirect("/dashboard", http.StatusSeeOther)
}

//Home renders a todo list
func (t *Layout) GetDashboard() {
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.DashboardSearch
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.GetDashboard(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

func (t *Layout) GetTopOutRate() {
	t.RenderJSON(m.GetTopOutRate(), http.StatusOK)
}

func (t *Layout) GetTopWinRate() {
	t.RenderJSON(m.GetTopWinRate(), http.StatusOK)
}

func (t *Layout) GetTopHitRate() {
	t.RenderJSON(m.GetTopHitRate(), http.StatusOK)
}

//NewTodo returns a new  todo list controller
func NewLayout() controller.Controller {
	return &Layout{
		Routes: []string{
			"post;/api/index/dashboard;GetDashboard",
			"get;/api/index/topoutrate;GetTopOutRate",
			"get;/api/index/topwinrate;GetTopWinRate",
			"get;/api/index/tophitrate;GetTopHitRate",

			"get;/;Redirect",
			"get;/dashboard;Home",
			"get;/accounting/{name};Home",
			"get;/machines/{name};Home",
			"get;/operations/{name};Home",
			"get;/reports/{name};Home",
			"get;/settings/{name};Home",
			"get;/transactions;Home",
			"get;/users/{name};Home",
			"get;/profile;Home",
			"get;/profile/{name};Home",
		},
	}
}
