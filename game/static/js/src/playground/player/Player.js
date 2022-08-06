class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;

        // 摩擦力, 用来减小速度, 速度小于eps, 就停止
        this.friction = 0.9;
        this.spent_time = 0;

        //  是不是按下了某个技能
        this.cur_skill = null;

        if (this.character !== 'robot') {
            // 如果是玩家的话, 球的内容, 就是自己的头像
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start () {
        if (this.character === 'me') {  // 如果是玩家自己, 就添加监听事件, 例如鼠标点击移动, q发技能等等
            this.add_listening_events();
        } else if (this.character === 'robot') { // 如果是人机, 随机在地图中, 选择一个位置, 去移动
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
        if (this.character === 'robot' && this.spent_time > 4 && Math.random() < 1 / 300.0) {
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
                if (this.character === 'robot') { // 如果是人机的话, 随机下一个移动点
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
        if (this.character !== 'robot') {  // 如果是玩家, 就画圆, 圆里面填充头像
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
