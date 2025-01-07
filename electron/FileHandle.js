const tmp = require("tmp");
const path = require("node:path");
const {nativeImage} = require("electron");
const fs = require("fs");

// 保存图片
const getImageSavePath = () => {// 获取图像保存的路径
    return new Promise((resolve, reject) => {
        // 写到C盘的临时文件\AppData\Local\Temp\YPChatFiles中
        let tmpName = tmp.tmpNameSync();// 初始的名称
        const folderPath = path.join(tmpName.substring(0, tmpName.lastIndexOf(path.sep)), "YPChatFiles");

        // 雪花算法获取图片名称
        let imagTmpName = Math.floor(Date.now() * Math.random()).toString() +
            Math.floor(Math.random() * 1000).toString();
        let filePath = path.join(folderPath, `YPChat${imagTmpName}.png`);

        fs.promises.access(folderPath)
            .then(() => {
                // 如果访问成功，表示文件夹存在
                console.log(`Folder ${folderPath} already exists.`);
                resolve(filePath);
            })
            .catch(err => {
                if (err.code === 'ENOENT') {
                    // 创建一个新的文件夹
                    fs.mkdir(folderPath, { recursive: true }, (createErr) => {
                        if (createErr) {
                            reject(`Failed to create the folder: ${createErr}`);
                        } else {
                            console.log(`目录 ${folderPath} 创建成功！！！`);
                            resolve(filePath);
                        }
                    });
                } else {
                    // 如果是其他错误，则重新抛出或处理它
                    reject(`An error occurred: ${err}`);
                }
            });
    })
}
const saveImageByBuffer = async (buffer) => {// 保存流方式的图片，即使用包含图像数据的二进制缓冲区的Buffer对象存储
    return new Promise((resolve, reject) => {
        getImageSavePath().then((filePath) => {
            let image = nativeImage.createFromBuffer(buffer);
            fs.writeFileSync(filePath, image.toPNG());
            resolve(filePath);
        }).catch((error) => reject(error));
    })
}

const saveImageByBase64 = (imgData) => {// 直接保存base64图片
    return new Promise((resolve, reject) => {
        getImageSavePath().then((filePath) => {
            let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");// 过滤data:URL
            let dataBuffer = new Buffer(base64Data, 'base64');
            fs.writeFile(filePath, dataBuffer, (err) => {
                if(err){
                    reject(err);
                }else{
                    resolve(filePath);
                }
            });
        }).catch((error) => reject(error));
    });
}

module.exports = {
    saveImageByBuffer,
    saveImageByBase64,
}
