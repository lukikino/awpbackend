//go:generate stringer -type=TransactionType
//if modify const, run "go generate" in current floder
package transactiontype

type TransactionType int

// func (TransactionType) String() string

const (
	CreditIn  TransactionType = 1
	CreditOut TransactionType = 2
	Play      TransactionType = 10
)

var listTransactionTypes []ListTransactionTypes

func GetTransactionTypes() []ListTransactionTypes {
	if listTransactionTypes == nil {
		listTransactionTypes = []ListTransactionTypes{
			ListTransactionTypes{ID: (int)(CreditIn), Name: CreditIn.String()},
			ListTransactionTypes{ID: (int)(CreditOut), Name: CreditOut.String()},
			ListTransactionTypes{ID: (int)(Play), Name: Play.String()},
		}
	}
	return listTransactionTypes
}

type ListTransactionTypes struct {
	ID   int    `json:"ID"`
	Name string `json:"name"`
}
