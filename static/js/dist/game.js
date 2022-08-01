class AcGameMenu { // 菜单类
    constructor(root) { // root就是acgame这个对象
        this.root = root;
        this.$menu = $(`
        <div class="ac-game-menu">
            <div class="ac-game-menu-filed">
                <div class="ac-game-menu-filed-item ac-game-menu-filed-item-single">
                    单人模式
                </div>
                <div class="ac-game-menu-filed-item ac-game-menu-filed-item-multi">
                    多人模式
                </div>
                <div class="ac-game-menu-filed-item ac-game-menu-filed-item-settings">
                    退出
                </div>
            </div>
        </div>
        `);  // 加上$ 表示html元素
        // 将$menu 加入到ac_game的div里面
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find('.ac-game-menu-filed-item-single');
        this.$multi = this.$menu.find('.ac-game-menu-filed-item-multi');
        this.$settings = this.$menu.find('.ac-game-menu-filed-item-settings');
        this.hide();
        this.start();
    }

    start () {
        this.add_listen_events();
    }

    // 给三个按钮绑定事件
    add_listen_events () {
        let outer = this;
        this.$single.click(function () { // 点击单人模式
            outer.hide() // 菜单界面隐藏
            outer.root.playground.show(); // 游戏界面打开
        });

        this.$multi.click(function () {
            console.log("click multi");
        });

        this.$settings.click(function () {
            outer.root.settings.logout();
        });
    }

    show () { // 显示菜单
        this.$menu.show();
    }

    hide () { // 隐藏菜单
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = []

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.hash_call_start = false; // 是否已经执行过start
        this.timedelta = 0; // 当前距离上一帧的时间间隔

    }

    start () { // 只会在第一帧执行

    }

    update () { // 每一帧都会执行

    }

    on_destroy () { // 删除之前执行

    }

    destroy () {
        this.on_destroy();
        // 销毁时对象
        for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp; // 上一帧的时间

let AC_GAME_ANIMATION = function (timestamp) {

    for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.hash_call_start) { // 未执行过第一帧
            obj.hash_call_start = true;
            obj.start();
        }
        else { // 执行更新, 
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp; // 更新上一帧
    requestAnimationFrame(AC_GAME_ANIMATION); // 递归下一帧
}


requestAnimationFrame(AC_GAME_ANIMATION);  //每一帧调用这个函数

class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`) // canvas标签
        this.ctx = this.$canvas[0].getContext('2d'); // 二维画布
        // 画布的高度和宽度
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.playground.$playgroud.append(this.$canvas);
    }
    start () {

    }

    update () {
        this.render();
    }

    render () {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}


class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.fration = 0.9;

        this.eps = 30;
    }

    start () {

    }

    update () {
        if (this.speed < this.eps) {
            this.destroy();
            return false;
        }

        this.x += this.vx * this.speed * this.timedelta / 1000;
        this.y += this.vy * this.speed * this.timedelta / 1000;
        this.speed *= this.fration;
        this.render();
    }

    render () {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.1; // 误差小于eps 就是0

        this.vx = 0; // x, y方向的速度的百分比, 最大是1, 
        this.vy = 0;
        this.move_length = 0;

        // 被击退的方向和速度
        this.damagex = 0;
        this.damagey = 0;
        this.damage_speed = 0;
        // 被击退的时候, 先开始击退速度快, 后面击退速度就小了, 有个摩擦力
        this.fraction = 0.9;

        this.time = 0;
        // 下面是技能
        this.cur_skill = null;

        this.is_live = true;

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    attacked (angle, damage) {
        // 被攻击了
        this.radius -= damage;// 被攻击的圆的, 将会减少
        if (this.radius < 10) { // 半径小于10, 就等于死亡
            this.is_live = false;
            this.destroy();
            return false;
        }
        else {
            // 被攻击后, 就不能动
            this.damagex = Math.cos(angle);
            this.damagey = Math.sin(angle);

            this.damage_speed = damage * 3;

            this.speed *= 0.9; // 移动速度变小

            for (let i = 0; i < 15 + Math.random() * 5; ++i) {
                let angle = Math.PI * 2 * Math.random();
                new Particle(this.playground, this.x, this.y, this.radius * 0.1, Math.cos(angle), Math.sin(angle), this.color, this.speed * 2.5);
            }
        }
    }
    add_listen_events () {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        }); // 取消点击右键的默认事件

        this.playground.game_map.$canvas.mousedown(function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (!outer.is_live) return;
            if (e.which === 3) { // 点击事件, which = 1, 左键, which= 2, 滚轮, which = 3, 右键
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top); // 点击位置的坐标
            }
            if (e.which === 1) { // 鼠标左键
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }
                outer.cur_skill = null;
            }
        })

        $(window).keydown(function (e) {
            if (e.which === 81) { // 按q
                outer.cur_skill = "fireball";
                return false;
            }
        })
    }

    shoot_fireball (tx, ty) {
        let x = this.x, y = this.y, radius = this.radius * 0.4;
        // 计算飞行的角度
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.speed * 2.5;
        let move_length = this.playground.height;
        let damage = this.radius * 0.2; // 每次攻击, 减少1/5的生命值
        new FireBall(this.playground, this, x, y, radius, vx, vy, speed, color, move_length * 1.3, damage);
    }

    get_dist (x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to (tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x); // artan() 求角度, 朝向什么角度移动
        // x, y上的速度
        this.vx = Math.cos(angle); // 
        this.vy = Math.sin(angle);

    }

    start () {
        if (this.is_me) {
            this.add_listen_events();
        }
        else { // 人机的话, 随机找一点, 
            let tx = Math.random() * this.playground.width, ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    update () {
        if (!this.is_live) {
            return;
        }
        this.time += this.timedelta / 1000; // 超过五秒, 人机才开始攻击玩家
        if (this.time >= 5 && !this.is_me && Math.random() < 1 / 240.0) {
            // 人机随便选一个玩家攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if (player != this) // 不能是自己
                this.shoot_fireball(player.x, player.y);
        }
        if (this.damage_speed > this.eps) {
            // 如果被击退了, 就失去了控制
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damagex * this.damage_speed;
            this.y += this.damagey * this.damage_speed;
            this.damage_speed *= this.fraction;
        }
        else {
            if (this.move_length < this.eps) { // 不需要移动了
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width, ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }
            else {
                // 实际这一帧移动的距离, 是剩下的移动距离, 和这一帧能移动的距离
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved; // cos(angle) * 移动的距离, 就是x方向移动的距离
                this.y += this.vy * moved; // sin * 移动的距离
                this.move_length -= moved; // 减去这一帧移动的距离
            }
        }


        this.render();
    }

    render () {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        }
        else {
            this.ctx.beginPath();
            // 参数分别是圆心坐标, 半径, 弧度0~360, 是否顺时针
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

    }

    on_destroy () {
        for (let i = 0; i < this.playground.players.length; ++i) {
            if (this == this.playground.players[i]) {
                this.playground.players.splice(i, 1);
                this.is_live = false;
            }
        }
    }
}

class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, speed, color, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.color = color;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }

    start () { }

    update () {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);

        this.x += this.vx * moved;
        this.y += this.vy * moved;

        this.move_length -= moved;

        // 在这里判断火球是否与玩家碰撞
        for (let i = 0; i < this.playground.players.length; ++i) {
            let player = this.playground.players[i];
            if (this.player != player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist (x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision (player) {
        let dist = this.get_dist(this.x, this.y, player.x, player.y);
        if (dist <= this.radius + player.radius) return true;
        return false;
    }

    attack (player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.attacked(angle, this.damage);
        this.destroy();
    }

    render () {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playgroud = $(`
        <div class="ac-game-playground"></div>
        `)

        this.hide(); // 一开始隐藏
        this.start();
    }

    get_random_color () {
        return this.colors[Math.floor((Math.random() * 5))];
    }

    start () {

    }

    show () { // 显示playground界面
        this.$playgroud.show();
        this.root.$ac_game.append(this.$playgroud);

        // 保存界面高度和宽度
        this.width = this.$playgroud.width();
        this.height = this.$playgroud.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.colors = ["red", "blue", "pink", "grey", "green"];

        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.04, "white", this.height * 0.25, true));
        for (let i = 0; i < 5; ++i) {
            // 人机
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.04, this.get_random_color(), this.height * 0.25, false));
        }

    }

    hide () {
        this.$playgroud.hide();
    }
}
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
        
        `);

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

        this.$acwing_login = this.$settings.find(".ac-game-settings-acwinglogin img");

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
                    location.reload();
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
        if (this.platform === 'ACAPP') {
            this.get_info_acapp();
        }
        else {
            this.add_listen_events();
            this.get_info_web();
        }

    }

    acwing_login () {
        $.ajax({
            url: "https://app2922.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.res === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        })
    }
    add_listen_events () {
        this.add_listen_events_login();
        this.add_listen_events_register();
        let outer = this;
        this.$acwing_login.click(function () {
            outer.acwing_login();
        })
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

    get_info_web () {
        let outer = this;
        $.ajax({
            url: 'https://app2922.acapp.acwing.com.cn/settings/getInfo/',
            type: 'GET',
            data: {
                platform: outer.platform
            },
            success: function (resp) {
                console.log(resp);
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
    acapp_login (appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, (resp) => {
            console.log(resp, 123123123);
            if (resp.res === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    get_info_acapp () {
        let outer = this;
        $.ajax({
            url: 'https://app2922.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/',
            type: 'get',
            success (resp) {
                if (resp.res === 'success') {
                    // 成功获取到appid, state, scope等信息
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        })
    }

    hide () {
        this.$settings.hide();
    }
    show () {
        this.$settings.show();
    }
}
export class AcGame { // 整个游戏的类
    constructor(id, AcWingOS) {  // 构造函数, 
        console.log(AcWingOS);
        this.id = id;
        this.AcWingOS = AcWingOS;
        this.$ac_game = $('#' + id); // 获取id这个div

        this.menu = new AcGameMenu(this); // 获取菜单界面对象
        this.settings = new Settings(this);
        this.playground = new AcGamePlayground(this); // 获取游戏界面对象

        this.start();
    }
    start () { }
}