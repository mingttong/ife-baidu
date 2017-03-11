/**
 * Created by zhouwunan on 2017/3/7.
 */

/**
 * 几个问题：
 * 1. 如何获取关键字更好？关键字是传入到evaluate中的吗？===>evaluate可以传参数进去，并且可以传递多个
 * 2. 获取到的数据如何展示更好 ===>转换为字符串时添加参数JSON.stringify(result_json, null, 4)
 * 3. 整个逻辑有没有问题 ===>目前没发现
 * 4. 如果没找到结果，怎么处理（在evaluate()中？）？ ===>结果为null，则错误退出
 */

/**
 * 有几个信息要获取：
 * 1. title ---> 'h3'
 * 2. info  ---> 'div'
 * 3. link  ---> 'a'
 * 4. pic   ---> 'img'
  */

var page = require('webpage').create(),
    system = require('system'),
    address = 'http://baidu.com',

    // 限制时间，在限制时间内没加载出来则退出
    limitTime = 20000,

    // 加载时间
    loadTime = 2000,

    // 返回结果信息
    result_json = {code: 0},
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
if (system.args.length === 1) {

    errExit('Usage: loadspeed.js <some Keyword>');

} else {

    word = system.args[1];
}

// 设置限制时间
setTimeout(function() {

    errExit('FAIL to load the address. Timeout!');

}, limitTime);

// 中文编码，视控制台编码而定
phantom.outputEncoding = 'gbk';

// 开始计时
time = Date.now();

page.open(address, function(status) {

    // 如果无法访问到页面，则报错退出
    if (status !== 'success') {

        errExit('FAIL to load the address');

    } else {

        // 输入关键字并跳转
        page.evaluate(function(word) {

            var suButton = document.querySelector('#su'),
                kwInput = document.querySelector('#kw');

            kwInput.value = word;
            suButton.click();

        }, word);

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

                    title = results[i].querySelector('h3') ? results[i].querySelector('h3').textContent : 'no title';
                    info = results[i].querySelector('div') ? results[i].querySelector('div').textContent : 'no info';
                    link = results[i].querySelector('a') ? results[i].querySelector('a').getAttribute('href') : 'no link';
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

//page.onConsoleMessage = function(mes) {
//    console.log(mes);
//};