/**
 * Created by lenovo on 2017/3/21.
 */

const phantom = require('phantom');

async function task(arg_key, arg_device) {

    const instance = await phantom.create();
    const page = await instance.createPage();
    const fs = require('fs');

    let address = 'http://baidu.com',

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
    async function errExit(err) {

        result_json.err = err;
        console.log(JSON.stringify(result_json, null, 4));
        await instance.exit();
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

    /*****************************
     * 流程开始
     *****************************/
    if (!arg_key) {

        errExit('Fail no key word');

    } else if (arg_key && !arg_device) {

        word = arg_key;
        device = 'pc';

    } else {

        word = arg_key;
        device = arg_device;

    }

// 设置url
    address = address + '/s?wd=' + encodeURIComponent(word);

// 设置限制时间
    setTimeout(function () {

        errExit('FAIL to load the address. Timeout!');

    }, limitTime);

// 开始计时
    time = Date.now();

    /**************************
     * 从配置文件中获取设备信息
     **************************/

    /***************************
     * 先舍弃这部分
     */

// 如果不是pc，则去配置设备信息
    if (device !== 'pc') {

        // 检查配置文件是否存在
        if (await fs.access('config.json')) {

            var config_json = JSON.parse(fs.read('config.json')),

            // 获取配置文件中的设备列表
                device_list = config_json.device;

            // 获取设备信息
            device_info = (function () {

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
    }

    /*****************************
     * 开始加载页面
     *****************************/
    const status = await page.open(address); // page.open

    // 如果无法访问到页面，则报错退出
    if (status !== 'success') {

        errExit('FAIL to load the address');

    } else {

        dataList = await page.evaluate(function () {

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
        instance.exit();

    }

}

task('clara', 'iphone5');