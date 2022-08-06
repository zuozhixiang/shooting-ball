
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
