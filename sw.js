//Service worker for Jia Jun's site
//v1
//cache list
const cachesList={
  //files here are never changed except there are major changes happen
  'always-v2':[
    '/css/main.css',
    '/imgs/code-background.png',
    '/js/detail-shim.js',
    '/css/bootstrap.min.css',
    '/js/bootstrap.bundle.min.js'
  ],
  //files here are never changed but only will be fetched when needed
  'always-on-demand-v5':[
    '/css/hljs-atom-one-dark.min.css',
    '/imgs/programming_maze_wip.png',
    '/imgs/blog.png',
    '/imgs/eportfolio.png',
    '/imgs/facebook_icon.png',
    '/imgs/game-menu.png',
    '/imgs/game-screen.png',
    '/imgs/LinkedIn_Logo.png',
    '/imgs/IMG_20190706_113613.jpg',
    '/imgs/IMG-20211223-WA0012.jpg',
    '/imgs/greatkitshows-home.png'
  ],
  'live-prefer-0b760bfba5d2a426806d440890b7667e42a01f01':[
    '/comments.html'
  ],
  'cached-prefer-0b760bfba5d2a426806d440890b7667e42a01f01':true
}

const cacheNames=Object.keys(cachesList);

const ALWAYS_CACHED_KEY=cacheNames.filter(y=>y.startsWith("always-v"))[0];
const ALWAYS_CACHED_ON_DEMAND_KEY=cacheNames.filter(y=>y.startsWith("always-on-demand-v"))[0];
const LIVE_PREFERRED_KEY="live-prefer-0b760bfba5d2a426806d440890b7667e42a01f01";
const CACHED_PREFERRED_KEY="cached-prefer-0b760bfba5d2a426806d440890b7667e42a01f01";

function timeLimited(pros,limit){
  return Promise.race([pros,new Promise((_,reject)=>setTimeout(reject,limit))]);
}

self.addEventListener('install', function(event) {
 //install it now without wait
  self.skipWaiting();
  //cache all the files under always-v prefix
  const key=ALWAYS_CACHED_KEY;
  event.waitUntil(
    caches.open(key)
      .then(function(cache) {
        console.log(`Opened cache ${key}`);
        return cache.addAll(cachesList[key]);
      }).then(y=>console.log("Installation done"))
  );
});

self.addEventListener('fetch', function(event) {
  //user fetchs the page
  //ignore the request if the base url is not our scope
  if(!event.request.url.startsWith(self.registration.scope)){
    return;
  }
  //get the relative url
  let url=event.request.url.replace(self.registration.scope,"/");
  if(cachesList[LIVE_PREFERRED_KEY].includes(url)){
    //the url is preferred to be fetch online first then only offline as
    //fallback
    let task=caches.open(LIVE_PREFERRED_KEY).then(function(cache) {
      return fetch(event.request).then(
        function(response){
          cache.put(event.request, response.clone());
          return response;
        }
      )
    })
    event.respondWith(
      //allow the live http fetch to be attempted at most 5 sec
      //otherwise match the cache directly
      timeLimited(task,5000).catch(()=>caches.match(event.request).then(r=>r||task))
    );
  }
  else{
    //try cache or fetch it
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
          //get the store it belongs
          const store=cachesList[ALWAYS_CACHED_ON_DEMAND_KEY].includes(url)?
                      ALWAYS_CACHED_ON_DEMAND_KEY:
                      CACHED_PREFERRED_KEY;
          return caches.open(store).then(function(cache) {
            return fetch(event.request).then(
              function(response){
                cache.put(event.request, response.clone());
                return response;
              }
            )
          });
        }
      )
    );
  }
});

self.addEventListener('activate', function(event) {
  console.log("Removing old caches")
  event.waitUntil(
    caches.keys().then(function(storeNames) {
      return Promise.all(
        storeNames.filter(function(cacheName) {
          return !cacheNames.includes(cacheName)
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
