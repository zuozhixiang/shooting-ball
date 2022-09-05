
class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
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
