const request = require('sync-request');
const fs = require('fs');
const urls=[];
exports.loadComments=function(){
  return JSON.parse(request('GET', process.env.COMMENTS_READ).getBody());
}
exports.hooks={
  new_page:function(name){
    urls.push(name);
  },
  build_done:function(){
    let base=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.unshift("");
    base+=urls.map(e=>`<url>\n<loc>https://ngeojiajun.github.io/${e}</loc>\n</url>`).join("\n");
    base+="\n</urlset>";
    fs.writeFileSync("./out/sitemap.xml",base);
  }
}
