"use strict";function _toConsumableArray$1(e){if(Array.isArray(e)){for(var r=0,n=Array(e.length);e.length>r;r++)n[r]=e[r];return n}return Array.from(e)}function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function _toConsumableArray(e){if(Array.isArray(e)){for(var r=0,n=Array(e.length);e.length>r;r++)n[r]=e[r];return n}return Array.from(e)}var createPlayer=function(e){return{userId:e,x:0,y:0,vx:0,vy:0,ax:0,ay:0}},createGame=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:3,r=new Set,n=function(e){r.forEach(function(r){var n=r.player,a=r.pointer;if(a){n.ax=a.x-a.cw/2,n.ay=a.y-a.ch/2;5>Math.abs(n.ax)?n.ax=0:(n.ax>0&&(n.ax-=5),0>n.ax&&(n.ax+=5)),5>Math.abs(n.ay)?n.ay=0:(n.ay>0&&(n.ay-=5),0>n.ay&&(n.ay+=5)),n.vx+=n.ax*e/1e3,n.vy+=n.ay*e/1e3,n.vx*=.98,n.vy*=.98,n.x+=n.vx*e/100,n.y+=n.vy*e/100}})},a=function(){r.forEach(function(e){var n=[].concat(_toConsumableArray$1(r)).filter(function(r){return r!==e}).map(function(e){return{x:e.player.x,y:e.player.y,id:e.socket.id}}),a={x:e.player.x,y:e.player.y,id:e.socket.id,me:!0};e.socket.emit("s:players",{me:a,others:n})})},t=Date.now(),o=setInterval(function(){var e=Date.now();n(e-t),a(),t=e},30);return{maxUsersCount:e,addUser:function(e){r.add(e),e.player=createPlayer(e.socket.id)},get usersCount(){return r.size},destroy:function(){clearInterval(o)}}},createUser=function(e){return new function r(){_classCallCheck(this,r),this.socket=e,this.game=null,this.player=null,this.pointer=null}},findOrCreateGame=function(){var e=[].concat(_toConsumableArray(games)).find(function(e){return e.maxUsersCount>e.usersCount});return e||(e=createGame(),games.add(e)),e},users=new Set,games=new Set,index=function(e){console.log("connect: "+e.id);var r=createUser(e);users.add(r);var n=findOrCreateGame();r.game=n,n.addUser(r),e.on("disconnect",function(){console.log("disconnect: "+e.id),users.delete(r)}),e.on("c:pointer",function(e){r.game&&(r.pointer=e)})};module.exports=index;
