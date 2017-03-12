## 抓取百度搜索页面结果

### 使用方法

**1. 安装phantomJs**

**2. 配置配置文件config.json**

在"device"字段下新增一个对象，模板如下：
```json
{
    "name": "设备名称",
    "ua": "设备对应的UA",
    "width": 设备宽度,
    "height": 设备高度
}
```

**3. 在对应目录下输入"phantomjs task.js <要搜索的内容> <要使用的设备>"**  
例如"**phantomjs task.js 李彦宏 iphone6**"。
> 配置文件中默认有iphone5、iphone6、ipad供选择。

### 百度搜索实在让我崩溃

**PC端、平板、手机**

**1. 提交按钮：**
PC端、平板端用的是input标签，手机端用的是button标签

**2. 首页点击跳转页面：**
PC端、手机端是在当前页面打开，平板端在新的窗口打开

**你这是要上天啊**