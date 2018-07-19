package models

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/awpbackend/modules/common/credittype"
	"github.com/awpbackend/modules/common/gametype"
	"github.com/awpbackend/modules/common/transactiontype"

	_ "github.com/go-sql-driver/mysql"
)

var adjectives = []string{"Black", "White", "Gray", "Brown", "Red", "Pink", "Crimson", "Carnelian", "Orange", "Yellow", "Ivory", "Cream", "Green", "Viridian", "Aquamarine", "Cyan", "Blue", "Cerulean", "Azure", "Indigo", "Navy", "Violet", "Purple", "Lavender", "Magenta", "Rainbow", "Iridescent", "Spectrum", "Prism", "Bold", "Vivid", "Pale", "Clear", "Glass", "Translucent", "Misty", "Dark", "Light", "Gold", "Silver", "Copper", "Bronze", "Steel", "Iron", "Brass", "Mercury", "Zinc", "Chrome", "Platinum", "Titanium", "Nickel", "Lead", "Pewter", "Rust", "Metal", "Stone", "Quartz", "Granite", "Marble", "Alabaster", "Agate", "Jasper", "Pebble", "Pyrite", "Crystal", "Geode", "Obsidian", "Mica", "Flint", "Sand", "Gravel", "Boulder", "Basalt", "Ruby", "Beryl", "Scarlet", "Citrine", "Sulpher", "Topaz", "Amber", "Emerald", "Malachite", "Jade", "Abalone", "Lapis", "Sapphire", "Diamond", "Peridot", "Gem", "Jewel", "Bevel", "Coral", "Jet", "Ebony", "Wood", "Tree", "Cherry", "Maple", "Cedar", "Branch", "Bramble", "Rowan", "Ash", "Fir", "Pine", "Cactus", "Alder", "Grove", "Forest", "Jungle", "Palm", "Bush", "Mulberry", "Juniper", "Vine", "Ivy", "Rose", "Lily", "Tulip", "Daffodil", "Honeysuckle", "Fuschia", "Hazel", "Walnut", "Almond", "Lime", "Lemon", "Apple", "Blossom", "Bloom", "Crocus", "Rose", "Buttercup", "Dandelion", "Iris", "Carnation", "Fern", "Root", "Branch", "Leaf", "Seed", "Flower", "Petal", "Pollen", "Orchid", "Mangrove", "Cypress", "Sequoia", "Sage", "Heather", "Snapdragon", "Daisy", "Mountain", "Hill", "Alpine", "Chestnut", "Valley", "Glacier", "Forest", "Grove", "Glen", "Tree", "Thorn", "Stump", "Desert", "Canyon", "Dune", "Oasis", "Mirage", "Well", "Spring", "Meadow", "Field", "Prairie", "Grass", "Tundra", "Island", "Shore", "Sand", "Shell", "Surf", "Wave", "Foam", "Tide", "Lake", "River", "Brook", "Stream", "Pool", "Pond", "Sun", "Sprinkle", "Shade", "Shadow", "Rain", "Cloud", "Storm", "Hail", "Snow", "Sleet", "Thunder", "Lightning", "Wind", "Hurricane", "Typhoon", "Dawn", "Sunrise", "Morning", "Noon", "Twilight", "Evening", "Sunset", "Midnight", "Night", "Sky", "Star", "Stellar", "Comet", "Nebula", "Quasar", "Solar", "Lunar", "Planet", "Meteor", "Sprout", "Pear", "Plum", "Kiwi", "Berry", "Apricot", "Peach", "Mango", "Pineapple", "Coconut", "Olive", "Ginger", "Root", "Plain", "Fancy", "Stripe", "Spot", "Speckle", "Spangle", "Ring", "Band", "Blaze", "Paint", "Pinto", "Shade", "Tabby", "Brindle", "Patch", "Calico", "Checker", "Dot", "Pattern", "Glitter", "Glimmer", "Shimmer", "Dull", "Dust", "Dirt", "Glaze", "Scratch", "Quick", "Swift", "Fast", "Slow", "Clever", "Fire", "Flicker", "Flash", "Spark", "Ember", "Coal", "Flame", "Chocolate", "Vanilla", "Sugar", "Spice", "Cake", "Pie", "Cookie", "Candy", "Caramel", "Spiral", "Round", "Jelly", "Square", "Narrow", "Long", "Short", "Small", "Tiny", "Big", "Giant", "Great", "Atom", "Peppermint", "Mint", "Butter", "Fringe", "Rag", "Quilt", "Truth", "Lie", "Holy", "Curse", "Noble", "Sly", "Brave", "Shy", "Lava", "Foul", "Leather", "Fantasy", "Keen", "Luminous", "Feather", "Sticky", "Gossamer", "Cotton", "Rattle", "Silk", "Satin", "Cord", "Denim", "Flannel", "Plaid", "Wool", "Linen", "Silent", "Flax", "Weak", "Valiant", "Fierce", "Gentle", "Rhinestone", "Splash", "North", "South", "East", "West", "Summer", "Winter", "Autumn", "Spring", "Season", "Equinox", "Solstice", "Paper", "Motley", "Torch", "Ballistic", "Rampant", "Shag", "Freckle", "Wild", "Free", "Chain", "Sheer", "Crazy", "Mad", "Candle", "Ribbon", "Lace", "Notch", "Wax", "Shine", "Shallow", "Deep", "Bubble", "Harvest", "Fluff", "Venom", "Boom", "Slash", "Rune", "Cold", "Quill", "Love", "Hate", "Garnet", "Zircon", "Power", "Bone", "Void", "Horn", "Glory", "Cyber", "Nova", "Hot", "Helix", "Cosmic", "Quark", "Quiver", "Holly", "Clover", "Polar", "Regal", "Ripple", "Ebony", "Wheat", "Phantom", "Dew", "Chisel", "Crack", "Chatter", "Laser", "Foil", "Tin", "Clever", "Treasure", "Maze", "Twisty", "Curly", "Fortune", "Fate", "Destiny", "Cute", "Slime", "Ink", "Disco", "Plume", "Time", "Psychadelic", "Relic", "Fossil", "Water", "Savage", "Ancient", "Rapid", "Road", "Trail", "Stitch", "Button", "Bow", "Nimble", "Zest", "Sour", "Bitter", "Phase", "Fan", "Frill", "Plump", "Pickle", "Mud", "Puddle", "Pond", "River", "Spring", "Stream", "Battle", "Arrow", "Plume", "Roan", "Pitch", "Tar", "Cat", "Dog", "Horse", "Lizard", "Bird", "Fish", "Saber", "Scythe", "Sharp", "Soft", "Razor", "Neon", "Dandy", "Weed", "Swamp", "Marsh", "Bog", "Peat", "Moor", "Muck", "Mire", "Grave", "Fair", "Just", "Brick", "Puzzle", "Skitter", "Prong", "Fork", "Dent", "Dour", "Warp", "Luck", "Coffee", "Split", "Chip", "Hollow", "Heavy", "Legend", "Hickory", "Mesquite", "Nettle", "Rogue", "Charm", "Prickle", "Bead", "Sponge", "Whip", "Bald", "Frost", "Fog", "Oil", "Veil", "Cliff", "Volcano", "Rift", "Maze", "Proud", "Dew", "Mirror", "Shard", "Salt", "Pepper", "Honey", "Thread", "Bristle", "Ripple", "Glow", "Zenith"}
var nouns = []string{"head", "crest", "crown", "tooth", "fang", "horn", "frill", "skull", "bone", "tongue", "throat", "voice", "nose", "snout", "chin", "eye", "sight", "seer", "speaker", "singer", "song", "chanter", "howler", "chatter", "shrieker", "shriek", "jaw", "bite", "biter", "neck", "shoulder", "fin", "wing", "arm", "lifter", "grasp", "grabber", "hand", "paw", "foot", "finger", "toe", "thumb", "talon", "palm", "touch", "racer", "runner", "hoof", "fly", "flier", "swoop", "roar", "hiss", "hisser", "snarl", "dive", "diver", "rib", "chest", "back", "ridge", "leg", "legs", "tail", "beak", "walker", "lasher", "swisher", "carver", "kicker", "roarer", "crusher", "spike", "shaker", "charger", "hunter", "weaver", "crafter", "binder", "scribe", "muse", "snap", "snapper", "slayer", "stalker", "track", "tracker", "scar", "scarer", "fright", "killer", "death", "doom", "healer", "saver", "friend", "foe", "guardian", "thunder", "lightning", "cloud", "storm", "forger", "scale", "hair", "braid", "nape", "belly", "thief", "stealer", "reaper", "giver", "taker", "dancer", "player", "gambler", "twister", "turner", "painter", "dart", "drifter", "sting", "stinger", "venom", "spur", "ripper", "swallow", "devourer", "knight", "lady", "lord", "queen", "king", "master", "mistress", "prince", "princess", "duke", "dutchess", "samurai", "ninja", "knave", "slave", "servant", "sage", "wizard", "witch", "warlock", "warrior", "jester", "paladin", "bard", "trader", "sword", "shield", "knife", "dagger", "arrow", "bow", "fighter", "bane", "follower", "leader", "scourge", "watcher", "cat", "panther", "tiger", "cougar", "puma", "jaguar", "ocelot", "lynx", "lion", "leopard", "ferret", "weasel", "wolverine", "bear", "raccoon", "dog", "wolf", "kitten", "puppy", "cub", "fox", "hound", "terrier", "coyote", "hyena", "jackal", "pig", "horse", "donkey", "stallion", "mare", "zebra", "antelope", "gazelle", "deer", "buffalo", "bison", "boar", "elk", "whale", "dolphin", "shark", "fish", "minnow", "salmon", "ray", "fisher", "otter", "gull", "duck", "goose", "crow", "raven", "bird", "eagle", "raptor", "hawk", "falcon", "moose", "heron", "owl", "stork", "crane", "sparrow", "robin", "parrot", "cockatoo", "carp", "lizard", "gecko", "iguana", "snake", "python", "viper", "boa", "condor", "vulture", "spider", "fly", "scorpion", "heron", "oriole", "toucan", "bee", "wasp", "hornet", "rabbit", "bunny", "hare", "brow", "mustang", "ox", "piper", "soarer", "flasher", "moth", "mask", "hide", "hero", "antler", "chill", "chiller", "gem", "ogre", "myth", "elf", "fairy", "pixie", "dragon", "griffin", "unicorn", "pegasus", "sprite", "fancier", "chopper", "slicer", "skinner", "butterfly", "legend", "wanderer", "rover", "raver", "loon", "lancer", "glass", "glazer", "flame", "crystal", "lantern", "lighter", "cloak", "bell", "ringer", "keeper", "centaur", "bolt", "catcher", "whimsey", "quester", "rat", "mouse", "serpent", "wyrm", "gargoyle", "thorn", "whip", "rider", "spirit", "sentry", "bat", "beetle", "burn", "cowl", "stone", "gem", "collar", "mark", "grin", "scowl", "spear", "razor", "edge", "seeker", "jay", "ape", "monkey", "gorilla", "koala", "kangaroo", "yak", "sloth", "ant", "roach", "weed", "seed", "eater", "razor", "shirt", "face", "goat", "mind", "shift", "rider", "face", "mole", "vole", "pirate", "llama", "stag", "bug", "cap", "boot", "drop", "hugger", "sargent", "snagglefoot", "carpet", "curtain"}

