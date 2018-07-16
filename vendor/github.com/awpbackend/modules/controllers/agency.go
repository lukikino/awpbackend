package controllers

import (
	"encoding/json"
	"net/http"

	common "github.com/awpbackend/modules/common"
	m "github.com/awpbackend/modules/models"

	"github.com/gernest/utron/controller"
)

//Todo is a controller for Todo list
type Agency struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *Agency) GetUsers() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Agency.View)
	t.RenderJSON(m.GetUsers(GetLoginStatus(t.Ctx.Request()).ID, false), http.StatusOK)
}

//Home renders a todo list
func (t *Agency) GetUserPermissions() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Agency.Edit)
	t.RenderJSON(m.GetUserPermissions(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"], false), http.StatusOK)
}

//Home renders a todo list
func (t *Agency) EditUserPermissions() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Agency.Edit)
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
func (t *Agency) AddUser() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Agency.Create)
	data := m.User{}
	req := t.Ctx.Request()
	req.ParseForm()
	if err := decoder.Decode(&data, req.PostForm); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.AddUser(GetLoginStatus(t.Ctx.Request()).ID, req.RemoteAddr, data, false), http.StatusOK)
	}
}

func (t *Agency) ToggleActive() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Agency.Edit)
	t.RenderJSON(m.ToggleUserActive(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"]), http.StatusOK)
}

//Home renders a todo list
func (t *Agency) EditPassword() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().Agency.Edit)
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
func NewAgency() controller.Controller {
	return &Agency{
		Routes: []string{
			"get;/api/agency;GetUsers",
			"post;/api/agency;AddUser",
			"get;/api/agency/permissions/{id};GetUserPermissions",
			"post;/api/agency/permissions;EditUserPermissions",
			"post;/api/agency/active/{id};ToggleActive",
			"post;/api/agency/password/{id};EditPassword",
		},
	}
}
