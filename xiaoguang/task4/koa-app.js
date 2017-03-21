/**
 * Created by lenovo on 2017/3/20.
 */

const PORT = 8000;

const url = require('url');
const exec = require('child_process').exec;
const fs = require('fs');

const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();

/********************************
 *
 * mongoose
 *
 ********************************/

// mongoose连接
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.createConnection('mongodb://127.0.0.1:27017/ife-baidu');

// 定义一个Schema
var baiduSchema = mongoose.Schema({

    code: Number,
    msg: String,
    device: String,
    word: String,
    time: Number,
    dataList: [{
        title: String,
        info: String,
        link: String,
        pic: String
    }]
});

// 编辑定义好的Schema到一个Model中，这里我们取名叫BaiduResult，这时候BaiduResult这个Model就是一个类了
var BaiduResult = mongoose.model('BaiduResult', baiduSchema);

// 连接错误
db.on('error', console.error.bind(console, 'connection error:'));

/**********************************
 * mongoose end
 **********************************/

// crawl

/**
 * 通过phantomjs去查询百度搜索结果
  * @param key 关键词
 * @param device 用的设备
 * @returns {Promise} 返回的结果，JSON格式
 */
const phantomTask = async (key, device) => {

    return new Promise( (resolve, reject) => {

            exec(`phantomjs task.js ${key} ${device}`, (err, stdout) => {

                if (err) {
                    reject(`调用服务错误 error: ${err}`);
                } else {
                    resolve(stdout);
                }

            });

        }
    );
};

const downloadPic = async (link) => {

    return new Promise( (resolve, reject) => {

        let picName = ``

    });

};

const saveInDb = async () => {



};

// router

router.get('/s', async function (ctx, next) {

    // 解析url，并获取搜索的关键字对象
    var queryObj = url.parse(ctx.url, true).query;

    // 检查参数是否填写正确
    if (queryObj['key']) {

        var key = queryObj['key'],
            device = queryObj['device'] || '';

        var resultData = await phantomTask(key, device);

        if (!resultData) {

            console.error('exec error: ${error}');

        } else {

            // 成功获取数据

            try {
                resultData = JSON.parse(resultData);
            } catch (err) {
                console.log(err);
                ctx.status = 200;
                ctx.set('Content-Type', 'application/json');
                ctx.body = JSON.stringify({code: 0, err: '查询结果输出有误'});
            }

            let datalist = resultData.dataList;

            // 下载图片

            for (let i = 0; i < datalist.length; i += 1) {

                datalist[i].path = datalist[i].pic ? downloadPic(datalist[i].pic) : '';

            }


            try {

                // 上面创建好类了以后，这里我们通过这个类实例化一个对象
                var result = new BaiduResult(resultData);

                // 将文档保存到数据库
                // 调用数据对象的save方法
                result.save(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                    }
                });

                ctx.status = 200;
                ctx.set('Content-Type', 'application/json');
                ctx.body = resultData;

            } catch (err) {

                console.log(err);

                ctx.status = 200;
                ctx.set('Content-Type', 'application/json');
                ctx.body = JSON.stringify({code: 0, err: '查询结果输出有误'});

            }

        }

    } else {
        // 参数填写错误...
        console.log('FAIL no key word');
        ctx.status = 200;
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify({code: 0, err: '请输入关键字'});
    }

});

// x-response-time

app.use(async function (ctx, next) {

    const start = new Date();
    console.log('x-response-time 1');
    await next();

    const ms = new Date() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
    console.log('x-response-time 2');

});

// logger

app.use(async function (ctx, next) {

    const start = new Date();
    console.log('logger 1');

    await next();

    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    console.log('logger 2');

});

// response

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT);