class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playgroud = $(`
        <div>游戏界面</div>
        `)

        this.hide(); // 一开始隐藏
        this.root.$ac_game.append(this.$playgroud);

        this.start();
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