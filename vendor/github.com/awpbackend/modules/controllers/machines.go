package controllers

import (
	"encoding/json"
	"net/http"

	common "github.com/awpbackend/modules/common"
	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron/controller"
	"github.com/gorilla/schema"
)

var decoder = schema.NewDecoder()

//Todo is a controller for Todo list
type Machines struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *Machines) Transfer() {
	t.Ctx.Data = map[string]interface{}{
		"title":  "title",
		"header": "My Header",
		"footer": "My Footer",
	}
	t.Ctx.Template = "machines/transferHTML"
	t.HTML(http.StatusOK)
}

//Home renders a todo list
func (t *Machines) GetMachines() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().MachineList.View)
	t.RenderJSON(m.GetMachines(GetLoginStatus(t.Ctx.Request()).ID), http.StatusOK)
}

//Home renders a todo list
func (t *Machines) GetMachine() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().MachineList.Edit)
	t.RenderJSON(m.GetMachine(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"]), http.StatusOK)
}

//Home renders a todo list
func (t *Machines) GetMachinesWithUsers() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().MachineTransfer.View)
	t.RenderJSON(m.GetMachinesWithUsers(GetLoginStatus(t.Ctx.Request()).ID), http.StatusOK)
}

//Home renders a todo list
func (t *Machines) TransferMachines() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().MachineTransfer.Edit)
	req := t.Ctx.Request()
	decoder := json.NewDecoder(req.Body)
	var data m.MachineTransfer
	if err := decoder.Decode(&data); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.TransferMachines(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//Home renders a todo list
func (t *Machines) AddMachine() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().MachineList.Create)
	data := m.Machine{}
	req := t.Ctx.Request()
	req.ParseForm()
	if err := decoder.Decode(&data, req.PostForm); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.AddMachine(GetLoginStatus(t.Ctx.Request()).ID, data), http.StatusOK)
	}
}

//Home renders a todo list
func (t *Machines) EditMachine() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().MachineList.Edit)
	data := m.Machine{}
	req := t.Ctx.Request()
	req.ParseForm()
	if err := decoder.Decode(&data, req.PostForm); err != nil {
		t.Ctx.Data["Message"] = err.Error()
		t.RenderJSON(m.ErrorResult(err.Error(), "400"), http.StatusBadRequest)
		return
	} else {
		t.RenderJSON(m.EditMachine(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"], data), http.StatusOK)
	}
}

//Home renders a todo list
func (t *Machines) DeleteMachine() {
	CheckPermission(t.Ctx, common.GetStaticPermissions().MachineList.Delete)
	t.RenderJSON(m.DeleteMachine(GetLoginStatus(t.Ctx.Request()).ID, t.Ctx.Params["id"]), http.StatusOK)
}

//NewTodo returns a new  todo list controller
func NewMachines() controller.Controller {
	return &Machines{
		Routes: []string{
			"get;/api/machinetransfer;GetMachinesWithUsers",
			"post;/api/machinetransfer;TransferMachines",

			"get;/api/machines;GetMachines",
			"post;/api/machines;AddMachine",
			"get;/api/machines/{id};GetMachine",
			"post;/api/machines/{id};EditMachine",
			"delete;/api/machines/{id};DeleteMachine",
		},
	}
}
