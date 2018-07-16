package controllers

import (
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

//Home renders a todo list
func (t *Layout) GetDashboard() {
	t.RenderJSON(m.GetDashboard(), http.StatusOK)
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
			"get;/api/index/dashboard;GetDashboard",
			"get;/api/index/topoutrate;GetTopOutRate",
			"get;/api/index/topwinrate;GetTopWinRate",
			"get;/api/index/tophitrate;GetTopHitRate",

			"get;/;Home",
			"get;/accounting/{name};Home",
			"get;/machines/{name};Home",
			"get;/operations/{name};Home",
			"get;/reports/{name};Home",
			"get;/settings/{name};Home",
			"get;/transactions;Home",
			"get;/users/{name};Home",
		},
	}
}
