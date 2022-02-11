const fs=require("fs");
const express = require('express');
const child_process = require('child_process');

let building=false;
function build(){
  if(building)return Promise.resolve();
  return new Promise(function(resolve, reject) {
    building=true;
    console.log('Running the builder');
    let process=child_process.spawn("ejs-site-generator",[],{
      shell:true,
      stdio:"inherit"
    });
    process.on('exit',(code)=>{
      console.log(`Builder finished with code ${code}`);
      building=false
      resolve();
    });
  });
}

async function main(){
  console.log('Prebuilding the files.....')
  await build();
  //watch all the source directories
  fs.watch("./data",{recursive:true},build);
  fs.watch("./views",{recursive:true},build);
  fs.watch("./statics",{recursive:true},build);
  const app=express();
  app.use(express.static('./out'));
  app.listen(8080);
  console.log(`Server is serving at 8080`);
}
main();
