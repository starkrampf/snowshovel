function yuv2rgb(y,u,v){
  y=parseInt(y);
  u=parseInt(u);
  v=parseInt(v);
  var ty = 1.164*(y-16);
  var tu = u-128;
  var tv = v-128;
  var r=clamp(Math.floor(ty+1.596*tv),0,255);
  var g=clamp(Math.floor(ty-0.813*tv-0.391*tu),0,255);
  var b=clamp(Math.floor(ty+2.018*tu),0,255);
  return({r:r,g:g,b:b});
}

function rgb2yuv(r,g,b){
  r=parseInt(r);
  g=parseInt(g);
  b=parseInt(b);
  var y=clamp(Math.floor( (0.257*r)+(0.504*g)+(0.098*b)+16 ),0,255);
  var u=clamp(Math.floor(-(0.148*r)-(0.291*g)+(0.439*b)+128),0,255);
  var v=clamp(Math.floor( (0.439*r)-(0.368*g)-(0.071*b)+128),0,255);
  return({y:y,u:u,v:v});
}

function clamp(n,low,high){
    if(n<low){return low;}
    if(n>high){return high;}
    return n;
}
