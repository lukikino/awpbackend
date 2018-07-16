//go:generate stringer -type=CreditType
//if modify const, run "go generate" in current floder
package credittype

type CreditType int

// func (CreditType) String() string

const (
	KeyIn     CreditType = 1
	KeyOut    CreditType = 2
	CoinIn    CreditType = 3
	CoinOut   CreditType = 4
	BillIn    CreditType = 5
	BillOut   CreditType = 6
	TicketIn  CreditType = 7
	TicketOut CreditType = 8
)

var listCreditType []ListCreditType

func GetCreditType() []ListCreditType {
	if listCreditType == nil {
		listCreditType = []ListCreditType{
			ListCreditType{ID: (int)(KeyIn), Name: KeyIn.String()},
			ListCreditType{ID: (int)(KeyOut), Name: KeyOut.String()},
			ListCreditType{ID: (int)(CoinIn), Name: CoinIn.String()},
			ListCreditType{ID: (int)(CoinOut), Name: CoinOut.String()},
			ListCreditType{ID: (int)(BillIn), Name: BillIn.String()},
			ListCreditType{ID: (int)(BillOut), Name: BillOut.String()},
		}
	}
	return listCreditType
}

type ListCreditType struct {
	ID   int    `json:"ID"`
	Name string `json:"name"`
}
