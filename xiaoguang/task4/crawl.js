/**
 * Created by lenovo on 2017/3/21.
 */

// crawl

const exec = require('child_process').exec;
const fs = require('fs');
const request = require('request');

const moment = require('moment');
const randomize = require('randomatic');

/**
 * 通过phantomjs去查询百度搜索结果
 * @param key 关键词
 * @param device 用的设备
 * @returns {Promise} 返回的结果，JSON格式
 */
const phantomTask = async (key, device) => {

    return new Promise( (resolve, reject) => {

            exec(`phantomjs task.js ${key} ${device}`, async (err, stdout) => {

                if (err) {
                    reject(`调用服务错误 error: ${err}`);
                } else {

                    try {

                        resolve(stdout);

                    } catch (err) {

                        console.log(err);
                        reject(`调用服务错误 error: ${err}`);

                    }

                }

            });

        }
    );
};

/**
 * 下载图片
 * @param link 图片的链接
 * @returns {Promise}
 */
const downloadPic = (link) => {

    return new Promise((resolve, reject)=>{
        request({
            url: link,
            encoding: 'binary'
        },(err, response, picData)=>{
            if (err) reject(err);
            if (response.statusCode !== 200) reject('response statusCode error');
            // 命名格式为 "当前日期_随机字符串"
            let picName = `${moment().format('YYYYMMDD')}_${randomize('*', 10)}`;
            fs.writeFile(picName, picData, 'binary', pic_err=>{
                if (pic_err) reject(pic_err);
                resolve(picName)
            });
        });
    });

};

const saveInDb = async () => {



};

module.exports = phantomTask;