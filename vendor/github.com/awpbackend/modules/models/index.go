package models

import (
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type Dashboard struct {
	ID             *int     `db:"id" json:"-"`
	TotalIn        *int     `db:"total_in" json:"totalIn"`
	TotalOut       *int     `db:"total_out" json:"totalOut"`
	OutRate        *float32 `db:"out_rate" json:"outRate"`
	TotalBet       *int     `db:"total_bet" json:"totalBet"`
	TotalWin       *int     `db:"total_win" json:"totalWin"`
	WinRate        *float32 `db:"win_rate" json:"winRate"`
	HitRate        *float32 `db:"hit_rate" json:"hitRate"`
	TotalPlayTimes *int     `db:"total_play_times" json:"totalPlayTimes"`
	TotalWinTimes  *int     `db:"total_win_times" json:"totalWinTimes"`
}

type Top struct {
	StoreName   string  `db:"store_name" json:"storeName"`
	MachineName string  `db:"machine_name" json:"machineName"`
	Value       float32 `db:"value" json:"value"`
}

type DashboardSearch struct {
	Users  *string `json:"users"`
	Stores *string `json:"stores"`
}

func GetDashboard(loginID int, search DashboardSearch) ReturnData {
	db := GetConnection()
	m := []Dashboard{}
	err := db.Select(&m, "call sp_getDashboard(?,?,?,?)", loginID, search.Users, search.Stores, time.Now())
	returnData := BoxingToResult(m, err)
	return returnData
}

func GetTopGrossNet(loginID int, search DashboardSearch) []Top {
	db := GetConnection()
	top := []Top{}
	db.Select(&top, "call sp_getTopGrossNet(?,?,?)", loginID, search.Users, search.Stores)
	return top
}

func GetTopPlaytimes(loginID int, search DashboardSearch) []Top {
	db := GetConnection()
	top := []Top{}
	db.Select(&top, "call sp_getTopPlaytimes(?,?,?)", loginID, search.Users, search.Stores)
	return top
}

func GetTopWin(loginID int, search DashboardSearch) []Top {
	db := GetConnection()
	top := []Top{}
	db.Select(&top, "call sp_getTopWin(?,?,?)", loginID, search.Users, search.Stores)
	return top
}
