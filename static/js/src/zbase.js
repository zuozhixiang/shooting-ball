
export class AcGame { // 整个游戏的类
    constructor(id) {  // 构造函数, 
        this.id = id;
        this.$ac_game = $('#' + id); // 获取id这个div
        // this.menu = new AcGameMenu(this); // 获取菜单界面对象
        this.playground = new AcGamePlayground(this); // 获取游戏界面对象

        this.start();
    }
    start () { }
}