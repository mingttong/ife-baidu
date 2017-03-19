/**
 * Created by lenovo on 2017/3/18.
 */

var su = $('#su');

su.click(function () {

        // 关键字
    var kw = $('#kw').val(),
        // 设备
        device = $('#device').val(),
        // 输入提示
        tip = document.querySelector('.tip'),
        // 显示结果的文本
        result = document.querySelector('#result');

    tip.style.color = 'red';

    if (!kw) {

        tip.textContent = '请输入关键字';

    } else {

        tip.textContent = '';

        var url = `server.js?key=${kw}&device=${device}`;

        //// 获取数据
        //$.getJSON(`server.js?key=${kw}&device=${device}`, function(result) {
        //
        //    console.log(result);
        //
        //});

        var httpRequest = new XMLHttpRequest();

        httpRequest.onreadystatechange = function() {
            console.log(httpRequest.responseText);
        };

        httpRequest.open('GET', url, true);
        httpRequest.send();

    }

});