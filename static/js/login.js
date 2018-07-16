
var app = new Vue({
    delimiters: ['{/', '/}'],
    el: '#app',
    mixins: [],
    data: function(){
        return {
            loginModel: {
                account: null, password: null, inputPassword: null, rememberMe: null
            },
            submited: false
        }
    },
    watch: {
        "loginModel.inputPassword": function(){
            this.loginModel.password = this.encryptedPassword(this.loginModel.inputPassword);
        }
    },
    methods: {
        encryptedPassword: function(pwd){
            return CryptoJS.SHA512(pwd).toString(CryptoJS.enc.Hex)
        },
        login: function(ev){
            var vm = this;
            vm.submited = true;
            if (vm.loginModel.account && vm.loginModel.inputPassword) {
                // vm.loginModel.password = vm.encryptedPassword(vm.loginModel.inputPassword);
                // vm.$http.post('/login', 
                // {account: vm.loginModel.account, password: vm.loginModel.password, rememberMe: vm.loginModel.rememberMe}, 
                // {
                //     emulateJSON: true,
                //     credentials: true
                // }).then(function (res) {
                //     if(res.body.code == 200){
                //         //vm.getUsers();
                //         alert('success');
                //     }
                //     else{
                //         alert("Login fail: " + res.body.message);
                //     }
                //     vm.submited = false;
                // });
            }
            else {
                this.submited = true;
                ev.preventDefault();
            }
        }
    },
    mounted: function(){
        if(/^true$/i.test(this.$refs.dLogin.value)){
            location = Utils.url.getSearchValue("r") || "/";
        }
        else if (this.$refs.dMessage.value){
            alert(this.$refs.dMessage.value);
        }
    }
});