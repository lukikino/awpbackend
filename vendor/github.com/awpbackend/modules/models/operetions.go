package models

import (
	_ "github.com/go-sql-driver/mysql"
)

type OperationsWithSummary struct {
	Operations []Operations `json:"operations"`
	Summary    Operations   `json:"summary"`
}

type Operations struct {
	Date           string   `db:"date" json:"date"`
	StoreName      string   `db:"store_name" json:"storeName"`
	MachineName    string   `db:"machine_name" json:"machineName"`
	Account        string   `db:"account" json:"account"`
	PcbId          string   `db:"pcb_id" json:"pcbID"`
	TotalIn        int      `db:"total_in" json:"totalIn"`
	TotalCoinIn    int      `db:"total_coin_in" json:"totalCoinIn"`
	TotalBillIn    int      `db:"total_bill_in" json:"totalBillIn"`
	TotalKeyIn     int      `db:"total_key_in" json:"totalKeyIn"`
	TotalOut       int      `db:"total_out" json:"totalOut"`
	TotalCoinOut   int      `db:"total_coin_out" json:"totalCoinOut"`
	TotalBillOut   int      `db:"total_bill_out" json:"totalBillOut"`
	TotalKeyOut    int      `db:"total_key_out" json:"totalKeyOut"`
	TotalBet       int      `db:"total_bet" json:"totalBet"`
	TotalWin       int      `db:"total_win" json:"totalWin"`
	TotalWinWithJp int      `db:"total_win_with_jp" json:"totalWinWithJp"`
	TotalJpWin     int      `db:"total_jp_win" json:"totalJpWin"`
	TotalJp1Win    int      `db:"total_jp1_win" json:"totalJp1Win"`
	TotalJp2Win    int      `db:"total_jp2_win" json:"totalJp2Win"`
	TotalJp3Win    int      `db:"total_jp3_win" json:"totalJp3Win"`
	TotalJp4Win    int      `db:"total_jp4_win" json:"totalJp4Win"`
	TotalPlayTimes int      `db:"total_play_times" json:"totalPlayTimes"`
	TotalWinTimes  int      `db:"total_win_times" json:"totalWinTimes"`
	OutRate        *float32 `db:"out_rate" json:"outRate"`
	WinRate        *float32 `db:"win_rate" json:"winRate"`
	HitRate        *float32 `db:"hit_rate" json:"hitRate"`
	WinRateWithJp  *float32 `db:"win_rate_with_jp" json:"winRateWithJp"`
	Total          int      `db:"total" json:"total"`
}

type OperationSearch struct {
	Users         *string `json:"users"`
	Stores        *string `json:"stores"`
	Machines      *string `json:"machines"`
	StartTime     *string `json:"startTime"`
	EndTime       *string `json:"endTime"`
	GroupBy       *string `json:"groupBy"`
	GroupInterval *string `json:"GroupInterval"`
}

func GetOperations(loginID int, search OperationSearch) ReturnData {
	db := GetConnection()
	t := []Operations{}
	r := OperationsWithSummary{}
	err := db.Select(&t, "call sp_getOperations(?,?,?,?,?,?,?,?)", loginID, search.Users, search.Stores, search.Machines, search.StartTime, search.EndTime, search.GroupBy, search.GroupInterval)
	if err == nil {
		r.Operations = t
		for _, item := range t {
			r.Summary.TotalIn += item.TotalIn
			r.Summary.TotalCoinIn += item.TotalCoinIn
			r.Summary.TotalBillIn += item.TotalBillIn
			r.Summary.TotalKeyIn += item.TotalKeyIn
			r.Summary.TotalOut += item.TotalOut
			r.Summary.TotalCoinOut += item.TotalCoinOut
			r.Summary.TotalBillOut += item.TotalBillOut
			r.Summary.TotalKeyOut += item.TotalKeyOut
			r.Summary.TotalBet += item.TotalBet
			r.Summary.TotalWin += item.TotalWin
			r.Summary.TotalWinWithJp += item.TotalWinWithJp
			r.Summary.TotalJpWin += item.TotalJpWin
			r.Summary.TotalJp1Win += item.TotalJp1Win
			r.Summary.TotalJp2Win += item.TotalJp2Win
			r.Summary.TotalJp3Win += item.TotalJp3Win
			r.Summary.TotalJp4Win += item.TotalJp4Win
			r.Summary.TotalPlayTimes += item.TotalPlayTimes
			r.Summary.TotalWinTimes += item.TotalWinTimes
		}
		t1 := (float32)(r.Summary.TotalOut) / (float32)(r.Summary.TotalIn) * 100
		r.Summary.OutRate = &t1
		t2 := (float32)(r.Summary.TotalWin) / (float32)(r.Summary.TotalBet) * 100
		r.Summary.WinRate = &t2
		t3 := (float32)(r.Summary.TotalWinTimes) / (float32)(r.Summary.TotalPlayTimes) * 100
		r.Summary.HitRate = &t3
		t4 := (float32)(r.Summary.TotalWinWithJp) / (float32)(r.Summary.TotalBet) * 100
		r.Summary.WinRateWithJp = &t4
	}
	return BoxingToResult(r, err)
}
