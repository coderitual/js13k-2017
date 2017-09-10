!function(){"use strict";function e(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);e.length>t;t++)r[t]=e[t];return r}return Array.from(e)}var t=["assets/hole.svg","assets/stamp.svg","assets/tree.svg","assets/eye.svg","assets/stamp2.svg","assets/eye_closed.svg","assets/heart.svg","assets/projectile.svg","assets/arrow.svg","assets/powerup.svg"].reduce(function(e,t){var r=document.createElement("img");return r.src=t,e[/(\w*)\.svg/g.exec(t)[1]]=r,e},{}),r=function(){function e(e,t){var r=[],n=!0,a=!1,o=void 0;try{for(var s,i=e[Symbol.iterator]();!(n=(s=i.next()).done)&&(r.push(s.value),!t||r.length!==t);n=!0);}catch(e){a=!0,o=e}finally{try{!n&&i.return&&i.return()}finally{if(a)throw o}}return r}return function(t,r){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),n=function(e,t,r){e.globalAlpha=1,e.globalCompositeOperation="source-over",e.fillStyle="#2c5b1e",e.fillRect(0,0,t,r)},a=function(e,t){e.save(),e.strokeStyle="#fff",e.lineWidth=5,e.shadowColor="#000",e.shadowOffsetX=1,e.shadowOffsetY=1,e.shadowBlur=1,e.setLineDash([10,5]),e.strokeRect(0,0,t.width,t.height),e.restore()},o=[t.eye,t.eye,t.eye,t.eye,t.eye_closed],s=function(e,t,r,n){var a=o[Math.round(n/500)%5];e.save(),e.fillStyle="rgba(255, 255, 255, 0.7)",e.font="bold 12px sans-serif",e.textAlign="center",e.shadowColor="rgba(0, 0, 0, 0.5)",e.shadowOffsetX=1,e.shadowOffsetY=1,e.shadowBlur=2,e.drawImage(a,t-a.width/2,r-a.height/2),e.restore()},i=function(e,r){e.save(),e.fillStyle="rgba(255, 255, 255, 0.7)",e.font="bold 12px sans-serif",e.textAlign="center",e.textBaseline="top",e.shadowColor="rgba(0, 0, 0, 0.5)",e.shadowOffsetX=1,e.shadowOffsetY=1,e.shadowBlur=1,r.forEach(function(r){e.drawImage(t.eye,r.x-t.eye.width/2,r.y-t.eye.height/2),e.fillText(r.username,r.x,r.y+15)}),e.restore()},l=function(e,t,r){e.save(),e.beginPath(),e.arc(t,r,5,0,2*Math.PI,!1),e.fillStyle="rgba(255, 255, 255, 0.5)",e.fill(),e.lineWidth=3,e.strokeStyle="#fff",e.stroke(),e.restore()},h=function(e,t){e.save(),e.fillStyle="rgba(255, 255, 255, 1)",e.font="12px sans-serif",e.textAlign="start",e.textBaseline="top",Object.entries(t).forEach(function(t,n){var a=r(t,2),o=a[0],s=a[1];e.fillText(o+": "+s,10,10+15*n)}),e.restore()},f=function(){function e(e,t){var r=[],n=!0,a=!1,o=void 0;try{for(var s,i=e[Symbol.iterator]();!(n=(s=i.next()).done)&&(r.push(s.value),!t||r.length!==t);n=!0);}catch(e){a=!0,o=e}finally{try{!n&&i.return&&i.return()}finally{if(a)throw o}}return r}return function(t,r){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),d=document.getElementById("canvas"),u=d.getContext("2d"),c={x:d.width/2,y:d.height/2},y=function(){d.width=d.clientWidth,d.height=d.clientHeight,c.x=d.width/2,c.y=d.height/2};window.addEventListener("resize",y),y();var w=void 0,g=0;(w="8080"===window.location.port?io(window.location.hostname+":3000",{upgrade:!1,transports:["websocket"],query:""+new URL(window.location).searchParams}):io({upgrade:!1,transports:["websocket"],query:""+new URL(window.location).searchParams})).on("pong",function(e){g=e});var v=function(e){var t=e.id,r=e.username;return{id:t,username:void 0===r?"":r,x:0,y:0,sx:0,sy:0}},m={me:v("me"),others:new Map},p={width:0,height:0},x=new Set,b=new Set,A={pointer:c,players:m,holes:b,trees:x,world:p},S=function(e,t,r){n(u,d.width,d.height),u.save(),u.translate(d.width/2-e.players.me.x,d.height/2-e.players.me.y),i(u,e.players.others),a(u,e.world),u.restore(),s(u,d.width/2,d.height/2,r),l(u,e.pointer.x+d.width/2,e.pointer.y+d.height/2),h(u,{ping:g})},E=function(e,t){var r=e.players;r.me.x+=(r.me.sx-r.me.x)/5,r.me.y+=(r.me.sy-r.me.y)/5,r.others.forEach(function(e){e.x+=(e.sx-e.x)/5,e.y+=(e.sy-e.y)/5})},O=0,k=void 0;window.addEventListener("deviceorientation",function(e){k||(k={beta:e.beta,gamma:e.gamma});var t=e.beta-k.beta,r=e.gamma-k.gamma;t>90&&(t=90),-90>t&&(t=-90),c.x=d.width/2*r/90,c.y=d.height/2*t/90,w.emit("c:pointer",c)}),w.on("s:players:update",function(t){var r=t.me,n=t.others;A.players.others=new Map([].concat(e(A.players.others)).filter(function(e){var t=f(e,1)[0];return null!=n.find(function(e){return e.id===t})})),n.forEach(function(e){var t=A.players.others.get(e.id);if(!t)return t=v(e),void A.players.others.set(e.id,t);t.sx=e.x,t.sy=e.y}),A.players.me.sx=r.x,A.players.me.sy=r.y}),w.on("s:world:update",function(e){var t=e.width,r=e.height;A.world.width=t,A.world.height=r}),function e(t){requestAnimationFrame(e);E(A),S(A,0,t),O=t}(0)}();
