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
