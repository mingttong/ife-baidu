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
    if(queryObj['key'] && queryObj['device']) {

        let key = queryObj['key'],
            device = queryObj['device'];

        exec('phantomjs task.js' + ' ' + key + ' ' + device, function(error, stdout, stderr) {

            if (error) {
                console.error('exec error: ${error}');
            } else {

                console.log(stdout);

            }

        });


    } else {
        // 参数填写错误...
    }

    response.writeHead(200, {"Content-Type": "text/plain"});

    response.end();
}).listen(8000);

console.log("server started");