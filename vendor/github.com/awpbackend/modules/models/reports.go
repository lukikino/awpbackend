package models

type ReportJackpot struct {
	StoreName   string `db:"store_name" json:"storeName"`
	MachineName string `db:"machine_name" json:"machineName"`
	PcbId       string `db:"pcb_id" json:"pcbID"`
	Account     string `db:"account" json:"account"`
	TotalJp1Win int    `db:"total_jp1_win" json:"totalJp1Win"`
	TotalJp2Win int    `db:"total_jp2_win" json:"totalJp2Win"`
	TotalJp3Win int    `db:"total_jp3_win" json:"totalJp3Win"`
	TotalJp4Win int    `db:"total_jp4_win" json:"totalJp4Win"`
	JPServer    int    `db:"jp_server" json:"jpServer"`
	CreatedTime string `db:"created_time" json:"createdTime"`
	Total       int    `db:"total" json:"total"`
}

type ReportSearch struct {
	Users     *string `json:"users"`
	Stores    *string `json:"stores"`
	Machines  *string `json:"machines"`
	StartTime *string `json:"startTime"`
	EndTime   *string `json:"endTime"`
	GroupBy   *string `json:"groupBy"`
}

func GetReportJackpot(loginID int, search ReportSearch) ReturnData {
	db := GetConnection()
	t := []ReportJackpot{}
	err := db.Select(&t, "call sp_getReportJackpot(?,?,?,?,?,?,?)", loginID, search.Users, search.Stores, search.Machines, search.StartTime, search.EndTime, search.GroupBy)
	return BoxingToResult(t, err)
}

type ReportMachine struct {
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
	TotalWin       int      `db:"total_win_without_jp" json:"totalWinWithoutJp"`
	TotalJpWin     int      `db:"total_jp_win" json:"totalJpWin"`
	TotalWinWithJp int      `db:"total_win" json:"totalWin"`
	TotalJp1Win    int      `db:"total_jp1_win" json:"totalJp1Win"`
	TotalJp2Win    int      `db:"total_jp2_win" json:"totalJp2Win"`
	TotalJp3Win    int      `db:"total_jp3_win" json:"totalJp3Win"`
	TotalJp4Win    int      `db:"total_jp4_win" json:"totalJp4Win"`
	TotalPlayTimes int      `db:"total_play_times" json:"totalPlayTimes"`
	TotalWinTimes  int      `db:"total_win_times" json:"totalWinTimes"`
	HitRate        *float32 `db:"hit_rate" json:"hitRate"`
	OutRate        *float32 `db:"out_rate" json:"outRate"`
	WinRate        *float32 `db:"win_rate_without_jp" json:"winRateWithoutJp"`
	WinRateWithJp  *float32 `db:"win_rate" json:"winRate"`
	AvgBet         *float32 `db:"avg_bet" json:"avgBet"`
	Total          int      `db:"total" json:"total"`
}

func GetReportMachine(loginID int, search ReportSearch) ReturnData {
	db := GetConnection()
	t := []ReportMachine{}
	err := db.Select(&t, "call sp_getReportMachine(?,?,?,?,?,?)", loginID, search.Users, search.Stores, search.Machines, search.StartTime, search.EndTime)
	return BoxingToResult(t, err)
}

type ReportRevenue struct {
	StoreName   string   `db:"store_name" json:"storeName"`
	MachineName string   `db:"machine_name" json:"machineName"`
	Account     string   `db:"account" json:"account"`
	PcbId       string   `db:"pcb_id" json:"pcbID"`
	TotalIn     int      `db:"total_in" json:"totalIn"`
	TotalOut    int      `db:"total_out" json:"totalOut"`
	GrossNet    int      `db:"gross_net" json:"grossNet"`
	OutRate     *float32 `db:"out_rate" json:"outRate"`
	Total       int      `db:"total" json:"total"`
}

func GetReportRevenue(loginID int, search ReportSearch) ReturnData {
	db := GetConnection()
	t := []ReportRevenue{}
	err := db.Select(&t, "call sp_getReportRevenue(?,?,?,?,?,?,?)", loginID, search.Users, search.Stores, search.Machines, search.StartTime, search.EndTime, search.GroupBy)
	return BoxingToResult(t, err)
}
