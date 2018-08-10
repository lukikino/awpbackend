package controllers

import (
	"net/http"

	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron/controller"
)

//Todo is a controller for Todo list
type Profile struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *Profile) ChangePassword() {
	data := m.UserPassword{}
	req := t.Ctx.Request()
	req.ParseForm()
	if err := decoder.Decode(&data, req.PostForm); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.ChangeSelfPassword(GetLoginStatus(t.Ctx.Request()).ID, data.OldPassword, data.Password), http.StatusOK)
	}
}

//NewTodo returns a new  todo list controller
func NewProfile() controller.Controller {
	return &Profile{
		Routes: []string{
			"post;/api/profile/password;ChangePassword",
		},
	}
}
