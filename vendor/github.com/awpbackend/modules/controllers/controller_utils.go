package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	common "github.com/awpbackend/modules/common"
	"github.com/awpbackend/modules/common/gametype"
	"github.com/awpbackend/modules/common/transactiontype"
	"github.com/awpbackend/modules/controllers/pb"
	m "github.com/awpbackend/modules/models"
	"github.com/golang/protobuf/proto"
	"github.com/gorilla/sessions"

	"github.com/gernest/utron/controller"
	"github.com/streadway/amqp"
)

// "github.com/awpbackend/modules/common/transactiontype"

//Todo is a controller for Todo list
type Common struct {
	controller.BaseController
	Routes []string
}

type Lists struct {
	Users            []m.ListUsers                          `json:"users"`
	Machines         []m.ListMachines                       `json:"machines"`
	Stores           []string                               `json:"stores"`
	TransactionTypes []transactiontype.ListTransactionTypes `json:"transactionTypes"`
	GameTypes        []gametype.ListGameTypes               `json:"gameTypes"`
}

// var key1 = m.GetConfig("SessionKeyPair").Index(0).String()
// var key2 = m.GetConfig("SessionKeyPair").Index(1).String()
//   var Store = sessions.NewCookieStore(([]byte)(key1), ([]byte)(key2))
var Store *sessions.CookieStore

//Home renders a todo list
func (t *Common) GetPermissionList() {
	p := common.GetStaticPermissions()
	t.RenderJSON(m.BoxingToResult(p, nil), http.StatusOK)
}

//Home renders a todo list
func (t *Common) GeUsersTree() {
	// req := t.Ctx.Request()
	t.RenderJSON(m.GetUsersTree(GetLoginStatus(t.Ctx.Request()).ID), http.StatusOK)
}

func (t *Common) GetListUsers() {
	t.RenderJSON(m.GetListUsers(GetLoginStatus(t.Ctx.Request()).ID), http.StatusOK)
}

func (t *Common) GetLists() {
	list := Lists{}
	list.Users = m.GetListUsers(GetLoginStatus(t.Ctx.Request()).ID).Data.([]m.ListUsers)
	list.Machines = m.GetListMachines(GetLoginStatus(t.Ctx.Request()).ID).Data.([]m.ListMachines)
	list.Stores = []string{}
	for _, item := range list.Machines {
		if !common.Contains(list.Stores, item.StoreName) {
			list.Stores = append(list.Stores, item.StoreName)
		}
	}
	list.TransactionTypes = transactiontype.GetTransactionTypes()
	list.GameTypes = gametype.GetGameTypes()
	t.RenderJSON(m.BoxingToResult(list, nil), http.StatusOK)
}
func (t *Common) GenFakeData() {
	m.GenFakeData()
}

func (t *Common) GenTransactions() {
	turns, err := strconv.Atoi(t.Ctx.Params["turns"])
	if err == nil {
		m.GenTransactions(turns)
	}
}

func (t *Common) Test2() {
	conn, err := amqp.Dial("amqp://test:test@127.0.0.1:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	err = ch.ExchangeDeclare(
		"s2c_BroadcastQueue", // name
		"fanout",             // type
		true,                 // durable
		false,                // auto-deleted
		false,                // internal
		false,                // no-wait
		nil,                  // arguments
	)
	failOnError(err, "Failed to declare an exchange")

	s2cBroadcastQueue, err := ch.QueueDeclare(
		"s2c_BroadcastQueue", // name
		false,                // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)

	err = ch.QueueBind(
		s2cBroadcastQueue.Name, // queue name
		"",                   // routing key
		"s2c_BroadcastQueue", // exchange
		false,
		nil)

	p := &pb.Person{
		Id:    1234,
		Name:  "John Doe",
		Email: "joe@sample.com",
		Phones: []*pb.Person_PhoneNumber{
			{Number: "5547318444", Type: pb.Person_HOME},
		},
	}
	out, err := proto.Marshal(p)
	body := out

	err = ch.Publish(
		"s2c_BroadcastQueue", // exchange
		"",                   // routing key
		false,                // mandatory
		false,                // immediate
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "text/plain",
			Body:         []byte(body),
		})
	failOnError(err, "Failed to publish a message")
}

func failOnError(err error, msg string) {
	if err != nil {
		fmt.Sprintf("%s: %s", msg, err)
	}
}

//NewTodo returns a new  todo list controller
func NewCommon() controller.Controller {
	return &Common{
		Routes: []string{
			"get;/api/common/permissionlist;GetPermissionList",
			"get;/api/common/getuserstree;GeUsersTree",
			"get;/api/common/list/users;GetListUsers",
			"get;/api/common/list/all;GetLists",
			"get;/api/common/fake;GenFakeData",
			"get;/api/common/faketurn/{turns};GenTransactions",
			"get;/api/common/test;Test",
			"get;/api/common/test2;Test2",
		},
	}
}