type transaction struct {
	PcbId              string
	RoundId            string
	CurrencyId         int
	MoneyToCreditRadio float64
	TransactionType    int
	StartCredit        int
	ResultCredit       int
	CreditIn           int
	CreditOut          int
	CreditType         int
	OriginalBet        int
	Bet                int
	Win                int
	Jp1Win             int
	Jp2Win             int
	Jp3Win             int
	Jp4Win             int
	GameType           int
	GameID             int
	Memo               string
	CreatedTime        string
}

func CreditIn(pcbid string, startcredit, num int, now time.Time) int {
	t := transaction{}
	t.PcbId = pcbid
	t.RoundId = strconv.FormatInt(now.Unix(), 10)
	t.CurrencyId = 1
	t.MoneyToCreditRadio = 100
	t.TransactionType = (int)(transactiontype.CreditIn)
	t.StartCredit = startcredit
	t.ResultCredit = startcredit + num
	t.CreditIn = num
	t.CreditOut = 0
	t.CreditType = []int{(int)(credittype.CoinIn), (int)(credittype.KeyIn), (int)(credittype.BillIn)}[rand.Intn(2)]
	t.Bet = 0
	t.Win = 0
	t.Jp1Win = 0
	t.Jp2Win = 0
	t.Jp3Win = 0
	t.Jp4Win = 0
	t.GameType = 0
	t.CreatedTime = now.UTC().Format(DatetimeFormat)
	t.GameID = rand.Intn(5) + 1
	t.Memo = "{\"gameName\":" + strconv.Itoa(t.GameID) + "}"
	SaveTransaction(&t)
	return startcredit + num
}

