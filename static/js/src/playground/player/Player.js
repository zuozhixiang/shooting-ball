
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
    }

    attacked (angle, damage) {
        // 被攻击了
        this.radius -= damage;// 被攻击的圆的, 将会减少
        if (this.radius < 10) { // 半径小于10, 就等于死亡
            console.log(123);
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
            if (!outer.is_live) return;
            if (e.which === 3) { // 点击事件, which = 1, 左键, which= 2, 滚轮, which = 3, 右键
                outer.move_to(e.clientX, e.clientY); // 点击位置的坐标
            }
            if (e.which === 1) { // 鼠标左键
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
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
        this.ctx.beginPath();
        // 参数分别是圆心坐标, 半径, 弧度0~360, 是否顺时针
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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
