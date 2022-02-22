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
    //xml version
    let base=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.unshift("");
    base+=urls.map(e=>`<url>\n<loc>https://ngeojiajun.github.io/${e}</loc>\n</url>`).join("\n");
      base+="\n</urlset>";
      fs.writeFileSync("./out/sitemap.xml",base);
      //txt version
      let final=urls.map(e=>`https://ngeojiajun.github.io/${e}`).join("\n");
        fs.writeFileSync("./out/sitemap.txt",final);
      }
}
//get effective commit of the tree
//since the tree always clean in CI so we can ignore the fact that the tree might be
//modifed
exports.git_commit=function(){
  //first check if the .git exists
  if(!fs.existsSync(".git")){
    //the PWD is not git repo
    return "0000000000000000000000000000000000000000";
  }
  //second get its ref
  //ref can be either the commit id or the ref to branch
  const ref=fs.readFileSync(".git/HEAD",'utf8').split(":").slice(-1)[0].trim();
  if(ref.includes("/")){
    //external reference to branch
    return fs.readFileSync(`.git/${ref}`,'utf8').trim();
  }
  else{
    //checked out on a commit id
    return ref;
  }
}
