
class MultiPlayerSock {
  constructor(playground) {
    this.playground = playground;
    this.ws = new WebSocket("wss://app2989.acapp.acwing.com.cn/wss/multiplayer/");

    this.start();
  }

  start () {
    this.receive();
  }

  receive () { // 接收服务器发来的信息
    let outer = this;
    this.ws.onmessage = function (e) {
      let data = JSON.parse(e.data);
      if (data.uuid === outer.uuid) return false;
      let event = data.event;
      if (event === "create_player") {
        outer.receive_create_player(data.uuid, data.username, data.photo);
      }
    }
  }

  send_create_player (username, photo) { // 向服务器发送创建玩家的消息
    let outer = this;
    this.ws.send(JSON.stringify({
      'event': 'create_player',
      'uuid': outer.uuid,
      'username': username,
      'photo': photo,
    }));
  }

  receive_create_player (uuid, username, photo) { // 接收服务器发送来的创建玩家的消息


    let player = new Player(
      this.playground,
      this.playground.width / 2 / this.playground.scale,
      0.5,
      0.05,
      "white",
      0.15,
      "enemy",
      username,
      photo,
    );
    player.uuid = uuid;
    this.playground.players.push(player);
  }

}