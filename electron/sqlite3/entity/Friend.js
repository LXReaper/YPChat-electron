const {db} = require('../DataBase')

class Friend {
    /*好友真实信息*/
    #name;// 好友名称
    #userAvatar;// 好友头像
    #address;// 邮箱
    #userProfile;// 用户简介
    #userRole;// 用户角色：user/admin/vip/ban
    #create_time;// 创建时间

    /*本人给好友定义的信息*/
    #alias;// 备注/别名
    #add_method;// 添加方式
    #tags;// 标签
    #phone_num;// 联系电话
    #description;// 描述
    #auth;// 权限
    #add_time;// 添加用户时间
    #update_time;// 更新时间

    constructor() {
    }

    createFriend() {
        const sql = `
            create table if not exists Friends(
                id integer not null primary key autoincrement, -- 主键
                name text not null,   -- 好友名称
                userAvatar text, -- 好友头像
                address text,    -- 邮箱
                userProfile text,    -- 用户简介
                userRole text default 'user' not null,   -- 用户角色：user/admin/vip/ban
                create_time text,    -- 创建时间

                alias text,  -- 备注/别名
                add_method text, -- 添加方式
                tags text default '[]' not null,   -- 标签，数组的形式
                phone_num text default '[]' not null,  -- 联系电话，数组的形式
                description text,    -- 描述
                auth integer default 0 not null,   -- 权限
                add_time text,   -- 添加用户时间
                update_time text,    -- 更新时间
            )
        `;
        db.prepare(sql).run();
    }

    static insertFriend(friend) {
        if (friend) return;
        const sql = `
            insert into Friends ()
        `
    }
    static selectFriend(condition) {
        if (!condition) return [];
        let res = "";
        let sql = `
            SELECT * FROM Friends 
            where  
            ${condition.name ? `name like('%${condition.name}%') OR` : ''}
            ${condition.userAvatar ? `userAvatar = ${condition.userAvatar} OR` : ''}
            ${condition.address ? `address like('%${condition.address}%') OR` : ""}
            ${condition.userProfile ? `userProfile like('%${condition.userProfile}%') OR` : ''}
            ${condition.create_time ? `create_time = ${condition.create_time} OR` : ''}
            
            ${condition.alias ? `alias like('%${condition.alias}%') OR` : ''}
            ${condition.add_method ? `add_method like('%${condition.add_method}%') OR` : ''} 
            ${condition.tags ? `tags like('%${condition.tags}%') OR` : ''} 
            ${condition.phone_num ? `phone_num = ${condition.phone_num} OR` : ''}
            ${condition.description ? `description like('%${condition.description}%') OR ` : ''}
            ${condition.auth ? `auth = ${condition.auth} OR` : ''}
            ${condition.add_time ? `add_time = ${condition.add_time} OR` : ''}
            ${condition.update_time ? `update_time = ${condition.update_time}` : ''}
        `;
        if (sql.endsWith('OR')) sql = sql.substring(0, sql.length - 3);
        db.prepare(sql).all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((row) => {
                console.log(row);
            });
            res = rows;
        });
        return res;
    }

}

module.exports = {
    Friend,
}
