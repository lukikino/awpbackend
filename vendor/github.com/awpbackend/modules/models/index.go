package models

import (
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type Dashboard struct {
	Total_In         int
	Total_Out        int
	Out_Rate         float32
	Total_Bet        int
	Total_Win        int
	Win_Rate         float32
	Total_Play_Times int
	Total_Win_Times  int
	Hit_Rate         float32
}

type Top struct {
	Store_Name   string
	Machine_Name string
	Value        float32
}

func GetDashboard() []Dashboard {
	db := GetConnection()
	end_time := time.Now().UTC().Add(time.Hour * time.Duration(TimeZone))
	start_time := time.Date(end_time.Year(), end_time.Month(), end_time.Day(), -3+TimeZone, 0, 0, 0, end_time.Location())
	if end_time.Unix() < start_time.Unix() {
		start_time = start_time.Add(time.Hour * time.Duration(-24))
	}
	dashboard := []Dashboard{}
	db.Select(&dashboard, "call sp_getDashboard('%s','%s')", start_time.UTC().Format(DatetimeFormat), end_time.UTC().Format(DatetimeFormat))
	// fmt.Printf("call sp_getDashboard('%s','%s')", start_time.UTC().Format(DatetimeFormat), end_time.UTC().Format(DatetimeFormat))
	// fmt.Println(dashboard)
	return dashboard
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
