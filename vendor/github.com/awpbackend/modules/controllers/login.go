package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	m "github.com/awpbackend/modules/models"
	"github.com/gernest/utron/base"
	"github.com/gernest/utron/controller"
)

type LoginForm struct {
	Account    string `json:"account"`
	Password   string `json:"password"`
	RememberMe bool   `json:"rememberMe"`
}

//Todo is a controller for Todo list
type Login struct {
	controller.BaseController
	Routes []string
}

//Home renders a todo list
func (t *Login) LoginIndex() {
	t.Ctx.Data = map[string]interface{}{
		"id":     "index",
		"title":  "title",
		"header": "My Header",
		"footer": "My Footer",
	}
	t.Ctx.Template = "loginHTML"
	t.HTML(http.StatusOK)
}

//Home renders a todo list
func (t *Login) Login() {
	data := LoginForm{}
	res := t.Ctx.Response()
	req := t.Ctx.Request()
	req.ParseForm()
	if err := decoder.Decode(&data, req.PostForm); err != nil {
		t.Ctx.Data["message"] = err.Error()
	} else {
		result := m.Login(data.Account, data.Password, req.RemoteAddr)
		if result.Message == "" {
			session, _ := Store.Get(req, "_u")
			if data.RememberMe {
				session.Options.MaxAge = (int)(14 * 24 * time.Hour.Seconds())
				fmt.Print((int)(14 * 24 * time.Hour.Seconds()))
			} else {
				session.Options.MaxAge = (int)(3 * time.Hour.Seconds())
				fmt.Print((int)(3 * time.Hour.Seconds()))
			}
			session.Values["token"] = result.Data
			_ = session.Save(req, res)
			// fmt.Println(err)
			t.Ctx.Data = map[string]interface{}{
				"login": true,
			}
		} else {
			t.Ctx.Data = map[string]interface{}{
				"message": result.Message,
				"login":   false,
			}
		}
	}
	t.Ctx.Template = "loginHTML"
	t.HTML(http.StatusOK)
}

func (t *Login) Logout() {
	res := t.Ctx.Response()
	req := t.Ctx.Request()
	session, _ := Store.Get(req, "_u")
	session.Options.MaxAge = -1
	_ = session.Save(req, res)
	t.Ctx.Redirect("/login", http.StatusSeeOther)
}

func (t *Login) GetLoginStatus() {
	data := GetLoginStatus(t.Ctx.Request())
	if data != nil {
		t.RenderJSON(m.BoxingToResult(data, nil), http.StatusOK)
	} else {
		t.RenderJSON(m.BoxingToResult(nil, nil), http.StatusOK)
	}
}

// func CheckPermission(w http.ResponseWriter, r *http.Request, p string) bool {
func CheckPermission(ctx *base.Context, p string) bool {
	w := ctx.Response()
	r := ctx.Request()
	loginStatus := GetLoginStatus(r)
	set := make(map[string]struct{}, len(*loginStatus.Permissions))
	for _, s := range *loginStatus.Permissions {
		set[s.Name] = struct{}{}
	}
	_, permissionFound := set[p]
	if loginStatus.Permissions == nil || !permissionFound {
		if strings.ToLower(r.Header.Get("X-Requested-With")) == "xmlhttprequest" {
			w.WriteHeader(http.StatusForbidden)
		} else {
			http.Redirect(w, r, "/login?r="+r.URL.Path, http.StatusSeeOther)
		}
		return false
	}
	return true
}

func GetLoginStatus(req *http.Request) *m.LoginStatus {
	session, _ := Store.Get(req, "_u")
	token := session.Values["token"]
	var data m.LoginStatus
	if token != nil {
		data = token.(m.LoginStatus)
	}
	if data != (m.LoginStatus{}) {
		return &(data)
	}
	return nil
}

// func CheckLoginStatus(Ctx *base.Context) error {
// 	fmt.Print("fdsafdsf")
// 	fmt.Println(GetLoginStatus(Ctx.Request()))
// 	_ = json.NewEncoder(Ctx).Encode("123456789456123456789")
// 	Ctx.JSON() //.controller.RenderJSON("emit macho dwarf: elf header corrupted", http.StatusOK)
// 	Ctx.Set(http.StatusOK)
// 	return nil //errors.New("emit macho dwarf: elf header corrupted")
// }

func CheckLoginStatus(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		data := GetLoginStatus(r)
		if data == nil {
			if strings.ToLower(r.Header.Get("X-Requested-With")) == "xmlhttprequest" {
				// _ = json.NewEncoder(w).Encode("123456789456123456789")
				// w.Header().Set("contentType", "JSON")
				w.WriteHeader(http.StatusForbidden)
				return
			} else {
				http.Redirect(w, r, "/login?r="+r.URL.Path, http.StatusSeeOther)
			}
			// _ = json.NewEncoder(w).Encode("123456789456123456789")
			// w.Header().Set("contentType", "JSON")
			// w.WriteHeader(http.StatusForbidden)
			// w.WriteHeader(http.StatusOK)
		} else {
			h.ServeHTTP(w, r)
		}
	})
}

//NewTodo returns a new  todo list controller
func NewLogin() controller.Controller {
	return &Login{
		Routes: []string{
			"get;/login;LoginIndex",
			"post;/logout;Logout",
			"post;/login;Login",
			"get;/getloginstatus;GetLoginStatus",
		},
	}
}
