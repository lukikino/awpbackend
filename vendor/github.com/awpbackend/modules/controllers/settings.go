package controllers

import (
	"net/http"

	"github.com/gernest/utron/controller"
)

//Todo is a controller for Todo list
type Settings struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *Settings) Version() {
	t.Ctx.Data = map[string]interface{}{
		"title":  "title",
		"header": "My Header",
		"footer": "My Footer",
	}
	t.Ctx.Template = "settings/versionHTML"
	t.HTML(http.StatusOK)
}

//Home renders a todo list
func (t *Settings) JPServer() {
	t.Ctx.Data = map[string]interface{}{
		"title":  "title",
		"header": "My Header",
		"footer": "My Footer",
	}
	t.Ctx.Template = "settings/jpserverHTML"
	t.HTML(http.StatusOK)
}

//NewTodo returns a new  todo list controller
func NewSettings() controller.Controller {
	return &Settings{
		Routes: []string{},
	}
}
