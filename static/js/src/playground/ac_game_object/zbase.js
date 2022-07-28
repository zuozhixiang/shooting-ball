
let AC_GAME_OBJECTS = []

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.hash_call_start = false; // 是否已经执行过start
        this.timedelta = 0; // 当前距离上一帧的时间间隔

    }

    start () { // 只会在第一帧执行

    }

    update () { // 每一帧都会执行

    }

    on_destroy () { // 删除之前执行

    }

    destroy () {
        this.on_destroy();
        // 销毁时对象
        for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp; // 上一帧的时间

let AC_GAME_ANIMATION = function (timestamp) {

    for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.hash_call_start) { // 未执行过第一帧
            obj.hash_call_start = true;
            obj.start();
        }
        else { // 执行更新, 
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp; // 更新上一帧
    requestAnimationFrame(AC_GAME_ANIMATION); // 递归下一帧
}


requestAnimationFrame(AC_GAME_ANIMATION);  //每一帧调用这个函数
