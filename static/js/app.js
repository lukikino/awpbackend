const getTemplate = function (path, component, permission) {
    return Vue.component(path.replace(/\//ig, '_'), function (resolve, reject) {
        var func = function () {
            if (!app) {
                setTimeout(func, 20);
                return;
            }
            app.getUserStatus(function () {
                if (this.chkPermission(permission)) {
                    Vue.http.get('/static/views/' + path + '.html?v=' + Math.random()).then(function (r) {
                        component.template = r.body;
                        component.delimiters = ['{/', '/}'];
                        resolve(component);
                    })
                }
                else {
                    throw new Error();
                }
            });
        };
        setTimeout(func, 20);
    });
}

var fakeData = { items: [] };
var fakeDataTotal = {};
for (var i = 1; i < 60; i++) {
    var item = {
        date: '2018/5/22',
        account: 'peter' + Math.floor(Math.random() * 10),
        storeName: 'Jungle' + Math.floor(Math.random() * 10),
        machineId: Math.floor(Math.random() * 10000000000),
        machineName: 'desert' + i,
        in: 998512 * i,
        out: 555222 * i,
        outRate: 555222 / 998512 * 100,
        bet: 458210 * i,
        win: 225895 * i,
        winRate: 225895 / 458210 * 100,
        playTimes: 7852 * i,
        winTimes: 5846 * i,
        hitRate: 5848 / 7855 * 100,
        time: '2018/5/22 20:20',
        avgBet: Math.floor(458210 / 7855)
    };
    fakeData.items.push(
        item
    );
    fakeDataTotal.in = (fakeDataTotal.in || 0) + item.in;
    fakeDataTotal.out = (fakeDataTotal.out || 0) + item.out;
    fakeDataTotal.bet = (fakeDataTotal.bet || 0) + item.bet;
    fakeDataTotal.win = (fakeDataTotal.win || 0) + item.win;
    fakeDataTotal.playTimes = (fakeDataTotal.playTimes || 0) + item.playTimes;
    fakeDataTotal.winTimes = (fakeDataTotal.winTimes || 0) + item.winTimes;
}
fakeDataTotal.outRate = fakeDataTotal.out / fakeDataTotal.in * 100;
fakeDataTotal.winRate = fakeDataTotal.win / fakeDataTotal.bet * 100;
fakeDataTotal.hitRate = fakeDataTotal.winTimes / fakeDataTotal.playTimes * 100;

var fakeTransactions = { items: [] };
for (var i = 1; i < 60; i++) {
    var item = {
        storeName: 'Jungle' + Math.floor(Math.random() * 10),
        machineId: Math.floor(Math.random() * 10000000000),
        machineName: 'desert' + i,
        transactionType: ['Play', 'Coin in'][Math.floor(Math.random() * 2)],
        gameType: ['Main Game', 'Free Game', 'Bonus Game'][Math.floor(Math.random() * 3)],
        startCredit: 99589,
        endCredit: 75882,
        in: 998512 * i,
        out: 555222 * i,
        bet: 458210 * i,
        win: 225895 * i,
        jpWin: 0,
        description: 'Game1',
        startSymbols: [1, 5, 8, 7, 9, 2, 10, 5, 7, 8, 10, 5, 9, 8, 6],
        resultSymbols: [1, 5, 8, 7, 9, 2, 10, 5, 7, 8, 10, 5, 9, 8, 6],
        ID: '215899545201',
        time: '2018/5/22 20:20:18'
    };
    fakeTransactions.items.push(item);
}

var fakeMachines = { items: [] };
for (var i = 1; i < 60; i++) {
    var item = {
        machineId: Math.floor(Math.random() * 10000000000),
        storeName: 'Jungle' + Math.floor(Math.random() * 10),
        machineName: 'Dialbo' + Math.floor(Math.random() * 10),
        status: [0, 1][Math.floor(Math.random() * 2)],
        lastConnectTime: '2018/5/2 21:00:58',
        currentVersion: '1.0.0.0',
        targetVersion: '1.1.0.0',
        id: 123456
    };
    fakeMachines.items.push(item);
}
var fakeAccounts = { items: [] };
for (var i = 1; i < 60; i++) {
    var item = {
        account: Math.floor(Math.random() * 10000000000),
        status: Math.floor(Math.random() * 3) + 1,
        createTime: '2020/5/5 12:55:12',
        id: 123456
    };
    fakeAccounts.items.push(item);
}

