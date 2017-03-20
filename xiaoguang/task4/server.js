/**
 * Created by lenovo on 2017/3/13.
 */

/*****************************************
 *
 * 我对mongoose的理解：
 *
 * *****Mongo是以对象为单位存储数据的*****
 * *****Mongo中的“表”实际上是一个类，当我们
 *
 * mongoose要存一条数据到Mongo数据库中：
 * 1. 首先要创建一个类似于模板，这个模板描述了你要存的数据是长什么样的。
 * 2. 然后我们利用这个模板通过mongoose.model()创建一个类。
 * 3. 我们通过新建的这个类实例化我们的数据对象。
 *
 *****************************************/

const http = require('http');
// URL模块
const url = require('url');
const exec = require('child_process').exec;
// 通过拓展名获取'Content-Type'

/***********************************
 *
 * server
 *
 ***********************************/

const server = http.createServer(function (request, response) {
    console.log('request received');

    /*
     * 接收到的请求
     *
     * 1. 这仅仅是简单的在服务端做一个简单的处理，应当把
     * 这个搜索的模块放到一个单独的地方。
     *
     * 2. 服务器只处理请求的业务，具体请求后怎么处理并响
     * 应，应当路由器发给各个模块来处理。
     *
     * 3. 响应的Content-Type可以参照“3分钟搭建node服务器”
     */

    // 解析url，并获取搜索的关键字对象
    var queryObj = url.parse(request.url, true).query;

    // 检查参数是否填写正确
    if (queryObj['key']) {

        var key = queryObj['key'],
            device = queryObj['device'] || '';

        exec('phantomjs task.js' + ' ' + key + ' ' + device, function (error, stdout, stderr) {

            if (error) {

                console.error('exec error: ${error}');

            } else {

                try {

                    // 上面创建好类了以后，这里我们通过这个类实例化一个对象
                    // 注意，如果stdout不是JSON则会报错
                    var result = new BaiduResult(JSON.parse(stdout));

                    // 将文档保存到数据库
                    // 调用数据对象的save方法
                    result.save(function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result);
                        }
                    });

                    response.writeHead(200, {"Content-Type": "application/json"});
                    // 输出到屏幕上
                    response.write(stdout);
                    response.end();

                } catch (err) {

                    console.log(err);

                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({code: 0, err: '查询结果输出有误'}));
                }

            }

        });


    } else {
        // 参数填写错误...
        console.log('FAIL no key word');
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify({code: 0, err: '请输入关键字'}));
        response.end();
    }

});

/*********************************
 * server end
 *********************************/

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
// 连接成功，将数据存入数据库
db.once('open', function (callback) {
    console.log('mongodb connected!');

    server.listen(8000, function() {
        console.log("server started!");
    });

});

/**********************************
 * mongoose end
 **********************************/

