/**
 * Spider
 * Author Alan.Shen
 * @constructor
 */
var cheerio = require("cheerio");
var  client = require('../database');
var  logger = require('./logger');
var httpUtils = require("../utils/httpHelper");


mysql = client.getDbCon();

function  ChinaCnCraw() {

}
module.exports = ChinaCnCraw;

ChinaCnCraw.crawCompany = function crawCompany() {
    paserHDUrl(function (hdurl,totalPage) {
        logger.log(hdurl+totalPage);
            paserCompanyList(hdurl,1,totalPage);
    });
}

/**
 * 找到华东区 - 上海企业
 * @param page_url
 * @param data
 * @param callback
 */
function paserHDUrl(callback) {
    var url = "http://product.cn.china.cn/suppliers/%C9%CF%BA%A3/";

    var xpath="a[title='上海市企业名录']";
    httpUtils.download(url, function (data) {
        if (data) {
            //var $ = cheerio.load(data);
            //var hdurl="http://www.atobo.com.cn"+$(xpath).attr("href");
            paserHDTotalPage(url,function(totalPage){
                return callback(url,totalPage);
            });
        }
    });
}

/**
 * 解析总页数
 * @param callback
 */
function paserHDTotalPage(url,callback) {
    var xpath="span[class='pageNum']";
    httpUtils.download(url, function (data) {
        if (data) {
            var $ = cheerio.load(data);
            var str=$(xpath).text();
            var regExp = /共([0-9]+)页/;
            var matches=str.match(regExp);
            var totalPage = matches[1];
            logger.log(totalPage);
            return callback(totalPage);
        }
    });
}

function paserCompanyList(url,index,totalPage) {

    var page_url=url+(index+1)+"/";
    logger.log(page_url + "---" + totalPage);
    httpUtils.download(page_url, function (data) {
        if (data) {
            var $ = cheerio.load(data);
            var i = 0;
            $(".sr-lst").each(function (i, e) {

                var company = $(e).find("div[class='enty-wrap fl-clr comprls']").text();
                var urlStr = $(e).find("a[title='查看更多公司信息']").attr("href");
//                logger.log(i++ +urlStr);
                paserCompanyDetail(urlStr);

            });
//            index++;
//            if (index < totalPage) {
//              paserCompanyList(url, index, totalPage);
//           }
        }
    });
}


function paserCompanyDetail(url) {
//    var detail_url = url.replace("company-information.html","");
    var detail_url = url;
    logger.log(detail_url);

    httpUtils.download(detail_url, function (data) {
        if (data) {
            console.log(data);

            var $ = cheerio.load(data);
            var i = 0;
//                $(".sr-lst").each(function (i, e) {
//
                    var company = $('.pdmd').text();
//                    var  = $(e).find(".c_name").text().replace('联 系 人：', '').replace('在线咨询：', '');
//                    var urcontactlStr = $(e).find("a[titie='查看更多公司信息']").attr("href");
//                    var busi_scope = $(e).find(".pp_product").text();
//                    var region = $(e).find(".renzheng").text();
//
                    var txt = company ;
                    logger.log(company);
//
//                    var sql = "replace into atobo_company (name,contact,atobo_company_url,page_url,busi_scope,region,crt_date) values(?,?,?,?,?,?,now())";
//                    mysql.query(sql, [company, contact, urlStr, page_url, busi_scope, region], function (err, results, fields) {
//                        if (err) {
//                            throw err;
//                        } else {
//                            // return callback(err, fields);
//                            //logger.log("success");
//                        }
//                    });

//                });
        }
    });
}



