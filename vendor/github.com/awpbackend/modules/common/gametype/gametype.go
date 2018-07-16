//go:generate stringer -type=GameType
//if modify const, run "go generate" in current floder
package gametype

type GameType int

// func (TransactionType) String() string

const (
	MainGame  GameType = 1
	FreeGame  GameType = 2
	FeverGame GameType = 3
	JPGame    GameType = 4
)

var listGameTypes []ListGameTypes

func GetGameTypes() []ListGameTypes {
	if listGameTypes == nil {
		listGameTypes = []ListGameTypes{
			ListGameTypes{ID: (int)(MainGame), Name: MainGame.String()},
			ListGameTypes{ID: (int)(FreeGame), Name: FreeGame.String()},
			ListGameTypes{ID: (int)(FeverGame), Name: FeverGame.String()},
		}
	}
	return listGameTypes
}

type ListGameTypes struct {
	ID   int    `json:"ID"`
	Name string `json:"name"`
}
