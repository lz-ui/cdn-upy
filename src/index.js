'use strict'
const upyun = require('upyun')
const fs = require('fs')
const path = require('path');
const uuid = require('node-uuid');


// 需要填写自己的服务名，操作员名，密码，通知URL
const serviceName = '2017cdn-blog'   // 服务名
const operatorName = 'lizhi'  // 用户名
const password = 'qq123456' // 操作密码


const service = new upyun.Service(serviceName, operatorName, password)
const client = new upyun.Client(service)


class LzCdn{
    constructor(config) {
        if(!config.filePath)  return false;

        // 要上传的本地文件路径
        this.filePath = path.join('./dist');

        const uId = uuid.v4().split('-')[4]
        const myDate = new Date();
        const date = `${myDate.getFullYear()}${(Math.floor(myDate.getMonth())+1)}${myDate.getDate()}${myDate.getHours()}${myDate.getMinutes()}${myDate.getSeconds()}`

        // 远端路径
        this.remoteFile = `/lz-ui/cos/${date}/${uId}/`

        this.fileDisplay(this.filePath)

    }
    // 上传
    uploadFile(localFile) {
        client.formPutFile(this.remoteFile + localFile, fs.createReadStream(localFile)).then(res => {
            console.log(`https://cdn.jczxw.cn`+ res.url)
        })
    }
    // 获取文件路径-递归
    fileDisplay(filePath){
        const _this = this
        //根据文件路径读取文件，返回文件列表
        fs.readdir(filePath,function(err,files){
            if(err){
                console.warn(err)
            }else{
                //遍历读取到的文件列表
                files.forEach(function(filename){
                    //获取当前文件的绝对路径
                    let filedir = path.join(filePath, filename);
                    //根据文件路径获取文件信息，返回一个fs.Stats对象
                    fs.stat(filedir,function(eror, stats){
                        if(eror){
                            console.warn('获取文件stats失败');
                        }else{
                            let isFile = stats.isFile();//是文件
                            let isDir = stats.isDirectory();//是文件夹
                            if(isFile){
                                _this.uploadFile(filedir.replace(/\\/g,'/'))
                            }
                            if(isDir){
                                _this.fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                            }
                        }
                    })
                });
            }
        });
    }
}

module.exports = LzCdn 