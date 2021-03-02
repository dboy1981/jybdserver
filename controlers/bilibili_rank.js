const axios = require('axios');
const XLSX = require('xlsx');
const moment = require('moment')

const config = [
  {
    name: '全部',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all'
  },
  {
    name: '番剧',
    url: 'https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=1'
  },
  {
    name: '国产动画',
    url: 'https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=4'
  },
  {
    name: '国创相关',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=168&type=all'
  },
  {
    name: '纪录片',
    url: 'https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=3'
  },
  {
    name: '动画',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=1&type=all'
  },
  {
    name: '音乐',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=3&type=all'
  },
  {
    name: '舞蹈',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=129&type=all'
  },
  {
    name: '游戏',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=4&type=all'
  },
  {
    name: '知识',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=36&type=all'
  },
  {
    name: '数码',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=188&type=all'
  },
  {
    name: '生活',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=160&type=all'
  },
  {
    name: '美食',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=211&type=all'
  },
  {
    name: '鬼畜',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=119&type=all'
  },
  {
    name: '时尚',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=155&type=all'
  },
  {
    name: '娱乐',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=5&type=all'
  },
  {
    name: '影视',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=181&type=all'
  },
  {
    name: '电影',
    url: 'https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=2'
  },
  {
    name: '电视剧',
    url: 'https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=5'
  },
  {
    name: '原创',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=origin'
  },
  {
    name: '新人',
    url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=rookie'
  },
]

//存在bvid字段，拼接url
const BVURLBASE = 'https://www.bilibili.com/video/'

async function get(url) {
  const ret = await axios.request({
    url,
    headers:{
      'origin':'https://www.bilibili.com',
      'referer':'https://www.bilibili.com',
      'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
    }
  })
  return ret.data;
}

function parseOfficialData(data) {
  const { title, url } = data;
  return { title, url, name:'',  mid: 0}
}

function parseCustomData(data) {
  const { title, owner, bvid } = data;
  const { mid, name } = owner;
  return { title, url: BVURLBASE + bvid, name, mid }
}

function save2XLSX(data) {
  var workbook = XLSX.utils.book_new();
  for(const item of data) {
    const sheet = XLSX.utils.json_to_sheet(item.list);
    XLSX.utils.book_append_sheet(workbook, sheet, item.name);
  }
  const bookname = moment().format('YYYY-MM-DD')
  XLSX.writeFile(workbook, __dirname + `/../public/data/${bookname}.xlsx`);
}

exports.crawl = async function() {
  const ret = [];
  for(const item of config) {
    console.log(item.name)
    const sheet = {name:item.name, list:[]}
    const data = await get(item.url)
    // console.log(data)
    const list = data.data ? data.data.list : data.result.list
    for(const d of list) {
      if(d.owner) {
        sheet.list.push(parseCustomData(d))
      } else {
        sheet.list.push(parseOfficialData(d))
      }
    }
    ret.push(sheet)
  }
  save2XLSX(ret)
}

//test

exports.crawl()