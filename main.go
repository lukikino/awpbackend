package main

import (
	"encoding/gob"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"google.golang.org/appengine"

	c "github.com/awpbackend/modules/controllers"
	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron"
	"github.com/gorilla/sessions"
)

type MyHandler struct {
}

func (this *MyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[1:]
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
		} else {
			contentType = "text/plain"
		}

		w.Header().Add("Content Type", contentType)
		w.Write(data)
	} else {
		w.WriteHeader(404)
		w.Write([]byte("404 My dear - " + http.StatusText(404)))
	}
}
func neuter(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	gob.Register(m.LoginStatus{})
	// Start the MVC App
	app, err := utron.NewMVC()
	if err != nil {
		log.Fatal(err)
	}

	// Register Models
	//app.Model.Register(&models.Todo{})

	// CReate Models tables if they dont exist yet
	//app.Model.AutoMigrateAll()

	// http.Handle("/", http.FileServer(http.Dir("./static")))
	// http.ListenAndServe(":8080", nil)
	// app.Config.StaticDir = "static"
	// _, _, hhh := app.StaticServer(app.Config)
	// mux.Handle("/static/", http.StripPrefix("/static", neuter(fileServer)))
	// mux := http.NewServeMux()
	// l := MyHandler{}
	// hhh.ServeHTTP = new(MyHandler).ServeHTTP
	// "static_dir": "static",
	// http.FileServer(http.Dir("./static"))

	//Save Config to cache
	m.CacheConfig(app.Config)

	//init sessions
	var key1 = m.GetConfig("SessionKeyPair").Index(0).String()
	var key2 = m.GetConfig("SessionKeyPair").Index(1).String()
	c.Store = sessions.NewCookieStore(([]byte)(key1), ([]byte)(key2))

	// Register Controller
	app.AddController(c.NewLayout, c.CheckLoginStatus)
	app.AddController(c.NewOperations, c.CheckLoginStatus)
	app.AddController(c.NewTransactions, c.CheckLoginStatus)
	app.AddController(c.NewAccountings, c.CheckLoginStatus)
	app.AddController(c.NewReports, c.CheckLoginStatus)
	app.AddController(c.NewSettings, c.CheckLoginStatus)
	app.AddController(c.NewCoreUsers, c.CheckLoginStatus)
	app.AddController(c.NewAgency, c.CheckLoginStatus)
	app.AddController(c.NewMachines, c.CheckLoginStatus)
	app.AddController(c.NewCommon, c.CheckLoginStatus)
	app.AddController(c.NewFileServe)
	app.AddController(c.NewLogin)
	app.AddController(c.NewProfile, c.CheckLoginStatus)
	app.AddController(c.NewJPStatus)

	// Start the server
	port := fmt.Sprintf(":%d", app.Config.Port)
	app.Log.Info("staring server on port", port)
	log.Fatal(http.ListenAndServe(port, app))
	appengine.Main()
}

func failOnError(err error, msg string) {
	if err != nil {
		fmt.Sprintf("%s: %s", msg, err)
	}
}
