#! /usr/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])  # 引用django内的包
from match_server.match_service import Match  # 引入thrift的包

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer
from queue import Queue
from time import sleep  
from threading import Thread
from acapp.asgi import channel_layer
from asgiref.sync import async_to_sync  # 将多线程函数转换为单线程的
from django.core.cache import cache


queue = Queue() # 消息队列

class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score, self.uuid, self.username, self.photo, self.channel_name = score, uuid, username, photo, channel_name
        self.waiting_time  = 0 # 等待时间, 时间越长, 匹配的对象的范围更大, 成功率更高
class Pool:
    def __init__(self):
        self.players = []
    
    def add_player(self, player):
        self.players.append(player)

    def check_match(self, a, b):
        # if a.username == b.username: return False
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50  # 与自己的分值允许的最大差距
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif
    
    def match_success(self, ps):
        print("Match success: %s, %s, %s" % (ps[0].username, ps[1].username, ps[2].username))
        room_name = f"room-{ps[0].uuid}-{ps[1].uuid}-{ps[2].uuid}"
        players = []
        for p in ps:
            # 吧每个玩家加到channel的一个组内
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                'hp': 100, # 血条
            })
        # 吧玩家加入到redis里面
        cache.set(room_name, players, 3600)
        for p in ps:
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type': 'group_send_event',
                    'event': 'create_player',
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                }
            )
    
    def increas_watiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def match(self):
        # 当请求队列的中的玩家数量超过3, 就可以开始匹配了
        while len(self.players) >= 3:
            self.players.sort(key=lambda p: p.score)  # 吧分值最近的三名玩家匹配
            flag = False  # 是否匹配成功
            for i in range(len(self.players) - 2):
                # 枚举所有的三对
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                if self.check_match(a, b) and self.check_match(b, c) and self.check_match(a, c):
                    flag = True    
                    self.players = self.players[:i] + self.players[i + 3:]  # 吧这三个玩家删除
                    self.match_success([a, b, c])
                    break
            if not flag:
                break

        self.increas_watiting_time()
def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None

def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)


class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        player  = Player(score, uuid, username, photo, channel_name)
        print(f"add player {player.username}, {player.score}")
        queue.put(player)
        return 0

if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)  # 单线程的

    # You could do one of these for a multithreaded server
    server = TServer.TThreadedServer(                        # 多线程的
         processor, transport, tfactory, pfactory)
    # server = TServer.TThreadPoolServer(                          # 线程池
    #     processor, transport, tfactory, pfactory)
    Thread(target=worker, daemon=True).start()
    print('Starting the server...')
    server.serve()
    print('done.')