func CreditOut(pcbid string, startcredit int, now time.Time) int {
	t := transaction{}
	t.PcbId = pcbid
	t.RoundId = strconv.FormatInt(now.Unix(), 10)
	t.CurrencyId = 1
	t.MoneyToCreditRadio = 100
	t.TransactionType = (int)(transactiontype.CreditOut)
	t.StartCredit = startcredit
	t.ResultCredit = 0
	t.CreditIn = 0
	t.CreditOut = startcredit
	t.CreditType = []int{(int)(credittype.CoinOut), (int)(credittype.KeyOut), (int)(credittype.BillOut)}[rand.Intn(2)]
	t.Bet = 0
	t.Win = 0
	t.Jp1Win = 0
	t.Jp2Win = 0
	t.Jp3Win = 0
	t.Jp4Win = 0
	t.GameType = 0
	t.CreatedTime = now.UTC().Format(DatetimeFormat)
	t.GameID = rand.Intn(5) + 1
	t.Memo = "{\"gameName\":" + strconv.Itoa(t.GameID) + "}"
	SaveTransaction(&t)
	return 0
}

func BetAndPlay(t *transaction, startcredit, originalbet, bet, win, jp1Rate, jp2Rate, jp3Rate, jp4Rate, gametype int) int {
	t.StartCredit = startcredit
	t.CreditIn = 0
	t.CreditOut = 0
	t.CreditType = 0
	t.OriginalBet = originalbet
	t.Bet = bet
	t.Win = win
	t.Jp1Win = jp1Rate * originalbet
	t.Jp2Win = jp2Rate * originalbet
	t.Jp3Win = jp3Rate * originalbet
	t.Jp4Win = jp4Rate * originalbet
	t.ResultCredit = startcredit - bet + win + t.Jp1Win + t.Jp2Win + t.Jp3Win + t.Jp4Win
	t.GameType = gametype
	SaveTransaction(t)
	return t.ResultCredit
}

