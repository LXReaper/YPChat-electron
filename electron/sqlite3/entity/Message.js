const {db} = require('../DataBase')

// 消息类(表格使用 => Message + 用户id)，可以多张表，每张表表示跟一个用户对话
class Message {
    #userId;// 聊天的对象id
    constructor(userId) {
        this.#userId = userId;
        Message.createTable();// 尝试创建表
    }

    static createTable () {
        db.prepare(`
            create table if not exists Message${this.#userId} (
                id integer not null primary key autoincrement, -- 主键
                from_id integer not null, -- 发送方id
                to_id integer not null, -- 接收方id
                status integer default 0  not null, -- 消息状态（正在发送0、发送成功1、发送失败2、已撤销3、已读4）
                type integer default 0 not null, -- 消息类型（文字消息0、图片消息1、视频消息2、文件消息3，语音消息4，音频聊天消息5，视频聊天消息6，公告消息7）
                content text not null, -- 消息内容
                post_time integer default (strftime('%s', 'now')), -- 消息发送时间
                update_time integer default (strftime('%s', 'now')), -- 消息发送时间
                expire integer default (3 * 60 * 1000) not null -- 发送过期时间，默认3分钟
            );
        `).run();
    }

    selectContent (content) {
        const stmt = db.prepare(`
          select *
          from Message${this.#userId}
          where status = 0 and content like ?
        `)
        return stmt.get(`%${content}%`);
    }

    /**
     * 插入消息
     * @param data 消息数据
     */
    insertMessage(data = {
        content: "",
        status: 0,
        type: 0,
        expire: (3 * 60 * 1000)
    }) {

    }
}
/****************Insert********************/
const insertMessage = () => {
    db.prepare(`INSERT INTO users (name) VALUES (?)`)
        .run().finalize();
}