var ComponentBase = {
    data: function () {
        return {
        }
    },
    methods: {
        thousandFormat: function (v) {
            v = v || 0;
            v = Math.floor(v);
            return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        percentageFormat: function (v) {
            if (v === null || isNaN(v) || v === Infinity)
                return "-";
            v = v || 0;
            return v.toFixed(2) + "%";
        },
        determineSearchString: function (items, determineKey) {
            if (!items || !items.map) { return null; }
            var len = items.length;
            var checkedList = items.filter(function (item) { return item[determineKey] == true; })
                .map(function (item) { return item["id"]; });
            return (checkedList.length === len) ? null : checkedList.join(",");
        },
        getLists: function (cb) {
            var vm = this;
            if (vm._listData) { cb && typeof cb === "function" && cb.call(vm, vm._listData); return; }
            if (vm._listQueueProcessing) { setTimeout(function () { vm.getLists(cb); }, 50); return; } //ajax is processing, wait 50ms and run again
            vm._listQueueProcessing = true;
            Vue.http.get("/api/common/list/all").then(function (res) {
                if (res.body.code == 200) {
                    vm._listData = res.body.data;
                    cb.call(vm, vm._listData);
                }
            }).catch(app.handlerError);
        }
    }
};

var PageBase = {
    mixins: [ComponentBase],
    data: function () {
        return {
            loading: false, //controll loading/processing/change page etc.
            users: {
                type: "Account",
                items: []
            },
            stores: {
                type: "Store",
                items: []
            },
            machines: {
                type: "Machine",
                items: []
            }
        }
    },
    watch: {
        '$route': function (route) {
            this.loading = true;
            setTimeout(function () {
                this.loading = false;
            }, 200);
            if (typeof this.resetParams === "function") { this.resetParams(); }
        }
    },
    methods: {
        resetParams: function () {
            this.loading = false;
        }
    },
    created: function () {
        var vm = this;
        vm.getLists(function (data) {
            Vue.set(vm.users, "items", data.users.map(function (item) { return { checked: true, id: item.userID, text: item.account } }));
            Vue.set(vm.machines, "items", data.machines.map(function (item) { return { checked: true, id: item.pcbID, text: item.pcbID + "(" + item.machineName + ")" } }));
            Vue.set(vm.stores, "items", data.stores.map(function (item) { return { checked: true, id: item, text: item } }));
        });
    }
}

Vue.component('dropdown', {
    delimiters: ['{/', '/}'],
    template: '#dropdown',
    props: ['items', 'defaultCheckAll', 'onChanging', 'onChanged'],
    data: function () {
        return {
            show: false,
            uniqeID: Math.floor(Math.random() * 100000000, 0)
        }
    },
    computed: {
        selectedLength: function () {
            return this.items.items.filter(function (v) { return v.checked == true; }).length
        },
        allChecked: function () {
            return !this.items.items || this.selectedLength == this.items.items.length;
        },
        buttonText: function () {
            if (this.allChecked)
                return ['All ', this.items.type, 's'].join('');
            else
                return [(this.selectedLength > 0 ? this.selectedLength : ''), ' ', this.items.type, (this.selectedLength > 1 || this.selectedLength === 0 ? 's' : '')].join('');
        }
    },
    watch: {
        show: function (cur, pre) {
            if (!cur) { //close
                if (typeof this.onChanged === "function") {
                    this.onChanged();
                }
            }
        }
    },
    methods: {
        domId: function (id) {
            return this.uniqeID + this.items.type + id;
        },
        checkAll: function () {
            for (var index in this.items.items) {
                Vue.set(this.items.items[index], "checked", true);
            }
        },
        uncheckAll: function () {
            for (var index in this.items.items) {
                Vue.set(this.items.items[index], "checked", false);
            }
        },
        toggle: function () {
            this.show = !this.show;
        },
        documentClick: function (e) {
            var el = this.$refs.dropdownMenu;
            var target = e.target;
            if ((el !== target) && !el.contains(target)) {
                this.show = false;
            }
        }
    },
    mounted: function () {
        document.addEventListener('click', this.documentClick);
    },
    destroyed: function () {
        document.removeEventListener('click', this.documentClick);
    }
});

Vue.component('treemenu', {
    delimiters: ['{/', '/}'],
    template: '#treemenu',
    props: {
        'label': [String, Number],
        'nodes': {
            type: Object,
            default: Object
        },
        'checkList': {
            type: Object,
            default: Object
        },
        'depth': Number,
        'machine': Object,
        'onlyAccount': Boolean,
        'extendLevel': Number,
        'uniqueID': {
            type: String,
            default: Math.random().toString()
        }
    },
    data: function () {
        return { 
            inited: false
        }
    },
    watch: {
        nodes: function () {
            if (this.depth < (this.extendLevel || 0) && !this.inited) {
                Vue.set(this.nodes, 'show', true);
                Vue.set(this.checkList, 'account', 0);
                Vue.set(this.checkList, 'machines', {});
                this.inited = true;
            }
        }
    },
    computed: {
        labelClasses: function () {
            return { 'has-children': this.children }
        },
        iconClasses: function () {
            return {
                'far fa-plus-square': !this.showChildren,
                'far fa-minus-square': this.showChildren
            }
        },
        indent: function () {
            return { transform: `translate(${this.depth * 50}px)` }
        },
        showChildren: function () {
            Vue.set(this.nodes, 'show', !!this.nodes.show);
            return this.nodes.show;
        }
    },
    methods: {
        toggleChildren: function () {
            this.nodes.show = !this.nodes.show;
        },
        toggleMachineSelect: function (value) {
            if (value) {
                var machine = value;
                Vue.set(machine, 'owner', machine.owner.account);
                Vue.set(this.checkList.machines, machine.machineID, machine);
            }
        },
        toggleAccountSelect: function (value) {
            if (value) {
                Vue.set(this.checkList, 'account', value);
            }
        },
        toggleSelectChildren: function (value) {
            var check = value;
            var recurciveCheck = function (node, checkList) {
                Vue.set(node, 'checked', check);
                Vue.set(node, 'show', check);
                for (var key in node.machines) {
                    Vue.set(node.machines[key], 'checked', check);
                    Vue.set(node.machines[key], 'owner', node.account);
                    var machineID = node.machines[key].machineID;
                    if (check) {
                        Vue.set(checkList.machines, machineID, node.machines[key]);
                    }
                    else if (!check) {
                        Vue.set(checkList.machines, machineID, false);
                    }
                }
                for (var key in node.children) {
                    recurciveCheck(node.children[key], checkList);
                }
            };
            recurciveCheck(this.nodes, this.checkList);
        }
    },
    created: function () {
        Vue.set(this.checkList, 'machines', this.checkList.machines || {});
    }
});

Vue.component('pagination', {
    delimiters: ['{/', '/}'],
    template: '#pagination',
    props: ['data', 'dataChanged', 'unit', 'currentPage', 'changePage'],
    data: function () {
        return {
            inputPage: ""
        }
    },
    computed: {
        showPages: function () {
            var start = 1, end = 1, result = [];
            if (this.currentPage < 5) {
                start = 1;
                end = Math.min(9, this.totalPage);
            }
            else if (this.currentPage > this.totalPage - 5) {
                start = Math.min(Math.max(this.totalPage - 9, 1), this.totalPage);
                end = this.totalPage;
            }
            else {
                start = this.currentPage - 4;
                end = this.currentPage + 4;
            }
            for (; start <= end; start++) {
                result.push(start);
            }
            return result;
        },
        totalPage: function () {
            if (!this.data) { return 0; }
            return Math.ceil(this.data.length / this.unit);
        },
        startRow: function () {
            if (!this.data) { return 0; }
            var s = (this.currentPage - 1) * this.unit;
            if (this.data.length < s)
                s = this.data.length - 1;
            return s;
        },
        endRow: function () {
            if (!this.data) { return 0; }
            var e = this.currentPage * this.unit;
            if (this.data.length < e)
                e = this.data.length;
            return e;
        },
        viewData: function () {
            if (!this.data) { return; }
            var start = this.startRow;
            var end = this.endRow;
            var newDataView = this.data.slice(start, end);
            if (typeof this.dataChanged === "function") { this.dataChanged(newDataView); }
            return newDataView;
        }
    },
    methods: {
        chkPageCurrent: function (page) {
            return this.currentPage != page || 'current';
        },
        _changePage: function (page) {
            if (typeof this.changePage === "function")
                this.changePage(page);
        },
        fastGoto: function () {
            if (+this.inputPage === this.currentPage) return;
            this.inputPage = (+this.inputPage) || 1;
            this.inputPage = Math.min(this.inputPage, this.totalPage);
            this.inputPage = Math.max(this.inputPage, 1);
            this._changePage(this.inputPage);
            this.inputPage = "";
        },
        keydown: function (e) {
            if (e.keyCode === 13) {
                this.fastGoto();
            }
        }
    },
    mounted: function () {

    }
});

const Home = {
    mixins: [PageBase],
    data: function () {
        var seriesColumns = ["totalIn", "totalOut", "totalBet", "totalWin", "totalJpWin", "totalPlayTimes", "totalWinTimes"];
        return {
            loadingTop1: false,
            loadingTop2: false,
            loadingTop3: false,
            loadingMain: false,
            searched: false,
            summaryData: {
                today: {
                },
                yesterday: {
                },
                wtd: {
                },
                mtd: {
                }
            },
            topGrossNet: {
                items: [
                    {
                        storeName: '-',
                        machine: '-',
                        value: 0
                    }
                ]
            },
            topPlaytimes: {
                items: [
                    {
                        storeName: '-',
                        machine: '-',
                        value: 0
                    }
                ]
            },
            topWin: {
                items: [
                    {
                        storeName: '-',
                        machine: '-',
                        value: 0
                    }
                ]
            },
            seriesColumns: seriesColumns,
            reportData:[],
            summaryReportData: {},
            summarySeriesData: {},
            summaryChart: null
        }
    },
    watch: {
        '$route': function (route) {
            this.loadingMain = true;
            setTimeout(() => {
                this.loadingMain = false;
            }, 300);
            this.resetParams();
        }
    },
    computed: {
    },
    methods: {
        resetParams: function () {
            this.searched = false;
            this.currentPage = 1;
            this.reportData = [];
            this.summaryChart && this.summaryChart.hasRendered && this.summaryChart.destroy && this.summaryChart.destroy();//reset chart
        },
        search: function(){
            var vm = this;
            vm.loadingMain = true;
            vm.loadingTop1 = true;
            vm.loadingTop2 = true;
            vm.loadingTop3 = true;
            vm.searched = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked")
            };
            Vue.http.post('/api/index/dashboard', search).then(function (res) {
                vm.summaryData.today = res.body.data[0] || {};
                vm.summaryData.yesterday = res.body.data[1] || {};
                vm.summaryData.wtd = res.body.data[2] || {};
                vm.summaryData.mtd = res.body.data[3] || {};
                vm.loadingMain = false;
            }).catch(app.handlerError);

            Vue.http.post('/api/index/topgrossnet', search).then(function (res) {
                vm.loadingTop1 = false;
                vm.topGrossNet.items = res.body;
            }).catch(app.handlerError);

            Vue.http.post('/api/index/topplaytimes', search).then(function (res) {
                vm.loadingTop2 = false;
                vm.topPlaytimes.items = res.body;
            }).catch(app.handlerError);

            Vue.http.post('/api/index/topwin', search).then(function (res) {
                vm.loadingTop3 = false;
                vm.topWin.items = res.body;
            }).catch(app.handlerError);
            vm.getOperationData();
        },
        getOperationData: function () {
            var vm = this;
            var timezoneOffset = new Date().getTimezoneOffset();
            vm.loadingChart = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked"),
                groupBy: 'machine',
                groupInterval: 'day',
                startTime: Utils.date.todayEnd().addMonths(-1).toString('yyyy/M/d'),
                endTime: Utils.date.todayEnd().toString('yyyy/M/d')
            };
            Vue.http.post('/api/operations', search).then(function (res) {
                vm.reportData = (res.body.data) ? res.body.data.operations : [];
                vm.summaryReportData = (res.body.data) ? res.body.data.summary : [];
                vm.loadingChart = false;
                vm.prepareReportData();
                vm.drawSummaryChart();
            }).catch(app.handlerError);
        },
        prepareReportData: function () {
            var columnsRegex = new RegExp("^(" + this.seriesColumns.join("|") + ")$");
            var data = {};
            //used for forLoop
            var dataSetSummary = {};
            var dataSetGroup = {};
            var singleRow = {};
            var seriesData = {};
            var dateData = {};
            var singleData;
            var machineKey;
            var item;
            for (var index in this.reportData) {
                item = this.reportData[index];
                //group data by user selected
                machineKey = item.pcbID + "(" + item.machineName + ")";
                singleData = data[machineKey] = data[machineKey] || {};
                for (var key in item) {
                    if (!columnsRegex.test(key)) {
                        continue;
                    }
                    var d = new Date(item.date).getTime();
                    singleData[key] = singleData[key] || {};
                    if (!singleData[key][d]) {
                        singleData[key][d] = 0;
                    }
                    singleData[key][d] += Number(item[key]);
                }
            }

            for (var singleRowKey in data) {
                //single row (already Group)
                singleRow = data[singleRowKey];
                //init data(group)
                if (!dataSetGroup[singleRowKey]) { dataSetGroup[singleRowKey] = {}; }
                for (var seriesColumnKey in singleRow) {
                    //series column
                    seriesData = singleRow[seriesColumnKey];
                    //init data(group)
                    if (!dataSetGroup[singleRowKey][seriesColumnKey]) { dataSetGroup[singleRowKey][seriesColumnKey] = []; }
                    //init data(summary)
                    if (!dataSetSummary[seriesColumnKey]) { dataSetSummary[seriesColumnKey] = {}; }
                    for (var dateKey in seriesData) {
                        //date key is number(time.getTime())
                        //result like {"group": {totalIn: [[10524885, 999],[10524885, 777]]} }
                        dataSetGroup[singleRowKey][seriesColumnKey].push([+dateKey, seriesData[dateKey]]);

                        //result like {totalIn: [[10524885, 999],[10524885, 777]] ...}
                        if (!dataSetSummary[seriesColumnKey][dateKey]) {
                            dataSetSummary[seriesColumnKey][dateKey] = 0;
                        }
                        dataSetSummary[seriesColumnKey][dateKey] += seriesData[dateKey];
                    }
                }
            }
            this.groupSeriesData = dataSetGroup;
            this.summarySeriesData = dataSetSummary;
        },
        genratorChart: function (el, series, legend) {
            var vm = this;
            return Highcharts.chart(el, {
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: 'Credits Run chart'
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value:%Y/%m/%d}',
                        rotation: -50,
                        y: 33,
                        align: 'center',
                        step: 1
                    }
                },
                yAxis: {
                    title: {
                        text: 'Credits'
                    }
                },
                legend: {
                    enabled: true
                },
                plotOptions: {
                    spline: {
                        marker: {
                            radius: 1,
                            enabled: null
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 3
                            }
                        },
                        threshold: null
                    }
                },
                series: series
            }, function () {
            });
        },
        drawSummaryChart: function () {
            var series = [];
            var seriesContent = [];
            var singleSummaryData;
            for (var key in this.summarySeriesData) {
                singleSummaryData = this.summarySeriesData[key];
                seriesContent = [];
                for (var date in singleSummaryData) {
                    seriesContent.push([+date, singleSummaryData[date]]);
                }
                seriesContent.sort(function (a, c) { return a[0] - c[0]; });
                series.push({
                    type: 'spline',
                    name: key,
                    tooltip: {
                        xDateFormat: '%Y/%m/%d'
                    },
                    data: seriesContent
                });
            }
            this.summaryCart = this.genratorChart(this.$refs.summaryChart, series);
        }
    },
    created: function () {
        var vm = this;
        vm.search();
    },
    mounted: function () {
    }
};