func getWinRate(v float32) float64 {
	w := rand.Intn(1000)
	p := 0.0
	switch {
	case w < (int)(0*v):
		p = 100
	case w < (int)(1*v):
		p = 50
	case w < (int)(3*v):
		p = 30
	case w < (int)(8*v):
		p = 10
	case w < (int)(16*v):
		p = 5
	case w < (int)(26*v):
		p = 2
	case w < (int)(46*v):
		p = 1
	case w < (int)(106*v):
		p = 0.8
	case w < (int)(176*v):
		p = 0.6
	case w < (int)(296*v):
		p = 0.4
	case w < (int)(500*v):
		p = 0.2
	default:
		p = 0.0
	}
	return p
}

func Play(pcbid string) int {
	t := transaction{}
	now := time.Now().Add(24 * 30 * time.Hour).Add(-time.Duration(rand.Intn(60*24*60)) * time.Minute)
	t.PcbId = pcbid
	t.CurrencyId = 1
	t.MoneyToCreditRadio = 100
	t.TransactionType = (int)(transactiontype.Play)
	t.GameID = rand.Intn(5) + 1
	t.Memo = "{\"gameName\":" + strconv.Itoa(t.GameID) + "}"
	resultcredit := 0
	resultcredit = CreditIn(pcbid, resultcredit, (rand.Intn(100)+50)*50, now)
	//main
	//play (99.9%) or creditout (0.1%)
	for count := 0; resultcredit > 0; count++ {
		now = now.Add(15 * time.Second)
		t.RoundId = strconv.FormatInt(now.Unix()+int64(count), 10)
		t.CreatedTime = now.UTC().Format(DatetimeFormat)
		if rand.Intn(1000) > 1 {
			bet := 50 * (rand.Intn(9) + 1)
			if resultcredit < bet {
				bet = resultcredit
			}
			//0.728
			resultcredit = BetAndPlay(&t, resultcredit, bet, bet, int(float64(bet)*getWinRate(1)), 0, 0, 0, 0, (int)(gametype.MainGame))
			// to free or bonus
			c := rand.Intn(100)
			switch {
			case c < 4: //3% to free
				for i := 0; i < 6; i++ {
					resultcredit = BetAndPlay(&t, resultcredit, bet, 0, int(float64(bet)*getWinRate(1)), 0, 0, 0, 0, (int)(gametype.FreeGame))
				}
			case c < 7: //2% to bonus
				times := 2
				for i := 0; i < 3; {
					jp1 := 0
					jp2 := 0
					jp3 := 0
					jp4 := 0
					if rand.Intn(1000000) < 10000 {
						jp4 = 20
					}
					if rand.Intn(1000000) < 1000 {
						jp3 = 100
					}
					if rand.Intn(1000000) < 5 {
						jp2 = 2000
					}
					if rand.Intn(1000000) < 1 {
						jp1 = 20000
					}
					resultcredit = BetAndPlay(&t, resultcredit, bet, 0, int(float64(bet)*getWinRate(1)), jp1, jp2, jp3, jp4, (int)(gametype.FeverGame))
					if rand.Intn(100) < (100 / (times)) {
						i = 0
						times = times * 2
					} else {
						i++
					}
				}
			case c < 15: //credit in (50~500)
				resultcredit = CreditIn(pcbid, resultcredit, (rand.Intn(10)+1)*50, now)
			}
		} else {
			CreditOut(pcbid, resultcredit, now)
			return 0
		}
	}
	return resultcredit
}
func SaveTransaction(t *transaction) {
	db := GetConnection()
	_, err := db.Exec("call sp_addTransaction(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", t.PcbId, t.RoundId, t.MoneyToCreditRadio, t.TransactionType, t.StartCredit, t.ResultCredit, t.CreditIn, t.CreditOut, t.CreditType, t.OriginalBet, t.Bet, t.Win, t.Jp1Win, t.Jp2Win, t.Jp3Win, t.Jp4Win, t.GameType, t.GameID, t.Memo, t.CreatedTime)
	if err != nil {
		fmt.Println(err)
	}
}
func GenTransactions(turns int) {
	data := GetMachines(2).Data
	machines := data.([]Machine)
	//gen transactions
	for i := 0; i < turns; i++ {
		pcbID := machines[rand.Intn(len(machines))].PCBID
		Play(pcbID)
	}
}

