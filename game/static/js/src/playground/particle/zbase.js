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