const Operations = {
    mixins: [PageBase],
    data: function () {
        var seriesColumns = ["totalIn", "totalOut", "totalBet", "totalWin", "totalJpWin", "totalPlayTimes", "totalWinTimes"];
        return {
            datePickerOptions: { format: 'YYYY/MM/DD' }, //datetime picker options
            searchData: { groupInterval: 'day', groupBy: 'machine', startTime: Utils.date.yesterdayStart().toString('yyyy/M/d'), endTime: Utils.date.yesterdayStart().toString('yyyy/M/d') },
            reportData: [],
            summaryReportData: {},
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            groupSeriesData: {},
            groupChart: null,
            summarySeriesData: {},
            summaryChart: null,
            seriesColumns: seriesColumns,
            showGroupChart: false,
            columnsForReport: {
                type: "Column",
                items: seriesColumns.map(function (item) { return { checked: item === "totalIn", id: item, text: item } })
            },
            usersForReport: {
                type: "Account",
                items: []
            },
            storesForReport: {
                type: "Store",
                items: []
            },
            machinesForReport: {
                type: "Machine",
                items: []
            }
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.showGroupChart = false;
            this.searchData.groupInterval = /([A-Za-z\d]+)(\/*|)$/i.exec(this.$route.fullPath)[0];
            this.groupChart && this.groupChart.hasRendered && this.groupChart.destroy && this.groupChart.destroy();//reset chart
            this.summaryChart && this.summaryChart.hasRendered && this.summaryChart.destroy && this.summaryChart.destroy();//reset chart
            this.searchData.endTime = Utils.date.yesterdayStart().toString('yyyy/M/d');
            switch (this.searchData.groupInterval) {
                case 'day':
                    this.searchData.startTime = Utils.date.yesterdayStart().toString('yyyy/M/d');
                    break;
                case 'week':
                    this.searchData.startTime = Utils.date.weekStart().toString('yyyy/M/d');
                    break;
                case 'month':
                    this.searchData.startTime = Utils.date.monthStart().toString('yyyy/M/d');
                    break;
            }
            PageBase.methods.resetParams.call(this);
        },
        changeGroup: function (group) {
            this.searchData.groupBy = group;
            this.search();
        },
        chkGroup: function (group) {
            return group != this.searchData.groupBy || 'active';
        },
        search: function () {
            var vm = this;
            var timezoneOffset = new Date().getTimezoneOffset();
            vm.loading = true;
            vm.searched = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                machines: vm.determineSearchString(vm.machines.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked"),
                groupBy: vm.searchData.groupBy,
                startTime: Utils.date.getDayStart(vm.searchData.startTime),
                endTime: Utils.date.getDayEnd(vm.searchData.endTime),
                groupInterval: vm.searchData.groupInterval
            };
            Vue.http.post('/api/operations', search).then(function (res) {
                vm.reportData = (res.body.data) ? res.body.data.operations : [];
                vm.summaryReportData = (res.body.data) ? res.body.data.summary : [];
                vm.loading = false;
                vm.prepareReportData();
                vm.drawSummaryChart();
                vm.updateGroupChartFilters();
                if (vm.showGroupChart) {
                    vm.drawGroupChart();
                }
            }).catch(app.handlerError);
        },
        prepareReportData: function () {
            var columnsRegex = new RegExp("^(" + this.seriesColumns.join("|") + ")$");
            var data = {};
            //used for forLoop
            var dataSetSummary = {};
            var dataSetGroup = {};
            var singleRow = {};
            var seriesData = {};
            var dateData = {};
            var singleData;
            var machineKey;
            var item;
            for (var index in this.reportData) {
                item = this.reportData[index];
                //group data by user selected
                machineKey = item.pcbID + "(" + item.machineName + ")";
                switch (this.searchData.groupBy) {
                    case 'machine':
                        singleData = data[machineKey] = data[machineKey] || {};
                        break;
                    case 'user':
                        singleData = data[item.account] = data[item.account] || {};
                        break;
                    case 'storename':
                        singleData = data[item.storeName] = data[item.storeName] || {};
                        break;
                }
                for (var key in item) {
                    if (!columnsRegex.test(key)) {
                        continue;
                    }
                    var d = new Date(item.date).getTime();
                    singleData[key] = singleData[key] || {};
                    if (!singleData[key][d]) {
                        singleData[key][d] = 0;
                    }
                    singleData[key][d] += Number(item[key]);
                }
            }

            for (var singleRowKey in data) {
                //single row (already Group)
                singleRow = data[singleRowKey];
                //init data(group)
                if (!dataSetGroup[singleRowKey]) { dataSetGroup[singleRowKey] = {}; }
                for (var seriesColumnKey in singleRow) {
                    //series column
                    seriesData = singleRow[seriesColumnKey];
                    //init data(group)
                    if (!dataSetGroup[singleRowKey][seriesColumnKey]) { dataSetGroup[singleRowKey][seriesColumnKey] = []; }
                    //init data(summary)
                    if (!dataSetSummary[seriesColumnKey]) { dataSetSummary[seriesColumnKey] = {}; }
                    for (var dateKey in seriesData) {
                        //date key is number(time.getTime())
                        //result like {"group": {totalIn: [[10524885, 999],[10524885, 777]]} }
                        dataSetGroup[singleRowKey][seriesColumnKey].push([+dateKey, seriesData[dateKey]]);

                        //result like {totalIn: [[10524885, 999],[10524885, 777]] ...}
                        if (!dataSetSummary[seriesColumnKey][dateKey]) {
                            dataSetSummary[seriesColumnKey][dateKey] = 0;
                        }
                        dataSetSummary[seriesColumnKey][dateKey] += seriesData[dateKey];
                    }
                }
            }
            this.groupSeriesData = dataSetGroup;
            this.summarySeriesData = dataSetSummary;
        },
        genratorChart: function (el, series, legend) {
            var vm = this;
            vm.loading = true;
            return Highcharts.chart(el, {
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: 'Credits Run chart'
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value:%Y/%m/%d}',
                        rotation: -50,
                        y: 33,
                        align: 'center',
                        step: 1
                    }
                },
                yAxis: {
                    title: {
                        text: 'Credits'
                    }
                },
                legend: {
                    enabled: true
                },
                plotOptions: {
                    spline: {
                        marker: {
                            radius: 1,
                            enabled: null
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 3
                            }
                        },
                        threshold: null
                    }
                },
                series: series
            }, function () {
                vm.loading = false;
            });
        },
        updateGroupChartFilters: function () {
            switch (this.searchData.groupBy) {
                case 'machine':
                    Vue.set(this.machinesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'user':
                    Vue.set(this.usersForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'storename':
                    Vue.set(this.storesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: (item === "") ? "-" : item }; }));
                    break;
            }
        },
        updateGroupChart: function () {
            if (!this.groupChart || !this.groupChart.hasRendered) { return; }
            this.drawGroupChart();
        },
        drawGroupChart: function () {
            var vm = this;
            var series = [];
            var checkedGroups = [];
            var _tempGroups = null;
            var _tempColumns = null;
            switch (this.searchData.groupBy) {
                case 'machine':
                    _tempGroups = vm.determineSearchString(vm.machinesForReport.items, "checked");
                    break;
                case 'user':
                    _tempGroups = vm.determineSearchString(vm.usersForReport.items, "checked");
                    break;
                case 'storename':
                    _tempGroups = vm.determineSearchString(vm.storesForReport.items, "checked");
                    break;
            }
            checkedGroups = _tempGroups && _tempGroups.split(",").toObject();
            _tempColumns = vm.determineSearchString(vm.columnsForReport.items, "checked");
            var checkedColumns = _tempColumns && _tempColumns.split(",").toObject();
            //used for forLoop
            var singleRow = {};
            for (var groupKey in this.groupSeriesData) {
                if (checkedGroups !== null && !checkedGroups[groupKey]) {
                    continue;
                }
                singleRow = this.groupSeriesData[groupKey];
                for (var columnKey in singleRow) {
                    if (checkedColumns !== null && !checkedColumns[columnKey]) {
                        continue;
                    }
                    series.push({
                        type: 'spline',
                        name: [columnKey, "(", groupKey, ")"].join(""),
                        tooltip: {
                            xDateFormat: '%Y/%m/%d'
                        },
                        data: singleRow[columnKey]
                    });
                }
            }
            this.groupChart = this.genratorChart(this.$refs.groupChart, series, false);
            this.showGroupChart = true;
            // } else {
            //     console.log(series)
            //     // this.groupChart.series = series;
            // }
            //use report data init filter dropdown
        },
        drawSummaryChart: function () {
            var vm = this;
            var series = [];
            var seriesContent = [];
            var singleSummaryData;
            for (var key in this.summarySeriesData) {
                singleSummaryData = this.summarySeriesData[key];
                seriesContent = [];
                for (var date in singleSummaryData) {
                    seriesContent.push([+date, singleSummaryData[date]]);
                }
                series.push({
                    type: 'spline',
                    name: key,
                    tooltip: {
                        xDateFormat: '%Y/%m/%d'
                    },
                    data: seriesContent
                });
            }
            this.summaryCart = this.genratorChart(this.$refs.summaryChart, series);
        }
    },
    created: function () {
        this.resetParams();
    },
    mounted: function () {

    }
};

const Accounting = {
    mixins: [PageBase],
    data: function () {
        var seriesColumns = ["totalIn", "totalOut", "totalBet", "totalWin", "totalJpWin", "totalPlayTimes", "totalWinTimes"];
        return {
            options: {},
            searchData: { timeRange: "10", groupBy: 'machine', startTime: Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss'), endTime: Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss') },
            reportData: [],
            summaryReportData: {},
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            seriesColumns: seriesColumns,
            showGroupChart: false,
            columnsForReport: {
                type: "Column",
                items: seriesColumns.map(function (item) { return { checked: item === "totalIn", id: item, text: item } })
            },
            usersForReport: {
                type: "Account",
                items: []
            },
            storesForReport: {
                type: "Store",
                items: []
            },
            machinesForReport: {
                type: "Machine",
                items: []
            }
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.showGroupChart = false;
            this.searchData.groupBy = /([A-Za-z\d]+)(\/*|)$/i.exec(this.$route.fullPath)[0];
            this.groupChart && this.groupChart.hasRendered && this.groupChart.destroy && this.groupChart.destroy();//reset chart
            this.summaryChart && this.summaryChart.hasRendered && this.summaryChart.destroy && this.summaryChart.destroy();//reset chart
            this.searchData.startTime = Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss');
            this.searchData.endTime = Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss');
            PageBase.methods.resetParams.call(this);
        },
        changeGroup: function (group) {
            this.searchData.groupBy = group;
            this.search();
        },
        chkGroup: function (group) {
            return group != this.searchData.groupBy || 'active';
        },
        search: function () {
            var vm = this;
            var timezoneOffset = new Date().getTimezoneOffset();
            vm.loading = true;
            vm.searched = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                machines: vm.determineSearchString(vm.machines.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked"),
                groupBy: vm.searchData.groupBy,
                timeRange: vm.searchData.timeRange,
                startTime: vm.searchData.startTime,
                endTime: vm.searchData.endTime
            };
            Vue.http.post('/api/accountings', search).then(function (res) {
                vm.reportData = (res.body.data) ? res.body.data.accountings : [];
                vm.summaryReportData = (res.body.data) ? res.body.data.summary : [];
                vm.loading = false;
                vm.prepareReportData();
                vm.drawSummaryChart();
                vm.updateGroupChartFilters();
                if (vm.showGroupChart) {
                    vm.drawGroupChart();
                }
            }).catch(app.handlerError);
        },
        prepareReportData: function () {
            var columnsRegex = new RegExp("^(" + this.seriesColumns.join("|") + ")$");
            var data = {};
            //used for forLoop
            var dataSetSummary = {};
            var dataSetGroup = {};
            var singleRow = {};
            var seriesData = {};
            var dateData = {};
            var singleData;
            var machineKey;
            var item;
            for (var index in this.reportData) {
                item = this.reportData[index];
                //group data by user selected
                machineKey = item.pcbID + "(" + item.machineName + ")";
                switch (this.searchData.groupBy) {
                    case 'machine':
                        singleData = data[machineKey] = data[machineKey] || {};
                        break;
                    case 'user':
                        singleData = data[item.account] = data[item.account] || {};
                        break;
                    case 'storename':
                        singleData = data[item.storeName] = data[item.storeName] || {};
                        break;
                }
                for (var key in item) {
                    if (!columnsRegex.test(key)) {
                        continue;
                    }
                    var d = new Date(item.rangeEndTime).getTime();
                    singleData[key] = singleData[key] || {};
                    if (!singleData[key][d]) {
                        singleData[key][d] = 0;
                    }
                    singleData[key][d] += Number(item[key]);
                }
            }

            for (var singleRowKey in data) {
                //single row (already Group)
                singleRow = data[singleRowKey];
                //init data(group)
                if (!dataSetGroup[singleRowKey]) { dataSetGroup[singleRowKey] = {}; }
                for (var seriesColumnKey in singleRow) {
                    //series column
                    seriesData = singleRow[seriesColumnKey];
                    //init data(group)
                    if (!dataSetGroup[singleRowKey][seriesColumnKey]) { dataSetGroup[singleRowKey][seriesColumnKey] = []; }
                    //init data(summary)
                    if (!dataSetSummary[seriesColumnKey]) { dataSetSummary[seriesColumnKey] = {}; }
                    for (var dateKey in seriesData) {
                        //date key is number(time.getTime())
                        //result like {"group": {totalIn: [[10524885, 999],[10524885, 777]]} }
                        dataSetGroup[singleRowKey][seriesColumnKey].push([+dateKey, seriesData[dateKey]]);

                        //result like {totalIn: [[10524885, 999],[10524885, 777]] ...}
                        if (!dataSetSummary[seriesColumnKey][dateKey]) {
                            dataSetSummary[seriesColumnKey][dateKey] = 0;
                        }
                        dataSetSummary[seriesColumnKey][dateKey] += seriesData[dateKey];
                    }
                }
            }
            this.groupSeriesData = dataSetGroup;
            this.summarySeriesData = dataSetSummary;
        },
        genratorChart: function (el, series, legend) {
            var vm = this;
            vm.loading = true;
            if (!series) {
                console.warn("Can't draw empty series");
                return null;
            }
            return Highcharts.chart(el, {
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: 'Credits Run chart'
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value:%Y/%m/%d<br>%H:%M:%S}',
                        rotation: -50,
                        y: 33,
                        align: 'center',
                        step: 1
                    }
                },
                yAxis: {
                    title: {
                        text: 'Credits'
                    }
                },
                legend: {
                    enabled: true
                },
                plotOptions: {
                    spline: {
                        marker: {
                            radius: 1,
                            enabled: null
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 3
                            }
                        },
                        threshold: null
                    }
                },
                series: series
            }, function () {
                vm.loading = false;
            });
        },
        updateGroupChartFilters: function () {
            switch (this.searchData.groupBy) {
                case 'machine':
                    Vue.set(this.machinesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'user':
                    Vue.set(this.usersForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'storename':
                    Vue.set(this.storesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: (item === "") ? "-" : item }; }));
                    break;
            }
        },
        updateGroupChart: function () {
            if (!this.groupChart || !this.groupChart.hasRendered) { return; }
            this.drawGroupChart();
        },
        drawGroupChart: function () {
            var vm = this;
            var series = [];
            var checkedGroups = [];
            var _tempGroups = null;
            var _tempColumns = null;
            switch (this.searchData.groupBy) {
                case 'machine':
                    _tempGroups = vm.determineSearchString(vm.machinesForReport.items, "checked");
                    break;
                case 'user':
                    _tempGroups = vm.determineSearchString(vm.usersForReport.items, "checked");
                    break;
                case 'storename':
                    _tempGroups = vm.determineSearchString(vm.storesForReport.items, "checked");
                    break;
            }
            checkedGroups = _tempGroups && _tempGroups.split(",").toObject();
            _tempColumns = vm.determineSearchString(vm.columnsForReport.items, "checked");
            var checkedColumns = _tempColumns && _tempColumns.split(",").toObject();
            //used for forLoop
            var singleRow = {};
            for (var groupKey in this.groupSeriesData) {
                if (checkedGroups !== null && !checkedGroups[groupKey]) {
                    continue;
                }
                singleRow = this.groupSeriesData[groupKey];
                for (var columnKey in singleRow) {
                    if (checkedColumns !== null && !checkedColumns[columnKey]) {
                        continue;
                    }
                    singleRow[columnKey].sort(function (a, c) { return a[0] - c[0]; });
                    series.push({
                        type: 'spline',
                        name: [columnKey, "(", groupKey, ")"].join(""),
                        tooltip: {
                            xDateFormat: '%Y/%m/%d %H:%M:%S'
                        },
                        data: singleRow[columnKey]
                    });
                }
            }
            this.groupChart = this.genratorChart(this.$refs.groupChart, series, false);
            this.showGroupChart = true;
        },
        drawSummaryChart: function () {
            var vm = this;
            var series = [];
            var seriesContent = [];
            var singleSummaryData;
            for (var key in this.summarySeriesData) {
                singleSummaryData = this.summarySeriesData[key];
                seriesContent = [];
                for (var date in singleSummaryData) {
                    seriesContent.push([+date, singleSummaryData[date]]);
                }
                seriesContent.sort(function (a, c) { return a[0] - c[0]; });
                series.push({
                    type: 'spline',
                    name: key,
                    tooltip: {
                        xDateFormat: '%Y/%m/%d %H:%M:%S'
                    },
                    data: seriesContent
                });
            }
            this.summaryCart = this.genratorChart(this.$refs.summaryChart, series);
        }
    },
    created: function () {
        this.resetParams();
    },
    mounted: function () {
    }
};

const Transactions = {
    mixins: [PageBase],
    data: function () {
        return {
            searched: false,
            loading: false,
            searching: false,
            options: {},
            searchData: { startTime: Utils.date.todayStart().toString('yyyy/M/d H:mm:ss'), endTime: Utils.date.todayEnd().toString('yyyy/M/d H:mm:ss') },
            reportData: [],
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            users: {
                type: "Account",
                items: []
            },
            stores: {
                type: "Store",
                items: []
            },
            machines: {
                type: "Machine",
                items: []
            },
            transactionTypes: {
                type: "Transaction Type",
                items: []
            },
            gameTypes: {
                type: "Game Type",
                items: []
            }
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.currentPage = 1;
        },
        jpTitle: function (item) {
            return ["JP1：", this.thousandFormat(item.jp1Win), "\nJP2：", this.thousandFormat(item.jp2Win), "\nJP3：", this.thousandFormat(item.jp3Win), "\nJP4：", this.thousandFormat(item.jp4Win)].join("");
        },
        search: function () {
            var vm = this;
            vm.loading = true;
            vm.searching = true;
            vm.searched = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                machines: vm.determineSearchString(vm.machines.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked"),
                transactionTypes: vm.determineSearchString(vm.transactionTypes.items, "checked"),
                gameTypes: vm.determineSearchString(vm.gameTypes.items, "checked"),
                startTime: vm.searchData.startTime,
                endTime: vm.searchData.endTime
            };
            Vue.http.post('/api/transactions', search).then(function (res) {
                vm.reportData = res.body.data;
                for (var i in vm.reportData) {
                    vm.reportData[i].memo = JSON.parse(vm.reportData[i].memo);
                }
                vm.loading = false;
            }).catch(app.handlerError);
        },
        dropClick: function (ev) {
            ev.stopPropagation;
        },
        transactionTypeText: function (code) {
            switch (code) {
                case 1: return "Credit In";
                case 2: return "Credit Out";
                case 10: return "Play";
                default: return "-";
            }
        },
        gameTypeText: function (code) {
            switch (code) {
                case 1: return "Main Game";
                case 2: return "Free Game";
                case 3: return "Bonus Game";
                default: return "-";
            }
        }
    },
    created: function () {
        var vm = this;
        vm.getLists((function (data) {
            Vue.set(vm.users, "items", data.users.map(function (item) { return { checked: true, id: item.userID, text: item.account } }));
            Vue.set(vm.machines, "items", data.machines.map(function (item) { return { checked: true, id: item.ID, text: item.pcbID + "-" + item.machineName } }));
            Vue.set(vm.stores, "items", data.stores.map(function (item) { return { checked: true, id: item, text: item } }));
            Vue.set(vm.transactionTypes, "items", data.transactionTypes.map(function (item) { return { checked: true, id: item.ID, text: item.name } }));
            Vue.set(vm.gameTypes, "items", data.gameTypes.map(function (item) { return { checked: true, id: item.ID, text: item.name } }));
        }).bind(vm));
    },
    mounted: function () {
    }
};

const MachineList = {
    mixins: [PageBase],
    data: function () {
        return {
            loading: false,
            filter: '',
            listUsers: [],
            reportData: [],
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            submited: false,
            addModel: {
                pcbID: null, storeName: null, userID: null
            },
            editModel: {
                ID: null, pcbID: null, storeName: null, userID: null
            },
            deleteModel: {
                ID: null, pcbID: null, storeName: null, userID: null, confirm: null
            }
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        },
        filteredData: function () {
            if (!this.filter) return this.reportData;
            var rex = new RegExp(this.filter, "ig");
            var _filtered = this.reportData.filter(function (item) {
                return rex.test(item.storeName) || rex.test(item.pcbID);
            });
            return _filtered;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.currentPage = 1;
        },
        cancelAdd: function () {
            this.submited = false;
            this.addModel.userID = this.$root.loginUser.ID;
            this.addModel.pcbID = this.addModel.storeName = null;
        },
        getMachines: function () {
            var vm = this;
            vm.loading = true;
            Vue.http.get('/api/machines').then(function (res) {
                vm.reportData = res.body.data;
                vm.loading = false;
            }).catch(app.handlerError);
        },
        addMachine: function (ev) {
            var vm = this;
            if (vm.addModel.pcbID && vm.addModel.userID) {
                vm.submited = false;
                Vue.http.post('/api/machines', vm.addModel, { emulateJSON: true }).then(function (res) {
                    if (res.body.code == 200) {
                        vm.getMachines();
                    }
                    else {
                        alert("Add Machine Error: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
            else {
                this.submited = true;
                ev.preventDefault();
            }
        },
        cancelEdit: function () {
            this.submited = false;
            this.editModel.ID = this.editModel.pcbID = this.editModel.storeName = this.editModel.userID = null;
        },
        startEditMachine: function ($event, id) {
            var vm = this;
            Vue.http.get('/api/machines/' + id).then(function (res) {
                if (res.body.code == 200) {
                    Vue.set(vm, "editModel", res.body.data);
                    vm.$root.$emit('bv::show::modal', 'editMachineDialog', $event.target);
                }
                else {
                    alert("Get Machine Data Error: " + res.body.message);
                }
            }).catch(app.handlerError);
        },
        startDeleteMachine: function ($event, id) {
            var vm = this;
            Vue.http.get('/api/machines/' + id).then(function (res) {
                if (res.body.code == 200) {
                    Vue.set(vm, "deleteModel", res.body.data);
                    vm.$root.$emit('bv::show::modal', 'deleteMachineDialog', $event.target);
                }
                else {
                    alert("Get Machine Data Error: " + res.body.message);
                }
            }).catch(app.handlerError);
        },
        editMachine: function (ev) {
            var vm = this;
            if (vm.editModel.userID) {
                vm.submited = false;
                Vue.http.post('/api/machines/' + vm.editModel.ID, vm.editModel, { emulateJSON: true }).then(function (res) {
                    if (res.body.code == 200) {
                        vm.getMachines();
                    }
                    else {
                        alert("Edit Machine Error: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
            else {
                this.submited = true;
                ev.preventDefault();
            }
        },
        deleteMachine: function (ev) {
            var vm = this;
            if (vm.deleteModel.confirm == vm.deleteModel.pcbID) {
                vm.submited = false;
                Vue.http.delete('/api/machines/' + vm.deleteModel.ID).then(function (res) {
                    if (res.body.code == 200) {
                        vm.getMachines();
                    }
                    else {
                        alert("Delete Machine Error: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
            else {
                this.submited = true;
                ev.preventDefault();
            }
        }
    },
    created: function () {
        this.getMachines();
        this.addModel.userID = this.$root.loginUser.ID;
    },
    mounted: function () {
        var vm = this;
        vm.getLists((function (data) {
            Vue.set(vm, "listUsers", data.users.map(function (item) { return { checked: true, value: item.userID, text: item.account } }));
            vm.listUsers.unshift({ text: vm.$root.loginUser.account, value: vm.$root.loginUser.ID });
            vm.listUsers.unshift({ text: "Select an owner", value: null });
        }).bind(vm));
    }
};

const MachineTransfer = {
    data: function () {
        return {
            step: 1,
            machinesWithUsersTree: { nodes: {}, roots: {} },
            usersTree: { nodes: {}, roots: {} },
            checkList: {}
        }
    },
    computed: {
        '$route': function (route) {
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
            }, 300);
            this.resetParams();
        },
        checkedMachines: function () {
            var vm = this;
            return Object.keys(vm.checkList.machines).filter(function (key) {
                return vm.checkList.machines[key];
            });
        },
        toTransferMachines: function () {
            return this.checkList.machines;
        }
    },
    methods: {
        resetParams: function () {
            this.step = 1;
            this.machinesWithUsersTree = { nodes: {}, roots: {} };
            this.usersTree = { nodes: {}, roots: {} };
            this.checkList = {};
        },
        toStep: function (step) {
            if (this.step === 1 && step === 2 && !this.checkedMachines.length) {
                alert('Must select at least one machine.')
                return;
            }
            else if (this.step === 2 && step === 3 && !this.checkList.account) {
                alert('Must select one account.')
                return;
            }
            this.step = step;
        },
        transfer: function () {
            var vm = this;
            var result = confirm('Really excuting machines transfer?');
            var postData = { machines: vm.checkedMachines, account: vm.checkList.account.userID };
            if (result) {
                Vue.http.post('/api/machinetransfer', postData).then(function (res) {
                    if (res.body.code == 200) {
                        alert('Transfer completed.');
                        location.reload();
                    }
                    else {
                        alert("Add Machine Error: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
        },
        _generatorTree: function (source) {
            var data = source;
            var machinesWithAccounts = [];
            var treeNodes = {};
            var tree = {};
            var map = {}, node, roots = [], i;
            for (i = 0; i < data.length; i += 1) {
                var item = data[i];
                var current = treeNodes[item.userID];
                var parent = treeNodes[item.parentID];
                //build relation
                if (!current) {
                    current = treeNodes[item.userID] = {
                        account: item.account,
                        userID: item.userID,
                        parentID: item.parentID
                    }
                    if (parent) {
                        current.parent = parent;
                        parent.children = parent.children || {};
                        parent.children[item.userID] = current;
                    }
                }

                //add machine
                if (item.machineID) {
                    current.machines = treeNodes[item.userID].machines || [];
                    current.machines.push({ machineID: item.machineID, machineName: item.machineName, storeName: item.storeName, pcbID: item.pcbID, owner: current });
                }
                if (i === 0) {
                    tree.roots = current;
                }
            }
            tree.nodes = treeNodes;
            return tree;
        }
    },
    mounted: function () {
        var vm = this;
        Vue.http.get('/api/common/getuserstree').then(function (res) {
            if (res.body.code == 200) {
                // Vue.set(vm, "userstree", vm._generatorTree(res.body.data));
                vm.usersTree = vm._generatorTree(res.body.data);
            }
            else {
                alert("Get MachineList Error: " + res.body.message);
            }
        }).catch(app.handlerError);

        Vue.http.get('/api/machinetransfer').then(function (res) {
            if (res.body.code == 200) {
                // Vue.set(vm, "machinesWithUsersTree", vm._generatorTree(res.body.data));
                vm.machinesWithUsersTree = vm._generatorTree(res.body.data);
            }
            else {
                alert("Get MachineList Error: " + res.body.message);
            }
        }).catch(app.handlerError);
    }
};

const Core = {
    mixins: [PageBase],
    data: function () {
        return {
            loading: false,
            filter: '',
            reportData: [],
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            addModel: {
                account: null, password: null, confirm: null
            },
            pwdModel: {
                ID: null, account: null, password: null, confirm: null
            },
            permissionModel: {
                ID: null, account: null, items: [], list: {}
            },
            submited: false
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        },
        filteredData: function () {
            if (!this.filter) return this.reportData;
            var rex = new RegExp(this.filter, "ig");
            var _filtered = this.reportData.filter(function (item) {
                return rex.test(item.account);
            });
            return _filtered;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.currentPage = 1;
        },
        chkPolicy: function (model) {
            return this.chkAccount(model.account) && this.chkPassword(model.password) && model.password == model.confirm;
        },
        chkAccount: function (account) {
            return /^[a-zA-Z0-9]{6,16}$/.test(account);
        },
        chkPassword: function (pwd) {
            return /^(?=.*[0-9])(?=.*[a-z])(.{8,20})$/.test(pwd);
        },
        encryptedPassword: function (pwd) {
            return CryptoJS.SHA512(pwd).toString(CryptoJS.enc.Hex);
        },
        getPermissions: function (id, account) {
            var vm = this;
            vm.loading = true;
            Vue.http.get('/api/coreusers/permissions/' + id).then(function (res) {
                vm.permissionModel.ID = id;
                vm.permissionModel.account = account;
                vm.permissionModel.items = res.body.data || [];
                vm.permissionModel.list = {};
                for (var i in res.body.data) {
                    var item = res.body.data[i];
                    var cat = item.name.split('_')[0];
                    var name = item.name.split('_')[1];
                    vm.permissionModel.list[cat] = vm.permissionModel.list[cat] || {};
                    vm.permissionModel.list[cat].cat = cat;
                    vm.permissionModel.list[cat][name] = item;
                }
                vm.loading = false;
            }).catch(app.handlerError);
        },
        cancelPermissions: function () {
            this.submited = false;
            this.permissionModel.ID = this.permissionModel.account = null;
            this.permissionModel.items = [];
            this.permissionModel.list = {};
        },
        editPermissions: function (ev) {
            var vm = this;
            Vue.http.post('/api/coreusers/permissions', { ID: vm.permissionModel.ID, permissions: vm.permissionModel.items }).then(function (res) {
                if (res.body.code == 200) {
                    alert("Permission change saved.")
                }
                else {
                    alert("Permission change save Error: " + res.body.message);
                }
            }).catch(app.handlerError);
        },
        getUsers: function () {
            var vm = this;
            vm.loading = true;
            Vue.http.get('/api/coreusers').then(function (res) {
                vm.reportData = res.body.data;
                vm.total = res.body.total;
                vm.totalPage = Math.ceil(vm.total / vm.unit);
                vm.loading = false;
            }).catch(app.handlerError);
        },
        toggleActive: function (id) {
            var vm = this;
            var user = vm.reportData.filter(function (item) {
                return item.ID === id;
            });
            if (user && user.length === 1) {
                user = user[0];
                Vue.http.post('/api/coreusers/active/' + user.ID).then(function (res) {
                    if (res.body.code == 200 && res.body.data) {
                        user.state = res.body.data.state;
                    }
                    else {
                        alert("Change active/deactive failed: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
        },
        cancelAdd: function () {
            this.submited = false;
            this.addModel.account = this.addModel.password = this.addModel.confirm = null;
        },
        addUser: function (ev) {
            var vm = this;
            vm.submited = true;
            if (vm.chkPolicy(vm.addModel)) {
                vm.submited = false;
                delete vm.addModel.confirm;
                vm.addModel.password = vm.encryptedPassword(vm.addModel.password);
                Vue.http.post('/api/coreusers', vm.addModel, { emulateJSON: true }).then(function (res) {
                    if (res.body.code == 200) {
                        vm.getUsers();
                    }
                    else {
                        alert("Add User Error: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
            else {
                this.submited = true;
                ev.preventDefault();
            }
        },
        openChangePassword: function (id) {
            var vm = this;
            var user = vm.reportData.filter(function (item) {
                return item.ID === id;
            });
            if (user && user.length === 1) {
                vm.pwdModel.account = user[0].account;
                vm.pwdModel.ID = user[0].ID;
            }
        },
        cancelChangePassword: function () {
            var vm = this;
            vm.pwdModel.ID = vm.pwdModel.account = vm.pwdModel.password = vm.pwdModel.confirm = null;
        },
        changePassword: function (ev) {
            var vm = this;
            vm.submited = true;
            if (vm.chkPolicy(vm.pwdModel)) {
                vm.submited = false;
                delete vm.pwdModel.confirm;
                vm.pwdModel.password = vm.encryptedPassword(vm.pwdModel.password);
                Vue.http.post('/api/coreusers/password/' + vm.pwdModel.ID, vm.pwdModel, { emulateJSON: true }).then(function (res) {
                    if (res.body.code == 200) {
                        alert("Password changed.");
                    }
                    else {
                        alert("Change password failed: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
            else {
                vm.submited = true;
                ev.preventDefault();
            }
        },
        // dataChanged: function (viewData) {
        //     // this.viewData = viewData;
        // },
        stateText: function (state) {
            switch (state) {
                case 1: return "Active";
                case 2: return "Deactive";
                case 3: return "Locked";
            }
        },
        stateButtonText: function (state) {
            switch (state) {
                case 1: return "Deactive";
                case 2: return "Active";
            }
        }
    },
    created: function () {
        this.getUsers();
    },
    mounted: function () {
    }
};

const Agency = {
    mixins: [PageBase],
    data: function () {
        return {
            loading: false,
            filter: '',
            reportData: [],
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            addModel: {
                account: null, password: null, confirm: null
            },
            pwdModel: {
                ID: null, account: null, password: null, confirm: null
            },
            permissionModel: {
                ID: null, account: null, items: [], list: {}
            },
            submited: false
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        },
        filteredData: function () {
            if (!this.filter) return this.reportData;
            var rex = new RegExp(this.filter, "ig");
            var _filtered = this.reportData.filter(function (item) {
                return rex.test(item.account);
            });
            return _filtered;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.currentPage = 1;
        },
        chkPolicy: function (model) {
            return this.chkAccount(model.account) && this.chkPassword(model.password) && model.password == model.confirm;
        },
        chkAccount: function (account) {
            return /^[a-zA-Z0-9]{6,16}$/.test(account);
        },
        chkPassword: function (pwd) {
            return /^(?=.*[0-9])(?=.*[a-z])(.{8,20})$/.test(pwd);
        },
        encryptedPassword: function (pwd) {
            return CryptoJS.SHA512(pwd).toString(CryptoJS.enc.Hex)
        },
        getPermissions: function (id, account) {
            var vm = this;
            vm.loading = true;
            Vue.http.get('/api/agency/permissions/' + id).then(function (res) {
                vm.permissionModel.ID = id;
                vm.permissionModel.account = account;
                vm.permissionModel.items = res.body.data || [];
                vm.permissionModel.list = {};
                for (var i in res.body.data) {
                    var item = res.body.data[i];
                    var cat = item.name.split('_')[0];
                    var name = item.name.split('_')[1];
                    vm.permissionModel.list[cat] = vm.permissionModel.list[cat] || {};
                    vm.permissionModel.list[cat].cat = cat;
                    vm.permissionModel.list[cat][name] = item;
                }
                vm.loading = false;
            }).catch(app.handlerError);
        },
        cancelPermissions: function () {
            this.submited = false;
            this.permissionModel.ID = this.permissionModel.account = null;
            this.permissionModel.items = [];
            this.permissionModel.list = {};
        },
        editPermissions: function (ev) {
            var vm = this;
            Vue.http.post('/api/agency/permissions', { ID: vm.permissionModel.ID, permissions: vm.permissionModel.items }).then(function (res) {
                if (res.body.code == 200) {
                    alert("Permission change saved.")
                }
                else {
                    alert("Permission change save Error: " + res.body.message);
                }
            }).catch(app.handlerError);
        },
        getUsers: function () {
            var vm = this;
            vm.loading = true;
            Vue.http.get('/api/agency').then(function (res) {
                vm.reportData = res.body.data;
                vm.loading = false;
            }).catch(app.handlerError);
        },
        toggleActive: function (id) {
            var vm = this;
            var user = vm.reportData.filter(function (item) {
                return item.ID === id;
            });
            if (user && user.length === 1) {
                user = user[0];
                Vue.http.post('/api/agency/active/' + user.ID).then(function (res) {
                    if (res.body.code == 200 && res.body.data) {
                        user.state = res.body.data.state;
                    }
                    else {
                        alert("Change active/deactive failed: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
        },
        cancelAdd: function () {
            this.submited = false;
            this.addModel.account = this.addModel.password = this.addModel.confirm = null;
        },
        addUser: function (ev) {
            var vm = this;
            vm.submited = true;
            if (vm.chkPolicy(vm.addModel)) {
                vm.submited = false;
                delete vm.addModel.confirm;
                vm.addModel.password = vm.encryptedPassword(vm.addModel.password);
                Vue.http.post('/api/agency', vm.addModel, { emulateJSON: true }).then(function (res) {
                    if (res.body.code == 200) {
                        vm.getUsers();
                    }
                    else {
                        alert("Add User Error: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
            else {
                this.submited = true;
                ev.preventDefault();
            }
        },
        openChangePassword: function (id) {
            var vm = this;
            var user = vm.reportData.filter(function (item) {
                return item.ID === id;
            });
            if (user && user.length === 1) {
                vm.pwdModel.account = user[0].account;
                vm.pwdModel.ID = user[0].ID;
            }
        },
        cancelChangePassword: function () {
            var vm = this;
            vm.pwdModel.ID = vm.pwdModel.account = vm.pwdModel.password = vm.pwdModel.confirm = null;
        },
        changePassword: function (ev) {
            var vm = this;
            vm.submited = true;
            if (vm.chkPolicy(vm.pwdModel)) {
                vm.submited = false;
                delete vm.pwdModel.confirm;
                vm.pwdModel.password = vm.encryptedPassword(vm.pwdModel.password);
                Vue.http.post('/api/agency/password/' + vm.pwdModel.ID, vm.pwdModel, { emulateJSON: true }).then(function (res) {
                    if (res.body.code == 200) {
                        alert("Password changed.");
                    }
                    else {
                        alert("Change password failed: " + res.body.message);
                    }
                }).catch(app.handlerError);
            }
            else {
                vm.submited = true;
                ev.preventDefault();
            }
        },
        // dataChanged: function (viewData) {
        //     // this.viewData = viewData;
        // },
        stateText: function (state) {
            switch (state) {
                case 1: return "Active";
                case 2: return "Deactive";
                case 3: return "Locked";
            }
        },
        stateButtonText: function (state) {
            switch (state) {
                case 1: return "Deactive";
                case 2: return "Active";
            }
        }
    },
    created: function () {
        this.getUsers();
    },
    mounted: function () {
    }
};

const VersionSetting = {
    mixins: [PageBase],
    data: function () {
        return {
            loading: false,
            filter: '',
            machines: fakeMachines,
            reportData: [],
            summaryReportData: {},
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
        }
    },
    watch: {
    },
    methods: {
        chkPageCurrent: function (page) {
            return this.currentPage != page || 'current';
        },
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        statusClass: function (status) {
            switch (status) {
                case 0: return "text-danger";
                case 1: return "text-success";
            }
        },
        statusText: function (status) {
            switch (status) {
                case 0: return "Offline";
                case 1: return "Online";
            }
        }
    },
    computed: {
        filteredData: function () {
            if (!this.filter) return this.reportData;
            var rex = new RegExp(this.filter, "ig");
            var _filtered = this.reportData.filter(function (item) {
                return rex.test(item.machineId) || rex.test(item.machineName) || rex.test(item.storeName) || rex.test(item.currentVersion);
            });
            return _filtered;
        }
    },
    mounted: function () {
    }
};

const JPServer = {
    data: function () {
        return {
        }
    },
    mounted: function () {
    }
};

const ReportJackpot = {
    mixins: [PageBase],
    data: function () {
        var seriesColumns = ["totalJp1Win", "totalJp2Win", "totalJp3Win", "totalJp4Win"];
        return {
            loading: false,
            searchData: { groupBy: 'nogroup', startTime: Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss'), endTime: Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss') },
            reportData: [],
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            groupSeriesData: {},
            groupSeriesDataTime: {},
            groupChart: null,
            seriesColumns: seriesColumns,
            usersForReport: {
                type: "Account",
                items: []
            },
            storesForReport: {
                type: "Store",
                items: []
            },
            machinesForReport: {
                type: "Machine",
                items: []
            }
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.showGroupChart = false;
            this.searchData.groupInterval = "nogroup";
            this.groupChart && this.groupChart.hasRendered && this.groupChart.destroy && this.groupChart.destroy();//reset chart
            this.searchData.startTime = Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss');
            this.searchData.endTime = Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss');
            PageBase.methods.resetParams.call(this);
        },
        changeGroup: function (group) {
            this.searchData.groupBy = group;
            this.search();
        },
        chkGroup: function (group) {
            return group != this.searchData.groupBy || 'active';
        },
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 300);
        },
        // dataChanged: function (viewData) {
        //     // this.viewData = viewData;
        // },
        search: function () {
            var vm = this;
            vm.loading = true;
            vm.searched = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                machines: vm.determineSearchString(vm.machines.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked"),
                groupBy: vm.searchData.groupBy,
                startTime: vm.searchData.startTime,
                endTime: vm.searchData.endTime
            };
            Vue.http.post('/api/reports/jackpot', search).then(function (res) {
                vm.reportData = res.body.data;
                vm.total = res.body.total;
                vm.totalPage = Math.ceil(vm.total / vm.unit);
                vm.loading = false;
                vm.prepareReportData();
                vm.updateGroupChartFilters();
                vm.drawGroupChart();
            }).catch(app.handlerError);
        },
        prepareReportData: function () {
            var columnsRegex = new RegExp("^(" + this.seriesColumns.join("|") + ")$");
            var data = {};
            //used for forLoop
            var singleDataByTime;
            var dataSetGroup = {};
            var groupKey;
            var singleData = {};
            var machineKey;
            var item;

            var dataSetGroupTime = {};

            //group by machine, account, storename
            for (var index in this.reportData) {
                item = this.reportData[index];
                //group data by user selected
                machineKey = item.pcbID + "(" + item.machineName + ")";
                switch (this.searchData.groupBy) {
                    case 'machine':
                        groupKey = machineKey;
                        singleData = data[machineKey] = data[machineKey] || {};
                        break;
                    case 'user':
                        groupKey = item.account;
                        singleData = data[item.account] = data[item.account] || {};
                        break;
                    case 'storename':
                        groupKey = item.storeName;
                        singleData = data[item.storeName] = data[item.storeName] || {};
                        break;
                }
                for (var key in item) {
                    if (!columnsRegex.test(key)) {
                        continue;
                    }
                    singleData[key] = Number(item[key]);
                }
                dataSetGroup[groupKey] = singleData;
            }

            //group by date
            // for (var index in this.reportData) {
            //     item = this.reportData[index];
            //     for (var key in item) {
            //         if (!columnsRegex.test(key)) {
            //             continue;
            //         }
            //         var d = new Date(item.rangeEndTime).getTime();
            //         dataSetGroupTime[key] = dataSetGroupTime[key] || [];
            //         dataSetGroupTime[key].push([d, Number(item[key])]);
            //     }
            // }
            this.groupSeriesData = dataSetGroup;
            // this.groupSeriesDataTime = dataSetGroupTime;
        },
        genratorAreaChart: function (el, series) {
            console.log(series)
            var vm = this;
            vm.loading = true;
            return Highcharts.chart(el, {
                chart: {
                    type: 'area',
                    zoomType: 'x'
                },
                title: {
                    text: "Jp Win Distribution "
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    type: 'datetime',
                    tickmarkPlacement: 'on',
                    labels: {
                        format: '{value:%Y/%m/%d<br>%H:%M:%S}',
                        rotation: -50,
                        y: 33,
                        align: 'center',
                        step: 1
                    }
                },
                yAxis: {
                    title: {
                        text: 'Credits'
                    },
                    labels: {
                        formatter: function () {
                            return this.value / 1000;
                        }
                    }
                },
                tooltip: {
                    split: true
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#666666',
                            enabled: null
                        }
                    }
                },
                series: series
            }, function () {
                vm.loading = false;
            });
        },
        drawAreaChart: function () {
            var vm = this;
            var series = [];
            var checkedGroups = [];
            var columnsRegex = new RegExp("^(" + this.seriesColumns.join("|") + ")$");
            var _filterMachine = vm.determineSearchString(vm.machinesForReport.items, "checked");
            var _filterUser = vm.determineSearchString(vm.usersForReport.items, "checked");
            var _filterStore = vm.determineSearchString(vm.storesForReport.items, "checked");
            var _checkedMachines = _filterMachine && _filterMachine.split(",").toObject();
            var _checkedUsers = _filterUser && _filterUser.split(",").toObject();
            var _checkedStores = _filterStore && _filterStore.split(",").toObject();
            //used for forLoop
            var singleRow = {};

            for (var index in this.reportData) {
                item = this.reportData[index];
                if (_checkedMachines !== null && !_checkedMachines[item.pcbID] ||
                    _checkedUsers !== null && !_checkedUsers[item.account] ||
                    _checkedStores !== null && !_checkedStores[item.storeName]) {
                    continue;
                }
                for (var key in item) {
                    if (!columnsRegex.test(key)) {
                        continue;
                    }
                    var d = new Date(item.createdTime).getTime();
                    singleRow[key] = singleRow[key] || [];
                    singleRow[key].push([d, Number(item[key])]);
                }
            }

            for (var key in singleRow) {
                singleRow[key]
                series.push({
                    name: key,
                    data: singleRow[key]
                });
            }
            this.groupChart = this.genratorAreaChart(this.$refs.chartTotalJp, series);
        },
        genratorColumnChart: function (el, series, categories) {
            var vm = this;
            vm.loading = true;
            return Highcharts.chart(el, {
                chart: {
                    type: 'column',
                    zoomType: 'x'
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    categories: categories,
                    labels: {
                        rotation: -50,
                        y: 33,
                        align: 'center',
                        step: 1
                    }
                },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> <br>',
                    shared: true
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: null,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                        }
                    }
                },
                series: series
            }, function () {
                vm.loading = false;
            });
        },
        drawGroupChart: function () {
            var vm = this;
            var series = [];
            var groupSeries = {};
            var checkedGroups = [];
            var _tempGroups = null;
            switch (this.searchData.groupBy) {
                case 'machine':
                    _tempGroups = vm.determineSearchString(vm.machinesForReport.items, "checked");
                    break;
                case 'user':
                    _tempGroups = vm.determineSearchString(vm.usersForReport.items, "checked");
                    break;
                case 'storename':
                    _tempGroups = vm.determineSearchString(vm.storesForReport.items, "checked");
                    break;
                default:
                    vm.drawAreaChart();
                    return;
            }
            checkedGroups = _tempGroups && _tempGroups.split(",").toObject();
            //used for forLoop
            var singleRow = {};
            for (var groupKey in this.groupSeriesData) {
                if (checkedGroups !== null && !checkedGroups[groupKey]) {
                    continue;
                }
                singleRow = this.groupSeriesData[groupKey];
                for (var columnKey in singleRow) {
                    groupSeries[columnKey] = groupSeries[columnKey] || [];
                    groupSeries[columnKey].push(singleRow[columnKey]);
                }
            }
            for (var seriesKey in groupSeries) {
                series.push({
                    name: seriesKey,
                    data: groupSeries[seriesKey]
                });
            }
            this.groupCharts = this.groupCharts || [];
            this.groupChart = this.genratorColumnChart(this.$refs.chartTotalJp, series, Object.keys(this.groupSeriesData));
        },
        updateGroupChartFilters: function () {
            switch (this.searchData.groupBy) {
                case 'machine':
                    Vue.set(this.machinesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'user':
                    Vue.set(this.usersForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'storename':
                    Vue.set(this.storesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: (item === "") ? "-" : item }; }));
                    break;
            }
        },
        updateGroupChart: function () {
            if (!this.groupChart || !this.groupChart.hasRendered) { return; }
            this.drawGroupChart();
        }
    },
    created: function () {
        var vm = this;
        vm.getLists((function (data) {
            Vue.set(vm.users, "items", data.users.map(function (item) { return { checked: true, id: item.userID, text: item.account } }));
            Vue.set(vm.machines, "items", data.machines.map(function (item) { return { checked: true, id: item.pcbID, text: item.pcbID + "-" + item.machineName } }));
            Vue.set(vm.stores, "items", data.stores.map(function (item) { return { checked: true, id: item, text: item } }));
        }).bind(vm));
    },
    mounted: function () {
    }
};

const ReportMachine = {
    mixins: [PageBase],
    data: function () {
        var seriesColumns = ["totalIn", "totalOut", "totalBet", "totalWin", "totalPlayTimes", "totalWinTimes", "avgBet"];
        return {
            loading: false,
            searchData: { startTime: Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss'), endTime: Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss') },
            reportData: [],
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            groupSeriesData: {},
            groupCharts: [],
            seriesColumns: seriesColumns,
            machinesForReport: {
                type: "Machine",
                items: []
            }
        }
    },

    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        },
        filteredData: function () {
            if (!this.filter) return this.reportData;
            var rex = new RegExp(this.filter, "ig");
            var _filtered = this.reportData.filter(function (item) {
                return rex.test(item.account);
            });
            return _filtered;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 300);
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            while (this.groupCharts && this.groupCharts.length) {
                var groupChart = this.groupCharts.pop();
                groupChart && groupChart.hasRendered && groupChart.destroy && groupChart.destroy();//reset chart
            }
            this.searchData.startTime = Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss');
            this.searchData.endTime = Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss');
            PageBase.methods.resetParams.call(this);
        },
        search: function () {
            var vm = this;
            vm.loading = true;
            vm.searched = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                machines: vm.determineSearchString(vm.machines.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked"),
                startTime: vm.searchData.startTime,
                endTime: vm.searchData.endTime
            };
            Vue.http.post('/api/reports/machine', search).then(function (res) {
                vm.reportData = res.body.data;
                vm.total = res.body.total;
                vm.totalPage = Math.ceil(vm.total / vm.unit);
                vm.loading = false;
                vm.prepareReportData();
                vm.updateGroupChartFilters();
                vm.drawCharts();
            }).catch(app.handlerError);
        },
        prepareReportData: function () {
            var columnsRegex = new RegExp("^(" + this.seriesColumns.join("|") + ")$");
            var data = {};
            //used for forLoop
            var dataSetGroup = {};
            var groupKey;
            var singleData;
            var machineKey;
            var item;
            for (var index in this.reportData) {
                item = this.reportData[index];
                //group data by user selected
                machineKey = item.pcbID + "(" + item.machineName + ")";
                groupKey = machineKey;
                singleData = data[machineKey] = data[machineKey] || {};
                for (var key in item) {
                    if (!columnsRegex.test(key)) {
                        continue;
                    }
                    singleData[key] = Math.floor(Number(item[key]));
                }
                dataSetGroup[groupKey] = singleData;
            }
            this.groupSeriesData = dataSetGroup;
        },
        genratorColumnChart: function (el, series, categories, title) {
            var vm = this;
            vm.loading = true;
            return Highcharts.chart(el, {
                chart: {
                    type: 'column',
                    zoomType: 'x'
                },
                title: {
                    text: title
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    categories: categories,
                    labels: {
                        rotation: -50,
                        y: 33,
                        align: 'center',
                        step: 1
                    },
                    crosshair: true
                },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> <br>',
                    shared: true
                },
                plotOptions: {
                    column: {
                        cursor: 'pointer',
                        showInLegend: false,
                        dataLabels: {
                            enabled: false,
                            format: '{point.y}'
                        }
                    }
                },
                series: series
            }, function () {
                vm.loading = false;
            });
        },
        drawCharts: function () {
            this.groupCharts = [];
            this.groupCharts.push(this.genratorColumnChart(this.$refs.chartTotalInTotalOut,
                _.union(this.getSeriesFromColumn('totalIn', '#2B908F'), this.getSeriesFromColumn('totalOut', '#F45B5B')),
                Object.keys(this.groupSeriesData),
                "Total In And Total Out Compares"));
            this.groupCharts.push(this.genratorColumnChart(this.$refs.chartTotalBetTotalWin,
                _.union(this.getSeriesFromColumn('totalBet', '#2B908F'), this.getSeriesFromColumn('totalWin', '#F45B5B')),
                Object.keys(this.groupSeriesData),
                "Total Bet And Total Win Compares"));
            this.groupCharts.push(this.genratorColumnChart(this.$refs.chartTotalPlayTotalWin,
                _.union(this.getSeriesFromColumn('totalPlayTimes', '#2B908F'), this.getSeriesFromColumn('totalWinTimes', '#F45B5B')),
                Object.keys(this.groupSeriesData),
                "Play Times And Win Times Compares"));
            this.groupCharts.push(this.genratorColumnChart(this.$refs.chartAvgBet,
                this.getSeriesFromColumn('avgBet'),
                Object.keys(this.groupSeriesData),
                "Avg Bet"));
        },
        getSeriesFromColumn: function (column, color) {
            var vm = this;
            var series = [{
                color: color||null,
                name: column,
                type: 'column',
                data: [],
                showInLegend: false
            }];
            var checkedGroups = [];
            var _tempGroups = null;
            var _tempColumns = null;
            _tempGroups = vm.determineSearchString(vm.machinesForReport.items, "checked");
            checkedGroups = _tempGroups && _tempGroups.split(",").toObject();
            //used for forLoop
            var singleRow = {};
            for (var groupKey in this.groupSeriesData) {
                if (checkedGroups !== null && !checkedGroups[groupKey]) {
                    continue;
                }
                singleRow = this.groupSeriesData[groupKey];
                series[0].data.push(singleRow[column] || 0);
            }
            return series;
        },
        updateGroupChartFilters: function () {
            Vue.set(this.machinesForReport, "items", Object.keys(this.groupSeriesData).sort(function(a,c){return (a>c)?1:-1;}).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
        },
        updateGroupChart: function () {
            if (!this.groupCharts || !this.groupCharts.length) { return; }
            this.drawCharts();
        }
    },
    created: function () {
        var vm = this;
        vm.getLists((function (data) {
            Vue.set(vm.users, "items", data.users.map(function (item) { return { checked: true, id: item.userID, text: item.account } }));
            Vue.set(vm.machines, "items", data.machines.map(function (item) { return { checked: true, id: item.pcbID, text: item.pcbID + "-" + item.machineName } }));
            Vue.set(vm.stores, "items", data.stores.map(function (item) { return { checked: true, id: item, text: item } }));
        }).bind(vm));
    },
    mounted: function () {
    }
};

const ReportRevenue = {
    mixins: [PageBase],
    data: function () {
        var seriesColumns = ["totalIn", "totalOut", "grossNet", "outRate"];
        return {
            loading: false,
            searchData: { groupBy: 'machine', startTime: Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss'), endTime: Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss') },
            reportData: [],
            viewData: [], //current view data
            currentPage: 1,
            unit: 10, //numbers of row per page
            view: 1, //1:simple, 2:detail
            searched: false, //controll information
            groupSeriesData: {},
            groupCharts: [],
            seriesColumns: seriesColumns,
            usersForReport: {
                type: "Account",
                items: []
            },
            storesForReport: {
                type: "Store",
                items: []
            },
            machinesForReport: {
                type: "Machine",
                items: []
            }
        }
    },
    watch: {
        unit: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        showDetail: function () {
            return this.view === 2;
        },
        filteredData: function () {
            if (!this.filter) return this.reportData;
            var rex = new RegExp(this.filter, "ig");
            var _filtered = this.reportData.filter(function (item) {
                return rex.test(item.account);
            });
            return _filtered;
        }
    },
    methods: {
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 200);
        },
        dataChanged: function (viewData) {
            this.viewData = viewData;
        },
        changeView: function (view) {
            var vm = this;
            vm.loading = true;
            setTimeout(function () {
                vm.loading = false;
                vm.view = view;
            }, 200);
        },
        chkView: function (view) {
            return view != this.view || 'active';
        },
        resetParams: function () {
            this.reportData = [];
            this.summaryReportData = {};
            this.searched = false;
            this.showGroupChart = false;
            this.groupBy = 'machine';
            while (this.groupCharts && this.groupCharts.length) {
                var groupChart = this.groupCharts.pop();
                groupChart && groupChart.hasRendered && groupChart.destroy && groupChart.destroy();//reset chart
            }
            this.searchData.startTime = Utils.date.todayStart().toString('yyyy/M/d HH:mm:ss');
            this.searchData.endTime = Utils.date.todayEnd().toString('yyyy/M/d HH:mm:ss');
            PageBase.methods.resetParams.call(this);
        },
        changePage: function (page) {
            var vm = this;
            vm.loading = true;
            setTimeout(() => {
                vm.loading = false;
                vm.currentPage = page;
            }, 300);
        },
        changeGroup: function (group) {
            this.searchData.groupBy = group;
            this.search();
        },
        chkGroup: function (group) {
            return group != this.searchData.groupBy || 'active';
        },
        search: function () {
            var vm = this;
            vm.loading = true;
            vm.searched = true;
            var search = {
                users: vm.determineSearchString(vm.users.items, "checked"),
                machines: vm.determineSearchString(vm.machines.items, "checked"),
                stores: vm.determineSearchString(vm.stores.items, "checked"),
                groupBy: vm.searchData.groupBy,
                startTime: vm.searchData.startTime,
                endTime: vm.searchData.endTime
            };
            Vue.http.post('/api/reports/revenue', search).then(function (res) {
                vm.reportData = res.body.data;
                vm.total = res.body.total;
                vm.totalPage = Math.ceil(vm.total / vm.unit);
                vm.loading = false;
                vm.prepareReportData();
                vm.updateGroupChartFilters();
                vm.drawCharts();
            }).catch(app.handlerError);
        },
        prepareReportData: function () {
            var columnsRegex = new RegExp("^(" + this.seriesColumns.join("|") + ")$");
            var data = {};
            //used for forLoop
            var dataSetSummary = {};
            var dataSetGroup = {};
            var singleRow = {};
            var seriesData = {};
            var dateData = {};
            var groupKey;
            var singleData;
            var machineKey;
            var item;
            for (var index in this.reportData) {
                item = this.reportData[index];
                //group data by user selected
                machineKey = item.pcbID + "(" + item.machineName + ")";
                switch (this.searchData.groupBy) {
                    case 'machine':
                        groupKey = machineKey;
                        singleData = data[machineKey] = data[machineKey] || {};
                        break;
                    case 'user':
                        groupKey = item.account;
                        singleData = data[item.account] = data[item.account] || {};
                        break;
                    case 'storename':
                        groupKey = item.storeName;
                        singleData = data[item.storeName] = data[item.storeName] || {};
                        break;
                }
                for (var key in item) {
                    if (!columnsRegex.test(key)) {
                        continue;
                    }
                    singleData[key] = Number(item[key]);
                }
                dataSetGroup[groupKey] = singleData;
            }
            this.groupSeriesData = dataSetGroup;
        },
        drawCharts: function(){
            this.groupCharts = [];
            this.drawPieChart(this.$refs.chartTotalIn, 'totalIn');
            this.drawPieChart(this.$refs.chartTotalOut, 'totalOut');
            this.drawColumnChart(this.$refs.chartTotalGrossNet, 'grossNet');
            this.drawColumnChart(this.$refs.chartTotalOutRate, 'outRate', '%');
        },
        genratorPieChart: function (el, series, title) {
            var vm = this;
            vm.loading = true;
            return Highcharts.chart(el, {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: title
                },
                subtitle: {
                    // text: document.ontouchstart === undefined ?
                    //     'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        // colors: pieColors,
                        showInLegend: false,
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}<br>{point.percentage:.1f} %',
                            // distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 0
                            }
                        }
                    }
                },
                series: series
            }, function () {
                vm.loading = false;
            });
        },
        drawPieChart: function (chartDom, column) {
            var vm = this;
            var series = [{
                name: column,
                colorByPoint: true,
                data: []
            }];
            var checkedGroups = [];
            var _tempGroups = null;
            var _tempColumns = null;
            switch (this.searchData.groupBy) {
                case 'machine':
                    _tempGroups = vm.determineSearchString(vm.machinesForReport.items, "checked");
                    break;
                case 'user':
                    _tempGroups = vm.determineSearchString(vm.usersForReport.items, "checked");
                    break;
                case 'storename':
                    _tempGroups = vm.determineSearchString(vm.storesForReport.items, "checked");
                    break;
            }
            checkedGroups = _tempGroups && _tempGroups.split(",").toObject();
            //used for forLoop
            var singleRow = {};
            for (var groupKey in this.groupSeriesData) {
                if (checkedGroups !== null && !checkedGroups[groupKey]) {
                    continue;
                }
                singleRow = this.groupSeriesData[groupKey];
                series[0].data.push({ name: groupKey, y: singleRow[column] || 0 });
            }
            this.groupCharts = this.groupCharts || [];
            this.groupCharts.push(this.genratorPieChart(chartDom, series, column));
        },
        genratorColumnChart: function (el, series, categories, title, unit) {
            var vm = this;
            vm.loading = true;
            return Highcharts.chart(el, {
                chart: {
                    type: 'column'
                },
                title: {
                    text: title
                },
                subtitle: {
                    // text: document.ontouchstart === undefined ?
                    //     'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    categories: categories,
                    labels: {
                        rotation: -50,
                        y: 33,
                        align: 'center',
                        step: 1
                    }
                },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.1f}</b> ' + (unit || ''),
                    shared: true
                },
                plotOptions: {
                    column: {
                        cursor: 'pointer',
                        showInLegend: false,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.1f}' + (unit || '')
                        }
                    }
                },
                series: series
            }, function () {
                vm.loading = false;
            });
        },
        drawColumnChart: function (chartDom, column, unit) {
            var vm = this;
            var series = [{
                name: column,
                type: 'column',
                colorByPoint: true,
                data: [],
                showInLegend: false
            }];
            var checkedGroups = [];
            var _tempGroups = null;
            var _tempColumns = null;
            switch (this.searchData.groupBy) {
                case 'machine':
                    _tempGroups = vm.determineSearchString(vm.machinesForReport.items, "checked");
                    break;
                case 'user':
                    _tempGroups = vm.determineSearchString(vm.usersForReport.items, "checked");
                    break;
                case 'storename':
                    _tempGroups = vm.determineSearchString(vm.storesForReport.items, "checked");
                    break;
            }
            checkedGroups = _tempGroups && _tempGroups.split(",").toObject();
            //used for forLoop
            var singleRow = {};
            for (var groupKey in this.groupSeriesData) {
                if (checkedGroups !== null && !checkedGroups[groupKey]) {
                    continue;
                }
                singleRow = this.groupSeriesData[groupKey];
                series[0].data.push(singleRow[column] || 0);
            }
            this.groupCharts = this.groupCharts || [];
            this.groupCharts.push(this.genratorColumnChart(chartDom, series, Object.keys(this.groupSeriesData), column, unit));
        },
        updateGroupChartFilters: function () {
            switch (this.searchData.groupBy) {
                case 'machine':
                    Vue.set(this.machinesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'user':
                    Vue.set(this.usersForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: item }; }));
                    break;
                case 'storename':
                    Vue.set(this.storesForReport, "items", Object.keys(this.groupSeriesData).sort(function (a, c) { return (a > c) ? 1 : -1; }).map(function (item, index) { return { checked: index < 10, id: item, text: (item === "") ? "-" : item }; }));
                    break;
            }
        },
        updateGroupChart: function () {
            if (!this.groupCharts || !this.groupCharts.length) { return; }
            this.drawCharts();
        }
    },
    created: function () {
        var vm = this;
        vm.getLists((function (data) {
            Vue.set(vm.users, "items", data.users.map(function (item) { return { checked: true, id: item.userID, text: item.account } }));
            Vue.set(vm.machines, "items", data.machines.map(function (item) { return { checked: true, id: item.pcbID, text: item.pcbID + "-" + item.machineName } }));
            Vue.set(vm.stores, "items", data.stores.map(function (item) { return { checked: true, id: item, text: item } }));
        }).bind(vm));
    },
    mounted: function () {
    }
};

const ProfileSetting = {
    mixins: [PageBase],
    data: function () {
        return {
            loading: false,
            editModel: {
                oldPassword: null, password: null, confirm: null
            },
            submited: false
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {
        resetParams: function () {
            this.editModel.oldPassword = null;
            this.editModel.password = null;
            this.editModel.confirm = null;
            this.submited = false;
            PageBase.methods.resetParams.call(this);
        },
        chkPassword: function (pwd) {
            return /^(?=.*[0-9])(?=.*[a-z])(.{8,20})$/.test(pwd);
        },
        chkPolicy: function (model) {
            return model.oldPassword && this.chkPassword(model.password) && model.password == model.confirm;
        },
        encryptedPassword: function (pwd) {
            return CryptoJS.SHA512(pwd).toString(CryptoJS.enc.Hex);
        },
        changePassword: function (ev) {
            var vm = this;
            vm.submited = true;
            if (vm.chkPolicy(vm.editModel)) {
                vm.submited = false;
                delete vm.editModel.confirm;
                vm.editModel.oldPassword = vm.encryptedPassword(vm.editModel.oldPassword);
                vm.editModel.password = vm.encryptedPassword(vm.editModel.password);
                Vue.http.post('/api/profile/password', vm.editModel, { emulateJSON: true }).then(function (res) {
                    if (res.body.code == 200) {
                        alert("Password changed.");
                    }
                    else {
                        vm.editModel.oldPassword = null;
                        vm.editModel.password = null;
                        alert("Change password failed: " + res.body.message);
                    }
                }).catch(function(){
                    vm.editModel.oldPassword = null;
                    vm.editModel.password = null;
                    app.handlerError();
                });
            }
            else {
                vm.submited = true;
                ev.preventDefault();
            }
        }
    },
    created: function () {
    },
    mounted: function () {
    }
}

const router = new VueRouter({
    mode: 'history',
    base: '/',
    linkActiveClass: 'active',
    routes: [
        { path: '/dashboard', component: getTemplate('dashboard', Home) },
        { path: '/machines/list', component: getTemplate('machines/list', MachineList, "machineList.view") },
        { path: '/machines/transfer', component: getTemplate('machines/transfer', MachineTransfer, "machineTransfer.view") },
        { path: '/accounting/machine', component: getTemplate('accounting/accounting', Accounting, "accounting.view") },
        { path: '/accounting/user', component: getTemplate('accounting/accounting', Accounting, "accounting.view") },
        { path: '/accounting/storename', component: getTemplate('accounting/accounting', Accounting, "accounting.view") },
        { path: '/operations/day', component: getTemplate('operations/operations', Operations, "operations.view") },
        { path: '/operations/week', component: getTemplate('operations/operations', Operations, "operations.view") },
        { path: '/operations/month', component: getTemplate('operations/operations', Operations, "operations.view") },
        { path: '/transactions', component: getTemplate('transactions/transactions', Transactions, "transactions.view") },
        { path: '/users/core', component: getTemplate('users/core', Core, "coreUser.view") },
        { path: '/users/agency', component: getTemplate('users/agency', Agency, "agency.view") },
        { path: '/settings/version', component: getTemplate('settings/versionsetting', VersionSetting, "versionSetting.view") },
        { path: '/settings/jpserver', component: getTemplate('settings/jpserver', JPServer, "jpStatus.view") },
        { path: '/reports/jackpot', component: getTemplate('reports/jackpot', ReportJackpot, "reportJackpot.view") },
        { path: '/reports/machine', component: getTemplate('reports/machine', ReportMachine, "reportMachine.view") },
        { path: '/reports/revenue', component: getTemplate('reports/revenue', ReportRevenue, "reportRevenue.view") },
        { path: '/profile', component: getTemplate('profile/setting', ProfileSetting) }
    ]
});

var app = new Vue({
    router,
    delimiters: ['{/', '/}'],
    el: '#app',
    data: function () {
        return { loginUser: null };
    },
    computed: {
        loginUserName: function () {
            return (this.loginUser || {}).account;
        }
    },
    methods: {
        logout: function () {
            $('<form action="/logout" method="POST"></form>').appendTo('body').submit();
        },
        handlerError: function (err) {
            console.warn(err);
            if (err && err.status === 403) {
                alert('Login session expired or no permission, please login.');
                location = ["/login", "?r=", location.pathname, location.search].join('');
            } else {
                alert('There are some exceptions occured, please try later.');
            }
        },
        chkPermission: function (permission) {
            if(!permission){return true;}
            if (!this.loginUser || !this.loginUser.permissions) { return false; }//get loginstatus not yet
            var _permission = permission;
            var _t = this.loginUser.permissions;
            var _ps = _permission.split(".");
            for (var i in _ps) {
                _t = _t[_ps[i]];
                if (!_t) { console.warn(_permission); return false; }
            }
            if (_permission === "" || /^true$/i.test(_t)) {
                return true;
            }
            else {
                return false;
            }
        },
        getUserStatus: function (callback) {
            var vm = this;
            if (vm.loginUser) { callback && typeof callback === "function" && callback.apply(vm); return; }
            Vue.http.get("/getloginstatus").then(function (res) {
                if (res.body.code == 200) {
                    Vue.set(vm, "loginUser", res.body.data);
                    if (callback && typeof (callback) === "function") {
                        callback.apply(vm);
                    }
                }
            }).catch(this.handlerError);
        }
        // ,
        // getAccounts: function (cb) {
        //     var r = [];
        //     for (var i = 0; i < 20; i++) {
        //         r.push({ text: 'test test' + i, id: i, check: true });
        //     } cb(r);
        // },
        // getStores: function (cb) {
        //     var r = [];
        //     for (var i = 0; i < 30; i++) {
        //         r.push({ text: 'test test' + i, id: i, check: true });
        //     } cb(r);
        // },
        // getMachines: function (cb) {
        //     var r = [];
        //     for (var i = 0; i < 50; i++) {
        //         r.push({ text: 'test test' + i, id: i, check: true });
        //     } cb(r);
        // },
        // getTransactionTypes: function (cb) {
        //     var r = [];
        //     for (var i = 0; i < 50; i++) {
        //         r.push({ text: 'test test' + i, id: i, check: true });
        //     } cb(r);
        // },
        // getGameTypes: function (cb) {
        //     var r = [];
        //     for (var i = 0; i < 10; i++) {
        //         r.push({ text: 'test test' + i, id: i, check: true });
        //     } cb(r);
        // }
    },
    watch: {
        loginUser: function () {
            initJqueryPlugin();
        }
    },
    created: function () {
        this.getUserStatus();
    },
    mounted: function () {
    }
});

Vue.component('date-picker', VueBootstrapDatetimePicker);
$.extend(true, $.fn.datetimepicker.defaults, {
    // debug: true,
    format: 'YYYY/MM/DD H:mm:ss',
    showClear: true,
    showClose: true,
    icons: {
        time: 'far fa-clock',
        date: 'far fa-calendar',
        up: 'fas fa-arrow-up',
        down: 'fas fa-arrow-down',
        previous: 'fas fa-chevron-left',
        next: 'fas fa-chevron-right',
        today: 'fas fa-calendar-check',
        clear: 'far fa-trash-alt',
        close: 'far fa-times-circle'
    }
});

Highcharts.setOptions({
    time: {
        timezone: 'Asia/Taipei'
    }
});