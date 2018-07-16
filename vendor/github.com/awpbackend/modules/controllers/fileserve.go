package controllers

import (
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/gernest/utron/controller"
)

//Todo is a controller for Todo list
type FileServe struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *FileServe) Serve() {
	w := t.Ctx.Response()
	path := "static/" + t.Ctx.Params["file"]
	log.Println(path)
	data, err := ioutil.ReadFile(string(path))
	if err == nil {
		var contentType string
		if strings.HasSuffix(path, ".css") {
			contentType = "text/css"
		} else if strings.HasSuffix(path, ".html") {
			contentType = "text/html"
		} else if strings.HasSuffix(path, ".js") {
			contentType = "application/javascript"
		} else if strings.HasSuffix(path, ".png") {
			contentType = "image/png"
		} else if strings.HasSuffix(path, ".svg") {
			contentType = "image/svg+xml"
		} else if strings.HasSuffix(path, ".woff") {
			contentType = "application/x-font-woff"
		} else {
			contentType = "text/plain"
		}
		w.Header().Add("Content Type", contentType)
		w.Header().Add("Content-Type", contentType)
		w.Write(data)
	} else {
		w.WriteHeader(404)
		w.Write([]byte("404 My dear - " + http.StatusText(404)))
	}
}

//NewTodo returns a new  todo list controller
func NewFileServe() controller.Controller {
	return &FileServe{
		Routes: []string{
			"get;/static/{file:.*};Serve",
		},
	}
}
