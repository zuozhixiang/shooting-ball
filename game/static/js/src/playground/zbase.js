
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playgroud = $(`
        <div class="ac-game-playground"></div>
        `)

        // this.hide(); // 一开始隐藏
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



        this.start();
    }

    get_random_color () {
        return this.colors[Math.floor((Math.random() * 5))];
    }

    start () {

    }

    show () { // 显示playground界面
        this.$playgroud.show();
    }

    hide () {
        this.$playgroud.hide();
    }
}
