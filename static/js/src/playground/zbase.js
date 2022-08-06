
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

    show (mode) { // 显示playground界面, 游戏界面, 显示地图的, 和玩家

        const outer = this;
        this.$playgroud.show();

        // 保存界面高度和宽度
        this.width = this.$playgroud.width();
        this.height = this.$playgroud.height();
        // 创建游戏地图
        this.game_map = new GameMap(this);
        this.resize();
        this.players = [];
        this.colors = ["red", "blue", "pink", "grey", "green"];

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === 'single mode') { // 单人模式添加人机
            for (let i = 0; i < 5; ++i) {
                // 人机
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if (mode === 'multi mode') { // 默认模式
            this.mps = new MultiPlayerSock(this);  // 建立多人模式的websocket连接
            this.mps.uuid = this.players[0].uuid; // 连接的id 取为自己玩家的id
            this.mps.ws.onopen = function () { // 当连接创建成功后, 调用这个函数
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide () {
        this.$playgroud.hide();
    }
}
