class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
        <div class="ac-game-settings">
            <div class ="ac-game-settings-login">
                <div class="ac-game-settings-title">
                    登录
                </div>
                <div class="ac-game-settings-username">
                    <input type="text" placeholder="用户名">
                </div>
                <div class="ac-game-settings-password">
                    <input type="password" placeholder="密码">
                </div>
                <div class="ac-game-settings-submit">
                    <button>登录</button>
                </div>
                <div class="container">
                    <div class="ac-game-settings-others">
                        <div class="ac-game-settings-error"></div>
                        <div class="ac-game-settings-option">注册</div>
                    </div>
                </div>

                <div class="ac-game-settings-acwinglogin">
                    <img src="https://app2922.acapp.acwing.com.cn/static/image/settings/logo.png" width="30">
                    <div>AcWing一键登录</div>
                </div>
            </div>
            <div class ="ac-game-settings-register">
                <div class="ac-game-settings-title">
                    注册
                </div>
                <div class="ac-game-settings-username">
                    <input type="text" placeholder="用户名">
                </div>
                <div class="ac-game-settings-password  pwd">
                    <input type="password" placeholder="密码">
                </div>
                <div class="ac-game-settings-password repwd">
                    <input type="password" placeholder="确认密码">
                </div>
                <div class="ac-game-settings-submit">
                    <button>注册</button>
                </div>
                <div class="container">
                    <div class="ac-game-settings-others">
                        <div class="ac-game-settings-error"></div>
                        <div class="ac-game-settings-option">登录</div>
                    </div>
                </div>

                <div class="ac-game-settings-acwinglogin">
                    <img src="https://app2922.acapp.acwing.com.cn/static/image/settings/logo.png" width="30">
                    <div>AcWing一键注册</div>
                </div>
            </div>
        </div>
        
        `)

        this.$login = this.$settings.find('.ac-game-settings-login');
        this.$register = this.$settings.find('.ac-game-settings-register');
        this.$login.hide();
        this.$register.hide();
        this.root.$ac_game.append(this.$settings);

        // register
        this.$login_username = this.$login.find('.ac-game-settings-username input');
        this.$login_password = this.$login.find('.ac-game-settings-password input');
        this.$login_submit = this.$login.find('.ac-game-settings-submit button');
        this.$login_message = this.$login.find('.ac-game-settings-error');
        this.$login_register = this.$login.find('.ac-game-settings-option');


        this.$register_username = this.$register.find('.ac-game-settings-username input');
        this.$register_password = this.$register.find('.pwd input');
        this.$register_repassword = this.$register.find('.repwd input');
        this.$register_submit = this.$register.find('.ac-game-settings-submit button');
        this.$register_message = this.$register.find('.ac-game-settings-error');
        this.$register_login = this.$register.find('.ac-game-settings-option');

        this.start();
    }

    login_remote () {
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_message.empty();
        let outer = this;

        $.ajax({
            url: 'https://app2922.acapp.acwing.com.cn/settings/login/',
            type: 'GET',
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.res === "success") {
                    location.reload();
                } else {
                    outer.$login_message.html(resp.res);
                }
            }
        })
    }

    register_remote () {
        console.log(this);
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let repassword = this.$register_repassword.val();
        this.$register_message.empty();
        let outer = this;

        $.ajax({
            url: 'https://app2922.acapp.acwing.com.cn/settings/register/',
            type: 'GET',
            data: {
                username: username,
                password: password,
                repassword: repassword,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.res === "success") {
                    // location.reload();
                } else {
                    outer.$register_message.html(resp.res);
                }
            }
        })
    }

    logout () {
        if (this.platform === "ACAPP") return false;
        $.ajax({
            url: "https://app2922.acapp.acwing.com.cn/settings/logout/",
            type: 'GET',
            success: function (resp) {
                if (resp.res === "success") {
                    location.reload();
                }
            }
        })
    }

    start () {
        this.add_listen_events();
        this.get_info();
    }

    add_listen_events () {
        this.add_listen_events_login();
        this.add_listen_events_register();
    }

    add_listen_events_login () {
        let outer = this;
        this.$login_register.click(function () {
            outer.register();
        })
        this.$login_submit.click(function () {
            outer.login_remote();
        })
    }

    add_listen_events_register () {
        let outer = this;
        this.$register_login.click(function () {
            outer.login();
        })
        this.$register_submit.click(function () {
            outer.register_remote();
        })
    }

    login () {
        this.$register.hide();
        this.$login.show();
    }

    register () {
        this.$login.hide();
        this.$register.show();
    }

    get_info () {
        let outer = this;
        $.ajax({
            url: 'https://app2922.acapp.acwing.com.cn/settings/getInfo/',
            type: 'GET',
            data: {
                platform: outer.platform
            },
            success: function (resp) {
                if (resp.res === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide () {
        this.$settings.hide();
    }
    show () {
        this.$settings.show();
    }
}