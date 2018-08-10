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
	Store_Name   string
	Machine_Name string
	Value        float32
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

func GetTopOutRate() []Top {
	db := GetConnection()
	top := []Top{}
	db.Select(&top, "call sp_getTopOutRate")
	return top
}

func GetTopWinRate() []Top {
	db := GetConnection()
	top := []Top{}
	db.Select(&top, "call sp_getTopWinRate")
	return top
}

func GetTopHitRate() []Top {
	db := GetConnection()
	top := []Top{}
	db.Select(&top, "call sp_getTopHitRate")
	return top
}
