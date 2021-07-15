const axios = require('axios');
const XLSX = require('xlsx');
const moment = require('moment')
const fs = require('fs')
const Cookie = require('cookie')

let cookie = readCookie()

function readCookie() {
  return fs.readFileSync(__dirname + '/weibocookie.txt', {encoding: 'utf8'});
}

function writeCookie(data) {
  fs.writeFileSync(__dirname + '/weibocookie.txt', data, {encoding: 'utf8'})
}

async function auth() {
  const url = 'https://login.sina.com.cn/sso/login.php?url=https%3A%2F%2Fs.weibo.com%2Fweibo%3Fq%3D%25E8%2590%258C%25E7%2589%2599%25E5%25AE%25B6%26wvr%3D6%26b%3D1%26Refer%3DSWeibo_box&_rand=1625535879.1041&gateway=1&service=weibo&entry=miniblog&useticket=0&returntype=META&sudaref=&_client_version=0.6.29'

  let ret = await axios.request({
    url,
    headers:{
      'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      'cookie': cookie
    }
  })
  
  const passporturl = /location\.replace\("(.+?)"\)/.exec(ret.data)[1]
  console.log(passporturl);

  const cookieObj = Cookie.parse(cookie);
  cookie = ''
  for (const item of ret.headers['set-cookie']) {
    cookie += item + '; '
  }
  const newCookieObj = Cookie.parse(cookie);
  const cookieRefreshed = Object.assign({}, cookieObj, newCookieObj)
  
  console.log(JSON.stringify(ret.headers['set-cookie']))
  console.log(cookie);

  for (const key of Object.keys(cookieRefreshed)) {
    cookie += key + '=' + cookieRefreshed[key] + '; '
  }

  writeCookie(cookie)
  return cookie
}

exports.crawl = async function() {
  await auth()
  const keywords = ['萌牙家','oatoat燕麦饮','wonderlab','永璞咖啡','乐纯','元气森林','躺岛']
  const ret = [];
  for(let k of keywords) {
    const keyword = encodeURIComponent(encodeURIComponent(k))
    let list = [];
    for(let page = 1; page <=6; page++) {
      const data = await get(`https://s.weibo.com/weibo/${keyword}?topnav=1&wvr=6&b=1&page=${page}`);
      const temp = await parse(data)
      list = list.concat(temp)
    }
    ret.push({name:k, list})
  }
  save2XLSX(ret)
}

//test
exports.crawl()
// exports.auth()
// async function test() {
//   console.log(await visitorGet('https://weibo.com/5326709639?refer_flag=1001030103_'))

//   // const url = 'https://weibo.com/5326709639?refer_flag=1001030103_'
//   // const myurl = new URL(url)
//   // const http2 = require('http2');
//   // const clientSession = http2.connect(url);
//   // const {
//   //   HTTP2_HEADER_PATH,
//   //   HTTP2_HEADER_STATUS
//   // } = http2.constants;

//   // let data = '';
//   // const req = clientSession.request(
//   //   { 
//   //     [HTTP2_HEADER_PATH]: '/' ,
//   //     ':authority': 'weibo.com',
//   //     ':method': 'GET',
//   //     ':path': myurl.pathname + myurl.search,
//   //     ':scheme': 'https',
//   //     'referer': 'https://s.weibo.com/',
//   //     'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
//   //   }
//   // );
//   // req.on('response', (headers) => {
//   //   console.log(headers);
//   //   req.on('data', (chunk) => { data += chunk });
//   //   req.on('end', () => { console.log(data) });
//   // });
// }
// test()
//test

function save2XLSX(data) {
  var workbook = XLSX.utils.book_new();
  for(const item of data) {
    const sheet = XLSX.utils.json_to_sheet(item.list);
    XLSX.utils.book_append_sheet(workbook, sheet, item.name);
  }
  const bookname = moment().format('YYYY-MM-DD')
  XLSX.writeFile(workbook, __dirname + `/../public/data/keyword_${bookname}.xlsx`);
}

async function visitorGet(url) {
  const myurl = new URL(url)
  const ret = await axios.request({
    url,
    headers:{
      'referer': 'https://s.weibo.com/',
      'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      'cookie': '_s_tentry=-; Apache=8258872082613.62.1623203345627; SINAGLOBAL=8258872082613.62.1623203345627; ULV=1623203345676:1:1:1:8258872082613.62.1623203345627:; SUB=_2AkMXnkDGf8NxqwJRmPoQxWrqa45-zADEieKhwrEdJRMxHRl-yT9jqmMptRB6PB5uKYsD8zQKTvI9SzCuI1lpxKrKzidd; SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WhzSgx8-KyKoZ_1S2eFqCzX'
    },
    maxRedirects: 2
  })
  return ret.data;
}
async function get(url) {
  const ret = await axios.request({
    url,
    headers:{
      'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      'cookie': cookie
    }
  })
  return ret.data;
}

async function getFuns(url) {
  const data = await visitorGet(url);
  const reg = /关注.+?<strong class=\\".+?\\">(.+?)<\\\/strong><span class=\\".+?\\">粉丝<\\\/span>/igm
  if(reg.test(data)){
    reg.exec(data)
    const match = reg.exec(data)
    return match[1]
  }
  return 0
}

async function parse(data) {
  // console.log(data)
  const reg = /<div class=\"content\" node\-type=\"like\">([\s\S]+?)<\/div>[\s\S]+?<\!\-\-\/微博内容\-\->/igm
  // reg.exec(data)
  let match = null
  let list = [];
  while ((match = reg.exec(data)) !== null) {
    list = list.concat(await parseChild(match[0]))
  }
  console.log(list)
  return list
}

async function parseChild(data) {
  // console.log(data)
  const reg = /<div class="content" node-type="like">[\s\S]+?<a href="(.+?)" class="name" target="_blank" nick-name="(.+?)"[\s\S]+?<p class="txt" node-type="feed_list_content" nick-name=".+?">([\s\S]+?)<\/p>[\s\S]+?<p class="from"[ ]?>[\s\S]+?<a href="(.+?)"[\s\S]+?<\/div>/igm
  const reg2 = /<div class="content" node-type="like">[\s\S]+?<a href="(.+?)" class="name" target="_blank" nick-name="(.+?)"[\s\S]+?<p class="txt" node-type="feed_list_content_full" nick-name=".+?" style="display: none">([\s\S]+?)<\/p>[\s\S]+?<p class="from"[ ]?>[\s\S]+?<a href="(.+?)"[\s\S]+?<\/div>/igm

  let list = [];
  if(reg2.test(data)) {
    list = list.concat(await parseData(reg2, data))
  } else if (reg.test(data)) {
    list = list.concat(await parseData(reg, data))
  }
  
  // console.log(list)
  return list
}

async function parseData(reg, data) {
  const list = [];
  reg.exec(data)
  let match = null
  while ((match = reg.exec(data)) !== null) {
    const url = 'https:' + match[1]
    const nickname = match[2]
    const content = formatContent(match[3])
    const funs = await getFuns(url)
    const wburl = 'https:' + match[4]
    list.push({url, nickname, content, funs, wburl})
  }
  // console.log(list)
  return list
}

function formatContent(content) {
  if(!content) return ''
  content = content.replace(/收起全文<i class="wbicon">d<\/i>/g,"");
  content = content.replace(/<[^>]+>/g,"");
  content = content.replace(/[\r\n\t ]/g,"");
  return content
}