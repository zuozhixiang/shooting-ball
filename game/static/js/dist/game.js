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
    constructor(playground) { // 游戏地图
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`) // canvas标签
        this.ctx = this.$canvas[0].getContext('2d'); // 二维画布
        // 画布的高度和宽度
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.playground.$playgroud.append(this.$canvas); // 吧画图标签添加进去
    }
    start () {
    }

    // 修改游戏地图的大小
    resize () {
        this.ctx.canvas.width = this.playground.width
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"; // 大小改变后, 应该立即画一层不透明全黑的背景
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update () {
        this.render();
    }

    render () {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";  // 透明度0.2的效果, 就是球移动后, 会产生残影
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        // 粒子的构造函数
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length; // 粒子的移动距离
        this.friction = 0.9; // 摩擦力, 用来减少速度的
        this.eps = 0.01;
    }

    start () {
    }

    update () {
        // 当速度小于eps, 或者当移动长度小于eps的时候, 就销毁
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        // 更新移动距离和速度
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render () { // 渲染
        let scale = this.playground.scale;  // 基准

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        // 游戏的画布
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        // 在x方向, y方向的速度, cos, sin, 都是小数, vx^2 + vy^ 2 = 1, 
        this.vx = 0;
        this.vy = 0;
        // 击退的方向在, x 和y的速度
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        // 玩家移动的距离
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        // 是不是玩家, 若不是, 则是人机
        this.is_me = is_me;
        this.eps = 0.01;

        // 摩擦力, 用来减小速度, 速度小于eps, 就停止
        this.friction = 0.9;
        this.spent_time = 0;

        //  是不是按下了某个技能
        this.cur_skill = null;

        if (this.is_me) {
            // 如果是玩家的话, 球的内容, 就是自己的头像
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start () {
        if (this.is_me) {  // 如果是玩家, 就添加监听事件, 例如鼠标点击移动, q发技能等等
            this.add_listening_events();
        } else { // 如果是人机, 随机在地图中, 选择一个位置, 去移动
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events () {
        let outer = this;
        // 取消掉, 画布的鼠标右击的默认事件
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        // 添加鼠标点击事件
        this.playground.game_map.$canvas.mousedown(function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) { // 右击, 移动到某一点
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            } else if (e.which === 1) { // 左击, 如果有技能, 就发火球
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }
                // 技能发完, 取消掉
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) { // 添加 键盘按下q的事件, 选中火球技能  
            if (e.which === 81) {  // q
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball (tx, ty) { // 发射火球技能
        // 下面是火球的参数
        let x = this.x, y = this.y; // 位置
        let radius = 0.01; // 火球的半径
        // 火球移动的角度
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange"; // 颜色
        let speed = 0.5; // 速度
        let move_length = 1; // 火球能移动的距离
        let damage = 0.01; // 伤害, 火球的伤害是玩家球的半径的1/5, 意思是被攻击五次, 玩家球的半径就减少到0了
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage); // 
    }

    get_dist (x1, y1, x2, y2) { // 辅助函数, 计算两点距离
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to (tx, ty) { // 移动到某一点的函数, 就是更新他的移动距离, 以及移动的方向
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked (angle, damage) { // 玩家球被攻击后的反应, 参数是被攻击后的, 移动的角度和伤害
        // 先产生粒子效果, 随机参数20~30个球
        for (let i = 0; i < 20 + Math.random() * 10; i++) {
            let x = this.x, y = this.y; // 位置是玩家球的位置
            let radius = this.radius * Math.random() * 0.1; // 半径是玩家球的0~1/10大小
            let angle = Math.PI * 2 * Math.random(); // 随机选择一个角度
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;  // 颜色和玩家球一直
            let speed = this.speed * 10; // 速度是玩家球的10倍
            let move_length = this.radius * Math.random() * 5; // 移动距离是玩家球的0~5倍大小
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage; // 被攻击后, 球的半径减少, 
        if (this.radius < this.eps) { // 当玩家球的半径小于eps, 说明球已经很小了, 玩家死了
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);  // 击退的方向, 根据角度算, cos和sin
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100; // 被击退的速度
        this.speed *= 0.8; //玩家球的速度减少
    }

    update () {
        this.update_move(); // 更新移动的位置
        this.render();
    }

    update_move () {  // 更新玩家移动
        // spent_time, 代表已经玩家已经出现了多长时间
        this.spent_time += this.timedelta / 1000;
        // 如果是人机, 只有当超过四秒后, 才能发火球技能, 随机一个球1/300的概率发火球
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            // 人机发火球技能, 随机选择一个目标敌人, 发火球
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            // 预测一下, 攻击玩家的接下来一帧的位置, 就是那个球的当前位置, 加上移动的距离, 
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty); // 发火球
        }

        if (this.damage_speed > this.eps) { // 如果, 还在被击退, 击退速度大于eps
            this.vx = this.vy = 0; // 更新被击退后的位置, 减少击退速度
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else { // 否则的话, 就是正常鼠标移动, 就是判断是不是有移动距离
            if (this.move_length < this.eps) {  // 没有移动距离了, 距离和速度置为0
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) { // 如果是人机的话, 随机下一个移动点
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else { // 有移动距离的话, 就更新下一帧, 应该移动的距离
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;  // 减去已经移动的距离
            }
        }
    }

    render () { // 渲染这一帧的玩家
        let scale = this.playground.scale; // 获取基准, 半径, 位置, 速度都得乘以基准
        if (this.is_me) {  // 如果是玩家, 就画圆, 圆里面填充头像
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            // 吧图片画到球里面
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            // 如果是人机, 只用画圆, 里面填充颜色
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy () { // 摧毁前, 吧玩家从数组中删除, 
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        // 火球技能的构造函数
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed; // 速度
        this.move_length = move_length; // 移动距离
        this.damage = damage; // 伤害
        this.eps = 0.01;
    }

    start () {
    }

    update () { // 更新下一帧
        if (this.move_length < this.eps) {  // 移动长度小于eps, 就可以摧毁了
            this.destroy();
            return false;
        }
        // 更新移动距离
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        // 遍历所有玩家, 判断是否碰撞了
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) { // this.player是发出火球的玩家, 不能攻击自己
                this.attack(player);   // 不是自己并且碰撞了, 就会产生攻击
            }
        }

        this.render(); // 渲染下一帧
    }

    get_dist (x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision (player) {  // 判断火球和玩家是否碰撞了,  两球半径之和, 小于两个球之间的距离
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack (player) { // 产生攻击
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage); // 玩家被攻击后产生的效果, 参数传一个被攻击后, 移动的角度和伤害
        this.destroy(); // 火球自己销毁
    }

    render () {  // 渲染
        let scale = this.playground.scale;  // 基准
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
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
        this.root.$ac_game.append(this.$playgroud);
        this.hide(); // 一开始隐藏
        this.start();
    }

    get_random_color () {
        return this.colors[Math.floor((Math.random() * 5))];
    }

    start () {
        let outer = this;
        // 当窗口大小改变时, 就会触发这个函数
        $(window).resize(function () {
            outer.resize();
        })
    }

    resize () {
        // 窗口的高度和宽度
        this.width = this.$playgroud.width();
        this.height = this.$playgroud.height();

        // 保证, 游戏画布是16:9的比例
        let unit = Math.min(this.width / 16, this.height / 9);

        this.width = unit * 16;
        this.height = unit * 9;

        this.scale = this.height; // 基准, 其他的物体的大小, 都是这个基准的倍数

        if (this.game_map) { // 如果游戏地图存在的话, 当游戏界面大小改变时, 也要改变游戏地图的大小
            this.game_map.resize();
        }
    }

    show () { // 显示playground界面, 游戏界面, 显示地图的, 和玩家
        this.$playgroud.show();

        this.resize();

        // 保存界面高度和宽度
        this.width = this.$playgroud.width();
        this.height = this.$playgroud.height();
        // 创建游戏地图
        this.game_map = new GameMap(this);
        this.players = [];
        this.colors = ["red", "blue", "pink", "grey", "green"];

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, true));
        for (let i = 0; i < 5; ++i) {
            // 人机
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, false));
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
                    <img src="https://app2989.acapp.acwing.com.cn/static/image/settings/logo.png" width="30">
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
                    <img src="https://app2989.acapp.acwing.com.cn/static/image/settings/logo.png" width="30">
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
            url: 'https://app2989.acapp.acwing.com.cn/settings/login/',
            type: 'GET',
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
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
            url: 'https://app2989.acapp.acwing.com.cn/settings/register/',
            type: 'GET',
            data: {
                username: username,
                password: password,
                repassword: repassword,
            },
            success: function (resp) {
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
            url: "https://app2989.acapp.acwing.com.cn/settings/logout/",
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
            url: "https://app2989.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
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
            url: 'https://app2989.acapp.acwing.com.cn/settings/getInfo/',
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
    acapp_login (appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, (resp) => {
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
            url: 'https://app2989.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/',
            type: 'get',
            success (resp) {
                if (resp.res === 'success') {
                    // 成功获取到appid, state, scope等信息
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
                else {
                    console.log(resp.res);
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