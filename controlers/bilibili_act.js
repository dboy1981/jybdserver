const axios = require('axios');
const XLSX = require('xlsx');
const moment = require('moment')

//存在bvid字段，拼接url
const URL = 'https://www.bilibili.com/activity/page/list?plat=1,3&mold=0&http=3&page='
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

function parseJson(json) {
  
  const ret = [];
  for(const item of json.data.list) {
    ret.push({
      url: 'https:' + item.pc_url,
      title: item.name,
      intro: item.desc || '',
      list: []
    })
  }
  return ret
}

function parse(data) {
  const ret = [];
  const listReg = /<li>([\s\S]+?)<\/li>/igm;
  const contentReg = /<h2><a href="(.+?)" target="_blank">(.+?)<\/a><\/h2>[\s\S]+?<div class="act-info">(.+?)<\/div>/igm
  if(listReg.test(data)) {
    while ((match = listReg.exec(data)) !== null) {
      while ((match2 = contentReg.exec(match[1])) !== null) {
        ret.push({
          url: 'https:' + match2[1],
          title: match2[2],
          intro: match2[3],
          list: []
        })
      }
    }
  }
  return ret
}

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

function getKey(expectedKey, json) {
  for(const key of Object.keys(json)) {
    // console.log(key)
    if(key == expectedKey) {
      return json[key]
    }
    if(isObject(json[key])) {
      const ret = getKey(expectedKey, json[key])
      if(ret) {
        return ret;
      }
    }
  }
  return null
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

function parseActData(data) {
  const { object } = data;
  const { archive, bvid } = object;
  
  const { title , owner} = archive;
  const { mid, name } = owner;

  return { title, url: BVURLBASE + bvid, name, mid }
}

function parseVideoaward(data) {
  // console.log(data)
  
  const ret = [];
  const json = JSON.parse(data.replace(/\\\"/igm, '"').replace(/\\\\\"/igm, "'"));
  let Videoaward = getKey('Videoaward', json)
  if(!Videoaward) {
    Videoaward = getKey('Topic', json)
  }
  if(Videoaward) {
    // console.log(Videoaward)
    for(const item of Videoaward) {
      for(const v of item.source) {
        if(v.owner) {
          ret.push(parseCustomData(v))
        } else {
          ret.push(parseOfficialData(v))
        }
      }
    }
  }
  // console.log(ret)
  return ret;
}

function parseSliderPlayer(data) {
  // console.log(data)
  
  const ret = [];
  const json = JSON.parse(data.replace(/\\\"/igm, '"').replace(/\\\\\"/igm, "'"));
  let Videoaward = getKey('pc-slide-player', json)
  if(Videoaward) {
    // console.log(Videoaward)
    for(const item of Videoaward) {
      for(const v of item.videos.data) {
        if(v.owner) {
          ret.push(parseCustomData(v))
        } else {
          ret.push(parseOfficialData(v))
        }
      }
    }
  }
  // console.log(ret)
  return ret;
}

async function parseVideoList(data) {
  // console.log(data, data.replace(/\\\"/igm, '"').replace(/\\\\\"/igm, "'"))
  const ret = [];
  const json = JSON.parse(data.replace(/\\\"/igm, '"').replace(/\\\\\"/igm, "'"));
  let Videoaward = getKey('pc-video-list', json)
  if(Videoaward) {
    // console.log(Videoaward)
    const sourceid = Videoaward[0].sourceId;
    var url = `https://api.bilibili.com/x/activity/up/list?sid=${sourceid}&type=ctime&pn=1&ps=100&zone=0`
    console.log(url)
    const act_ret = await get(url)
    if(Array.isArray(act_ret.data.list)) {
      for(const v of act_ret.data.list) {
        ret.push(parseActData(v))
      }
    }
  }
  // console.log(ret)
  return ret;
}

async function parseAct(data) {
  const reg = /window\.__initialState[ ]?=[ ]?JSON\.parse\(["\']([\s\S]+?)["\']\);?/igm
  let ret = [];
  if(reg.test(data)) {
    reg.exec(data)
    let match = null
    while ((match = reg.exec(data)) !== null) {
      const m = match[1]
      // console.log(m)
      // return
      ret = await parseVideoList(m);
      if(ret.length > 0) {
        return ret
      }
      ret = parseVideoaward(m)
      console.log('parseVideoaward')
      if(ret.length > 0) {
        return ret
      }
      console.log('parseSliderPlayer')
      ret = parseSliderPlayer(m)
      if(ret.length > 0) {
        return ret
      }
    }
    
  }

  return ret;
}

function save2XLSX(data) {
  var workbook = XLSX.utils.book_new();
  const total = data.map(p => {
    return {url:p.url, title:p.title, intro:p.intro}
  })
  const sheet = XLSX.utils.json_to_sheet(total);
  XLSX.utils.book_append_sheet(workbook, sheet, '活动列表');

  for(const item of data) {
    if(item.list.length > 0) {
      const sheet = XLSX.utils.json_to_sheet(item.list);
      XLSX.utils.book_append_sheet(workbook, sheet, item.title);
    }
  }
  const bookname = 'act_' + moment().format('YYYY-MM-DD')
  XLSX.writeFile(workbook, __dirname + `/../public/data/${bookname}.xlsx`);
}

exports.crawl = async function() {
  let list = []
  for(let i = 1; i < 4; i++) {
    const listData = await get(URL + i);
    list = list.concat(parseJson(listData))
    
    for(const item of list) {
      console.log(item.url)
      const actData = await get(item.url)
      item.list = await parseAct(actData)
    }
  }
  
  // console.log(JSON.stringify(list))
  save2XLSX(list)
}

//test

// exports.crawl()

