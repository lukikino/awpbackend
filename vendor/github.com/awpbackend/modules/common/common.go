package common

import (
	"reflect"
	"strings"
)

//permission enum
var (
	permissionEnum PermissionEnum
)

func GetStaticPermissions() PermissionEnum {
	if (PermissionEnum{}) == permissionEnum {
		permissionEnum = PermissionEnum{
			Accounting:      PermissionEnumAction{View: "active"},
			Operations:      PermissionEnumAction{View: "active"},
			Transactions:    PermissionEnumAction{View: "active"},
			MachineList:     PermissionEnumAction{View: "active", Create: "active", Edit: "active", Delete: "active"},
			MachineTransfer: PermissionEnumAction{View: "active", Edit: "active"},
			CoreUser:        PermissionEnumAction{View: "active", Create: "active", Edit: "active", Delete: "active"},
			Agency:          PermissionEnumAction{View: "active", Create: "active", Edit: "active", Delete: "active"},
			VersionSetting:  PermissionEnumAction{View: "active", Edit: "active"},
			JPStatus:        PermissionEnumAction{View: "active"},
			ReportJackpot:   PermissionEnumAction{View: "active"},
			ReportMachine:   PermissionEnumAction{View: "active"},
			ReportRevenue:   PermissionEnumAction{View: "active"},
		}
		v := reflect.ValueOf(&permissionEnum).Elem()
		// for i := 0; i < v.Elem().Type().NumField(); i++ {
		// 	v2 := v.Elem().Field(i)
		// 	for j := 0; j < v2.Type().NumField(); j++ {
		// 		if v2.Field(j).String() != "" {
		// 			v2.Field(j).SetString(strings.ToLower(v.Elem().Type().Field(i).Name) + "_" + strings.ToLower(v2.Type().Field(j).Name))
		// 		}
		// 	}
		// }
		for i := 0; i < v.Type().NumField(); i++ {
			v2 := v.Field(i)
			for j := 0; j < v2.Type().NumField(); j++ {
				if v2.Field(j).String() != "" {
					v2.Field(j).SetString(strings.ToLower(v.Type().Field(i).Name) + "_" + strings.ToLower(v2.Type().Field(j).Name))
				}
			}
		}
	}
	return permissionEnum
}

type PermissionEnum struct {
	Accounting      PermissionEnumAction `db:"accounting" json:"accounting,omitempty"`
	Operations      PermissionEnumAction `db:"operations" json:"operations,omitempty"`
	Transactions    PermissionEnumAction `db:"transactions" json:"transactions,omitempty"`
	MachineList     PermissionEnumAction `db:"machinelist" json:"machineList,omitempty"`
	MachineTransfer PermissionEnumAction `db:"machinetransfer" json:"machineTransfer,omitempty"`
	CoreUser        PermissionEnumAction `db:"coreuser" json:"coreUser,omitempty"`
	Agency          PermissionEnumAction `db:"agency" json:"agency,omitempty"`
	VersionSetting  PermissionEnumAction `db:"versionsetting" json:"versionSetting,omitempty"`
	JPStatus        PermissionEnumAction `db:"jpstatus" json:"jpStatus,omitempty"`
	ReportJackpot   PermissionEnumAction `db:"reportjackpot" json:"reportJackpot,omitempty"`
	ReportMachine   PermissionEnumAction `db:"reportmachine" json:"reportMachine,omitempty"`
	ReportRevenue   PermissionEnumAction `db:"reportrevenue" json:"reportRevenue,omitempty"`
}

type PermissionEnumAction struct {
	Create string `db:"create" json:"create,omitempty"`
	View   string `db:"view" json:"view,omitempty"`
	Edit   string `db:"edit" json:"edit,omitempty"`
	Delete string `db:"delete" json:"delete,omitempty"`
}

//contains
func Contains(slice []string, item string) bool {
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}