func GenFakeData() {
	rand.Seed(time.Now().UnixNano())
	//gen accounts
	lv1 := []int{}
	lv2 := []int{}
	lv3 := []int{}
	machines := []string{}
	r := ReturnData{}
	for i := 0; i < 2; i++ {
		r = AddUser(2, "", User{Account: adjectives[rand.Intn(len(adjectives))] + strconv.Itoa(rand.Intn(9999)), Password: "4e83fa81ba02535ddc5d7e2f9b6ee1055df21f306aeead80942e013a85a72f0cb203bc3a2cb39477689656566d1b6c419ad03e0df6ae7950c5964c00c1e539a3"}, true)
		lv1 = append(lv1, int(r.Data.(int64)))
		for j := 0; j < 2; j++ {
			r = AddUser(lv1[i], "", User{Account: adjectives[rand.Intn(len(adjectives))] + strconv.Itoa(rand.Intn(9999)), Password: "4e83fa81ba02535ddc5d7e2f9b6ee1055df21f306aeead80942e013a85a72f0cb203bc3a2cb39477689656566d1b6c419ad03e0df6ae7950c5964c00c1e539a3"}, false)
			lv2 = append(lv2, int(r.Data.(int64)))
			for k := 0; k < 2; k++ {
				r = AddUser(lv2[j], "", User{Account: adjectives[rand.Intn(len(adjectives))] + strconv.Itoa(rand.Intn(9999)), Password: "4e83fa81ba02535ddc5d7e2f9b6ee1055df21f306aeead80942e013a85a72f0cb203bc3a2cb39477689656566d1b6c419ad03e0df6ae7950c5964c00c1e539a3"}, false)
				lv3 = append(lv3, int(r.Data.(int64)))
			}
		}
	}

	//gen machines
	userid := 0
	for i := 0; i < 50; i++ {
		switch rand.Intn(2) {
		case 0:
			userid = lv1[rand.Intn(len(lv1))]
		case 1:
			userid = lv2[rand.Intn(len(lv2))]
		case 2:
			userid = lv3[rand.Intn(len(lv3))]
		}
		pcbID := rand.Intn(900000000) + 100000000
		r = AddMachine(2, Machine{PCBID: strconv.Itoa(pcbID), UserID: userid, MachineName: nouns[rand.Intn(len(nouns))], StoreName: nouns[rand.Intn(len(nouns))]})
		machines = append(machines, strconv.Itoa(pcbID))
	}
	//gen transactions
	for i := 0; i < 20000; i++ {
		pcbID := machines[rand.Intn(len(machines))]
		Play(pcbID)
	}
}
