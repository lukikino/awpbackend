package models

import (
	_ "github.com/go-sql-driver/mysql"
)

type Transactions struct {
	StoreName       string `db:"store_name" json:"storeName"`
	PCBID           string `db:"pcb_id" json:"pcbID"`
	MachineName     string `db:"machine_name" json:"machineName"`
	TransactionType int    `db:"transaction_type" json:"transactionType"`
	GameType        int    `db:"game_type" json:"gameType"`
	StartCredit     int    `db:"start_credit" json:"startCredit"`
	ResultCredit    int    `db:"result_credit" json:"resultCredit"`
	CreditIn        int    `db:"credit_in" json:"creditIn"`
	CreditOut       int    `db:"credit_out" json:"creditOut"`
	Bet             int    `db:"bet" json:"bet"`
	Memo            string `db:"memo" json:"memo"`
	CreatedTime     string `db:"created_time" json:"createdTime"`
	CreditType      int    `db:"credit_type" json:"creditType"`
	RoundID         string `db:"round_id" json:"roundID"`
	JP1Win          int    `db:"jp1_win" json:"jp1Win"`
	JP2Win          int    `db:"jp2_win" json:"jp2Win"`
	JP3Win          int    `db:"jp3_win" json:"jp3Win"`
	JP4Win          int    `db:"jp4_win" json:"jp4Win"`
	Win             int    `db:"win" json:"win"`
	Total           int    `db:"total"`
}

type TransactionSearch struct {
	Users            *string `json:"users"`
	Stores           *string `json:"stores"`
	Machines         *string `json:"machines"`
	TransactionTypes *string `json:"transactionTypes"`
	GameTypes        *string `json:"gameTypes"`
	StartTime        *string `json:"startTime"`
	EndTime          *string `json:"endTime"`
}

func GetTransactions(loginID int, search TransactionSearch) ReturnData {
	db := GetConnection()
	t := []Transactions{}
	err := db.Select(&t, "call sp_getTransactions(?,?,?,?,?,?,?,?)", loginID, search.Users, search.Stores, search.Machines, search.TransactionTypes, search.GameTypes, search.StartTime, search.EndTime)
	return BoxingToResult(t, err)
}
