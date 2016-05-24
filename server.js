var fs = require('fs');
var path = require('path');

// request模块是用来请求网页的
var request = require('request');
// cheerio是对请求来的网页进行解析的，也就是从html中解析出需要的内容
var cheerio = require('cheerio');

// 全局变量设置
var webUrl = 'http://tu.enterdesk.com/meinv/tags-%E5%B0%8F%E6%B8%85%E6%96%B0/';//需要获取数据的链接地址
var suffix = '.html'; // 页面后缀形式
var needData = '.img img'; // 需要获取的数据
var attribute = 'data-url'; // 需要获取数据的属性
var pages = 3; // 获取多少页数据

// 循环抓取页面
for (var i = 1;i<=pages;i++) {
  getPage(i+suffix);
}

// 抓取页面
function getPage(args){
  // 进行页面获取
  var requrl = webUrl+args;
  request(requrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(body);    //返回请求页面的HTML
      acquireData(body);
    }
  });
}

// 处理获取页面数据
function acquireData(data) {
  var $ = cheerio.load(data);  //cheerio解析data
  var meizi = $(needData).toArray();  //将所有的img放到一个数组中
  console.log(meizi.length);
  var len = meizi.length;
  for (var i=0; i<len; i++) {
    var imgsrc = meizi[i].attribs[attribute];  //用循环读出数组中每个src地址
    console.log(imgsrc);                //输出地址
    var filename=parseUrlForFileName(imgsrc);// 生成文件名
    downloadImg(imgsrc,filename,function(){
      console.log(filename+'done');
    });
  }
}

// 调用path模块中的basename方法就可以得到URL中的文件名
function parseUrlForFileName(address) {
  var filename = path.basename(address);
  return filename;
}

var downloadImg = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
    // console.log('content-length:', res.headers['content-length']);  //图片大小
    if (err) {
      console.log('err: '+ err);
      return false;
    }
    console.log('res: '+ res);
    request(uri).pipe(fs.createWriteStream('images/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
  });
};