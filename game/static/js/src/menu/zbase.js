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