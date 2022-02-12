const request = require('sync-request');
exports.loadComments=function(){
  return JSON.parse(request('GET', process.env.COMMENTS_READ).getBody());
}
