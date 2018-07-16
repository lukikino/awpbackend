package controllers

import (
	"encoding/json"
	"net/http"

	common "github.com/awpbackend/modules/common"
	m "github.com/awpbackend/modules/models"

	"github.com/gernest/utron/controller"
)

//Todo is a controller for Todo list
type CoreUsers struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *CoreUsers) GetUsers() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().CoreUser.View)
	t.RenderJSON(m.GetUsers(GetLoginStatus(t.Ctx.Request()).ID, true), http.StatusOK)
}

//Home renders a todo list
func (t *CoreUsers) GetUserPermissions() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().CoreUser.Edit)
	t.RenderJSON(m.GetUserPermissions(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"], true), http.StatusOK)
}

//Home renders a todo list
func (t *CoreUsers) EditUserPermissions() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().CoreUser.Edit)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.User
	err := decoder.Decode(&data)
	if err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.EditUserPermissions(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
	defer req.Body.Close()
}

//Home renders a todo list
func (t *CoreUsers) AddUser() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().CoreUser.Create)
	data := m.User{}
	req := t.Ctx.Request()
	req.ParseForm()
	if err := decoder.Decode(&data, req.PostForm); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.AddUser(GetLoginStatus(t.Ctx.Request()).ID, req.RemoteAddr, data, true), http.StatusOK)
	}
}

func (t *CoreUsers) ToggleActive() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().CoreUser.Edit)
	t.RenderJSON(m.ToggleUserActive(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"]), http.StatusOK)
}

//Home renders a todo list
func (t *CoreUsers) EditPassword() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().CoreUser.Edit)
	data := m.User{}
	req := t.Ctx.Request()
	req.ParseForm()
	if err := decoder.Decode(&data, req.PostForm); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.ChangeUserPassword(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"], data.Password), http.StatusOK)
	}
}

//NewTodo returns a new  todo list controller
func NewCoreUsers() controller.Controller {
	return &CoreUsers{
		Routes: []string{
			"get;/api/coreusers;GetUsers",
			"post;/api/coreusers;AddUser",
			"get;/api/coreusers/permissions/{id};GetUserPermissions",
			"post;/api/coreusers/permissions;EditUserPermissions",
			"post;/api/coreusers/active/{id};ToggleActive",
			"post;/api/coreusers/password/{id};EditPassword",
		},
	}
}
