/**
 * Created by zhouwunan on 2017/3/7.
 */

/**************************
 *
 * 未解决的问题：
 * 1. 是应该按照设备给予不同的查找方式，还是统一查找的方式只不过添加判断？
 *
 *************************/

var page = require('webpage').create(),
    fs = require('fs'),
    system = require('system'),
    address = 'http://baidu.com',

    i,

    // 限制时间，在限制时间内没加载出来则退出
    limitTime = 20000,

    // 加载时间
    loadTime = 2000,

    // 设备信息
    device_info,

    // 返回结果信息
    result_json = {code: 0},
    device,
    word,
    time,
    dataList = [];

/**
 * 输出错误退出
 * @param err
 */
function errExit(err) {

    result_json.err = err;
    console.log(JSON.stringify(result_json, null, 4));
    phantom.exit();
}

/**
 * 删除字符串中多余的空格，用于JSON对象转为字符串
 * @param key
 * @param value
 * @returns {*}
 */
function trim(key, value) {

    /**
     * 检查索引为info和title的
     * 并且类型为字符串的
     * 并且不是no info 和 no title的
     */
    if ((typeof value === 'string' && key === 'info' && value !== 'no info' || key === 'title' && key !== 'no title')) {
        return value.replace(/\s/g, '');
    }
    return value;
}

// 检查参数
if (system.args.length <= 2) {

    errExit('Usage: loadspeed.js <Keyword> <Device>');

} else {

    word = system.args[1];
    device = system.args[2];

}

// 设置限制时间
setTimeout(function() {

    errExit('FAIL to load the address. Timeout!');

}, limitTime);

// 中文编码，视控制台编码而定
phantom.outputEncoding = 'gbk';

// 开始计时
time = Date.now();

/**************************
 * 从配置文件中获取设备信息
 **************************/

    // 检查配置文件是否存在
if (fs.exists('config.json')) {

    var config_json = JSON.parse(fs.read('config.json')),

        // 获取配置文件中的设备列表
        device_list = config_json.device;

    // 获取设备信息
    device_info = (function() {

        for (i = 0; i < device_list.length; i += 1) {
            if (device_list[i].name === device) {
                return device_list[i];
            }
        }

        return false;

    }());

    // 检查设备是否存在，并且信息正确
    if (device_info && device_info.ua && device_info.width && device_info.height) {

        // 设备信息正确，设置phantomJs信息
        page.settings.userAgent = device_info.ua;
        page.viewportSize = {
            width: device_info.width,
            height: device_info.height
        };

    } else {

        errExit('FAIL device info error in config.json');
    }

} else {

    errExit('FAIL config not found');
}

/*****************************
 * 开始加载页面
 *****************************/
page.open(address, function(status) {

    // 如果无法访问到页面，则报错退出
    if (status !== 'success') {

        errExit('FAIL to load the address');

    } else {

        // 输入关键字并跳转，返回错误信息
        var index_result = page.evaluate(function(word) {

            // 获取输入条、按钮
            var button = document.querySelector('#su') || document.querySelector('#index-bn'),
                input = document.querySelector('#index-kw') || document.querySelector('#kw');
                //input = document.querySelector('#kw') || document.querySelector('#index-kw');

            // 用于检查元素类型
            var toString = Object.prototype.toString;

            // 元素类型必须符合要求
            if (toString.call(button) !== '[object HTMLButtonElement]'
                || toString.call(input) !== '[object HTMLInputElement]') {

                return false;
            }

            input.value = word;
            button.click();

            return true;

        }, word);

        if (!index_result) {

            errExit('FAIL element error in index');

        }

        // 等待
        setTimeout(function() {

            dataList = page.evaluate(function() {

                var results = document.querySelectorAll('.c-container'),
                    dataList = [],
                    i,
                    title,
                    info,
                    link,
                    pic;

                if (!results.length) {
                    // 没找到节点

                    return null;
                }

                for (i = 0; i < results.length; i += 1) {
                    // 当前结果元素下

                    // 先检查按类名 '.t'是否可以找到钙元素，如果找不到，试着按类名'.c-title'查找
                    // 如果还找不到，则title = 'no title';
                    title = results[i].querySelector('.t') ?
                        results[i].querySelector('.t').textContent :
                        results[i].querySelector('.c-blocka') ?
                            results[i].querySelector('.c-blocka').textContent :
                            'no title';

                    // 先检查按类名 '.c-abstract'是否可以找到该元素，如果找不到，则试着按类名 '.c-span-last' 查找
                    // 如果还找不到，则 info = 'no-info'
                    info = results[i].querySelector('.c-abstract') ?
                        results[i].querySelector('.c-abstract').textContent :
                        results[i].querySelector('.c-span-last')?
                            results[i].querySelector('.c-span-last').textContent :
                            'no info';

                    // 检查连接是否存在，不存在则link = 'no link'
                    link = results[i].querySelector('.t a') ? results[i].querySelector('.t a').getAttribute('href') : results[i].querySelector('.c-blocka') ? results[i].querySelector('.c-blocka').getAttribute('href') : 'no link';

                    // 检查图片是否存在，不存在则pic = 'no pic'
                    pic = results[i].querySelector('img') ? results[i].querySelector('img').getAttribute('src') : 'no pic';

                    // 将信息添加到数组dataList中。
                    dataList.push(
                        {
                            title: title,
                            info: info,
                            link: link,
                            pic: pic
                        }
                    );

                }

                return dataList;

            });

            // 计时停止
            time = Date.now() - time;

            // 检查抓取的结果
            if (dataList) {

                result_json = {
                    code: 1,
                    msg: '抓取成功',
                    device: device,
                    word: word,
                    time: time,
                    dataList: dataList
                };

            } else {

                errExit('FAIL to catch data');
            }

            // 来张照片
            page.render('result/' + word + '.png');
            // 顺便美化一下JSON的输出
            console.log(JSON.stringify(result_json, trim, 4));
            phantom.exit();

        }, loadTime); // setTimeout

    }
}); // page.open

page.onConsoleMessage = function(mes) {
    console.log(mes);
};