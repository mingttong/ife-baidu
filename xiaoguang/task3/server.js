/**
 * Created by lenovo on 2017/3/13.
 */

const http = require('http');
// URL模块
const url = require('url');
const exec = require('child_process').exec;

http.createServer(function(request, response) {
    console.log('request received');

    // 判断请求的方法，比如GET, POST
    //console.log(request.method);

    // 解析url，并获取搜索的关键字对象
    var queryObj = url.parse(request.url, true).query;

    // 检查参数是否填写正确
    if(queryObj['key']) {

        let key = queryObj['key'],
            device = queryObj['device'] || '';

        exec('phantomjs task.js' + ' ' + key + ' ' + device, function(error, stdout, stderr) {

            if (error) {
                console.error('exec error: ${error}');
            } else {

                // mongoose连接
                var mongoose = require('mongoose');
                mongoose.Promise = global.Promise;
                var db = mongoose.createConnection('mongodb://127.0.0.1:27017/ife-baidu');

                // 连接错误
                db.on('error', function(error) {
                    console.log(error);
                });
                db.once('open', function(callback) {
                    console.log('mongoose connected');
                });

                // Schema结构
                var mongooseSchema = new mongoose.Schema({
                    //code: {type: Number},
                    //msg: {type: String},
                    //device: {type: String},
                    //word: {type: String},
                    //time: {type: Number},
                    //dataList: [{}]

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

                // 编辑定义好的Schema
                var Result = db.model('mongoose', mongooseSchema);

                console.log(stdout);

                try {
                    // 新建一个文档
                    // 注意，如果stdout不是JSON则会报错
                    var result = new Result(JSON.parse(stdout));

                    // 将文档保存到数据库
                    result.save(function(err, result) {
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

                    response.writeHead(200, {'Content-Type': 'application/json'});
                    return response.end(JSON.stringify({code: 0, err: '请确认参数是否正确'}));
                }

            }

        });


    } else {
        // 参数填写错误...
        console.log('FAIL no key word');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write('请输入关键字');
        response.end();
    }


    //response.end();
}).listen(8000);

console.log("server started");