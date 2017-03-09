/**
 * Created by lenovo on 2017/3/7.
 */

/**
 * 几个问题：
 * 1. 如何获取关键字更好？关键字是传入到evaluate中的吗？===>evaluate可以传参数进去，并且可以传递多个
 * 2. 获取到的数据如何展示更好
 * 3. 整个逻辑有没有问题
 * 4. 如果没找到结果，怎么处理（在evaluate()中？）？
 */

/**
 * 有几个信息要获取：
 * 1. title ----> selector: h3.t // 结果条目的标题
 * 2. info -----> selector: .c-abstract // 摘要
 * 3. link -----> selector: h3.t a // 链接
 * 4. pic  -----> selector: img // 缩略图地址
  */

var page = require('webpage').create(),
    system = require('system'),
    address = 'http://baidu.com',

    // 加载时间
    loadTime = 2000,

    // 返回结果信息
    result_json = {code: 0},
    word = '秋瓷炫',
    err,
    time,
    dataList = [];

// 删除掉数据中的空格
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

// 中文编码
phantom.outputEncoding = 'gbk';

page.open(address, function(status) {

    if (status !== 'success') {

        err = 'FAIL to load the address';
        result_json.err = err;
        jsonReturnStr = JSON.stringify(result_json);
        phantom.exit();

    } else {

        // 输入关键字并跳转
        page.evaluate(function(word) {

            var suButton = document.querySelector('#su'),
                kwInput = document.querySelector('#kw'),
                kw = word;

            kwInput.value = kw;
            suButton.click();

            return kw;
        }, word);

        // 等待
        var clock = setTimeout(function() {

            page.render('img/bd.png');
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

                    // 是否存在标题，不存在则title = 'no title'
                    title = results[i].querySelector('.t') ? results[i].querySelector('.t').textContent : 'no title';

                    // 先检查按类名 '.c-abstract'是否可以找到该元素，如果找不到，则试着按类名 '.c-span-last' 查找
                    // 如果还找不到，则 info = 'no-info'
                    info = results[i].querySelector('.c-abstract') ? results[i].querySelector('.c-abstract').textContent
                        : results[i].querySelector('.c-span-last')? results[i].querySelector('.c-span-last').textContent
                        : 'no info';

                    // 检查连接是否存在，不存在则link = 'no link'
                    link = results[i].querySelector('.t a') ? results[i].querySelector('.t a').getAttribute('href') : 'no link';

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

            if (dataList) {

                result_json = {
                    code: 1,
                    msg: '抓取成功',
                    word: word,
                    time: time,
                    dataList: dataList
                };

            } else {

                result_json.err = 'FAIL catch fail';
            }

            // 顺便美化一下JSON的输出
            console.log(JSON.stringify(result_json, trim, 4));
            phantom.exit();

        }, loadTime);

    }
});

page.onConsoleMessage = function(mes) {
    console.log(mes);
};