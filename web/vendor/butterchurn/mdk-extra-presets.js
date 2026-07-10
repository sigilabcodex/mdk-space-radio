/* Additional curated Butterchurn presets for MDK Space Radio.
 * Source package retained locally at source/butterchurn-presets-2.4.7.tgz
 * Upstream: butterchurn-presets@2.4.7, MIT License, https://butterchurnviz.com
 * This file bundles a curated subset only, with light runtime normalization for legibility.
 */
(function(root){
  var presets = {
  "Tripgnosis - Antimatter Streams": {
    "baseVals": {
      "rating": 4.5,
      "gammaadj": 1.9,
      "echo_zoom": 1.169,
      "wave_mode": 2,
      "additivewave": 1,
      "wave_dots": 1,
      "wrap": 0,
      "wave_a": 0.003,
      "wave_scale": 0.01,
      "wave_smoothing": 0.9,
      "warpanimspeed": 0.01,
      "warpscale": 1.611,
      "rot": 0.004,
      "warp": 0.12532,
      "wave_r": 0,
      "wave_g": 0.65,
      "wave_b": 0.75,
      "ob_size": 0,
      "ob_r": 0.11,
      "ob_b": 0.1,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "mv_x": 3,
      "mv_y": 2,
      "mv_dx": 0.02,
      "mv_dy": -0.02,
      "mv_l": 0.15,
      "mv_r": 0.49,
      "mv_g": 0.48,
      "mv_b": 0.3,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "sides": 6,
          "additive": 1,
          "rad": 0.04556,
          "r": 0,
          "g": 1,
          "b": 0.35,
          "g2": 0.15,
          "b2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.tm=0;a.q1=0;a.flip=0;a.flip=0;a.flip=0;a.flip=0;a.flip=0;a.xp=0;a.yp=0;a.zp=0;a.tm=0;a.tm=0;a.sa=0;a.ca=0;a.xr=0;a.xp=0;a.sa=0;a.yp=0;a.ca=0;a.yr=0;a.xp=0;a.ca=0;a.yp=0;a.sa=0;a.zr=0;a.zp=0;a.xp=0;a.xr=0;a.yp=0;a.yr=0;a.tm=0;a.zp=0;a.zr=0;a.tm=0;a.xq=0;a.xp=0;a.sa=0;a.ca=0;a.yq=0;a.yp=0;a.sa=0;a.zp=0;a.ca=0;a.zq=0;a.yp=0;a.ca=0;a.zp=0;a.sa=0;a.tm=0;a.sa=0;a.ca=0;a.xp=0;a.xq=0;a.sa=0;a.yq=0;a.ca=0;a.yp=0;a.xq=0;a.ca=0;a.yq=0;a.sa=0;a.zp=0;a.zq=0;a.zp=0;a.zp=0;a.tm=0;a.xq=0;\na.xp=0;a.sa=0;a.ca=0;a.yq=0;a.yp=0;a.sa=0;a.zp=0;a.ca=0;a.zq=0;a.yp=0;a.ca=0;a.zp=0;a.sa=0;a.tm=0;a.xp=0;a.xq=0;a.sa=0;a.yq=0;a.ca=0;a.yp=0;a.xq=0;a.ca=0;a.yq=0;a.sa=0;a.zp=0;a.zq=0;a.zp=0;a.zp=0;a.tm=0;a.sa=0;a.ca=0;a.xq=0;a.xp=0;a.sa=0;a.zp=0;a.ca=0;a.yq=0;a.yp=0;a.zq=0;a.xp=0;a.ca=0;a.zp=0;a.sa=0;a.tm=0;a.xp=0;a.xq=0;a.sa=0;a.ca=0;a.yp=0;a.yq=0;a.ca=0;a.zq=0;a.sa=0;a.zp=0;a.yq=0;a.sa=0;a.zq=0;a.ca=0;a.zp=0;a.zp=0;a.xs=0;a.xp=0;a.zp=0;a.ys=0;a.yp=0;a.zp=0;a.xs=0;a.ys=0;",
        "frame_eqs_str": "a.tm=a.q1;a.flip+=1;a.flip*=below(a.flip,2);a.xp=0;a.yp=0;a.zp=0;a.ang=20*a.tm+.4*Math.sin(76*a.tm+4*a.time);a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xr=a.xp*a.sa+a.yp*a.ca;a.yr=a.xp*a.ca-a.yp*a.sa;a.zr=a.zp;a.xp=a.xr;a.yp=a.yr+.05+.2*(.5*Math.sin(a.tm)+.5)+.05;a.zp=a.zr;a.ang=Math.sin(2*a.tm);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=8*a.tm;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xp=a.xq*a.sa+a.yq*a.ca;\na.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.3;a.ang=3.14+2.5*Math.sin(2*a.tm-.5);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=-1+Math.cos(3*a.tm+.5);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.35;a.ang=1.75*Math.cos(1*a.tm)-1.05;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xq=a.xp*a.sa+a.zp*a.ca;a.yq=a.yp;a.zq=a.xp*a.ca-a.zp*a.sa;a.ang=Math.cos(a.tm);a.xp=a.xq;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yp=a.yq*a.ca-\na.zq*a.sa;a.zp=a.yq*a.sa+a.zq*a.ca;a.zp+=1.5;a.xs=div(a.xp,a.zp);a.ys=div(a.yp,a.zp);a.x=a.xs+.5;a.y=1.3*a.ys+.5;a.a=.7;"
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 1,
          "spectrum": 1,
          "usedots": 1,
          "additive": 1,
          "r": 0.01,
          "g": 0.9,
          "b": 0.99
        },
        "init_eqs_str": "a.n=0;a.yq=0;a.xp=0;a.yr=0;a.xs=0;a.yp=0;a.xr=0;a.q1=0;a.xq=0;a.flip=0;a.ca=0;a.ys=0;a.sa=0;a.zq=0;a.phs=0;a.ang=0;a.tm=0;a.zp=0;a.zr=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.n=6.283*a.sample;a.phs=.2*-a.sample;a.tm=a.q1+4*a.phs;a.flip+=1;a.flip*=below(a.flip,2);a.xp=0;a.yp=(.1*a.flip-.05)*a.sample;a.zp=0;a.ang=20*a.tm+.4*Math.sin(76*a.tm+4*a.time);a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xr=a.xp*a.sa+a.yp*a.ca;a.yr=a.xp*a.ca-a.yp*a.sa;a.zr=a.zp;a.xp=a.xr;a.yp=a.yr+.05+.2*(.5*Math.sin(a.tm)+.5)+.05;a.zp=a.zr;a.ang=Math.sin(2*a.tm);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=8*a.tm;\na.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.3;a.ang=3.14+2.5*Math.sin(2*a.tm-.5);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=-1+Math.cos(3*a.tm+.5);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.35;a.ang=1.75*Math.cos(1*a.tm)-1.05;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xq=a.xp*a.sa+a.zp*a.ca;a.yq=a.yp;a.zq=a.xp*a.ca-a.zp*a.sa;a.ang=Math.cos(a.tm);\na.xp=a.xq;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yp=a.yq*a.ca-a.zq*a.sa;a.zp=a.yq*a.sa+a.zq*a.ca;a.zp+=1.5;a.xs=div(a.xp,a.zp);a.ys=div(a.yp,a.zp);a.x=a.xs+.5;a.y=1.3*a.ys+.5;a.a=1-a.sample;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "usedots": 1,
          "additive": 1,
          "r": 0.01,
          "g": 0.55,
          "b": 0.75,
          "a": 0.99
        },
        "init_eqs_str": "a.n=0;a.yq=0;a.xp=0;a.yr=0;a.xs=0;a.yp=0;a.xr=0;a.q1=0;a.xq=0;a.flip=0;a.ca=0;a.ys=0;a.sa=0;a.zq=0;a.phs=0;a.ang=0;a.tm=0;a.zp=0;a.zr=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.n=6.283*a.sample;a.phs=.4*-a.sample;a.tm=a.q1+2*a.phs-.01;a.flip+=1;a.flip*=below(a.flip,2);a.xp=0;a.yp=(.2*a.flip-.1)*a.sample;a.zp=0;a.ang=29*-a.tm+.4*Math.sin(76*a.tm+4*a.time);a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xr=a.xp*a.sa+a.yp*a.ca;a.yr=a.xp*a.ca-a.yp*a.sa;a.zr=a.zp;a.xp=a.xr;a.yp=a.yr+.05+.2*(.5*Math.sin(a.tm)+.5)+.05;a.zp=a.zr;a.ang=Math.sin(2*a.tm);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=\n8*a.tm;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.3;a.ang=3.14+2.5*Math.sin(2*a.tm-.5);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=-1+Math.cos(3*a.tm+.5);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.35;a.ang=1.75*Math.cos(1*a.tm)-1.05;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xq=a.xp*a.sa+a.zp*a.ca;a.yq=a.yp;a.zq=a.xp*a.ca-a.zp*a.sa;a.ang=Math.cos(a.tm);\na.xp=a.xq;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yp=a.yq*a.ca-a.zq*a.sa;a.zp=a.yq*a.sa+a.zq*a.ca;a.zp+=1.5;a.xs=div(a.xp,a.zp);a.ys=div(a.yp,a.zp);a.x=a.xs+.5;a.y=1.3*a.ys+.5;a.a=1-a.sample;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "usedots": 1,
          "additive": 1,
          "r": 0,
          "g": 0.8,
          "b": 0.06
        },
        "init_eqs_str": "a.n=0;a.yq=0;a.xp=0;a.yr=0;a.xs=0;a.yp=0;a.xr=0;a.q1=0;a.xq=0;a.flip=0;a.ca=0;a.ys=0;a.sa=0;a.zq=0;a.phs=0;a.ang=0;a.tm=0;a.zp=0;a.zr=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.n=6.283*a.sample;a.phs=.4*-a.sample;a.tm=a.q1+2*a.phs-.02;a.flip+=1;a.flip*=below(a.flip,2);a.xp=0;a.yp=(.4*a.flip-.2)*a.sample;a.zp=0;a.ang=23*a.tm+.3*Math.sin(76*a.tm+4*a.time);a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xr=a.xp*a.sa+a.yp*a.ca;a.yr=a.xp*a.ca-a.yp*a.sa;a.zr=a.zp;a.xp=a.xr;a.yp=a.yr+.05+.2*(.5*Math.sin(a.tm)+.5)+.05;a.zp=a.zr;a.ang=Math.sin(2*a.tm);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=\n8*a.tm;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.3;a.ang=3.14+2.5*Math.sin(2*a.tm-.5);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=-1+Math.cos(3*a.tm+.5);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.35;a.ang=1.75*Math.cos(1*a.tm)-1.05;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xq=a.xp*a.sa+a.zp*a.ca;a.yq=a.yp;a.zq=a.xp*a.ca-a.zp*a.sa;a.ang=Math.cos(a.tm);\na.xp=a.xq;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yp=a.yq*a.ca-a.zq*a.sa;a.zp=a.yq*a.sa+a.zq*a.ca;a.zp+=1.5;a.xs=div(a.xp,a.zp);a.ys=div(a.yp,a.zp);a.x=a.xs+.5;a.y=1.3*a.ys+.5;a.a=1-a.sample;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "usedots": 1,
          "additive": 1,
          "r": 0.1,
          "g": 0.15
        },
        "init_eqs_str": "a.n=0;a.yq=0;a.xp=0;a.yr=0;a.xs=0;a.yp=0;a.xr=0;a.q1=0;a.xq=0;a.flip=0;a.ca=0;a.ys=0;a.sa=0;a.zq=0;a.phs=0;a.ang=0;a.tm=0;a.zp=0;a.zr=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.n=6.283*a.sample;a.phs=.4*-a.sample;a.tm=a.q1+2*a.phs-.03;a.flip+=1;a.flip*=below(a.flip,2);a.xp=0;a.yp=(.6*a.flip-.3)*a.sample;a.zp=0;a.ang=4*-a.tm+.2*Math.sin(76*a.tm+4*a.time);a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xr=a.xp*a.sa+a.yp*a.ca;a.yr=a.xp*a.ca-a.yp*a.sa;a.zr=a.zp;a.xp=a.xr;a.yp=a.yr+.05+.2*(.5*Math.sin(a.tm)+.5)+.05;a.zp=a.zr;a.ang=Math.sin(2*a.tm);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=\n8*a.tm;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.3;a.ang=3.14+2.5*Math.sin(2*a.tm-.5);a.xq=a.xp;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yq=a.yp*a.sa+a.zp*a.ca;a.zq=a.yp*a.ca-a.zp*a.sa;a.ang=-1+Math.cos(3*a.tm+.5);a.xp=a.xq*a.sa+a.yq*a.ca;a.yp=a.xq*a.ca-a.yq*a.sa;a.zp=a.zq;a.zp-=.35;a.ang=1.75*Math.cos(1*a.tm)-1.05;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.xq=a.xp*a.sa+a.zp*a.ca;a.yq=a.yp;a.zq=a.xp*a.ca-a.zp*a.sa;a.ang=Math.cos(a.tm);\na.xp=a.xq;a.sa=Math.sin(a.ang);a.ca=Math.cos(a.ang);a.yp=a.yq*a.ca-a.zq*a.sa;a.zp=a.yq*a.sa+a.zq*a.ca;a.zp+=1.5;a.xs=div(a.xp,a.zp);a.ys=div(a.yp,a.zp);a.x=a.xs+.5;a.y=1.3*a.ys+.5;a.a=1-a.sample;"
      }
    ],
    "init_eqs_str": "a.q1=0;a.mv_x=64;a.mv_y=48;a.nut=0;a.stp=0;a.stq=0;a.rtp=0;a.rtq=0;a.wvr=0;a.decay=0;a.dcsp=0;",
    "frame_eqs_str": "a.decay=.98;a.zoom=1.002;a.q1=.9*a.time;",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": " shader_body { \n  vec4 lums_1;\n  vec3 tmpvar_2;\n  tmpvar_2.z = 0.0;\n  tmpvar_2.xy = texsize.zw;\n  vec3 tmpvar_3;\n  tmpvar_3 = (tmpvar_2 * 3.5);\n  lums_1.x = dot (texture (sampler_main, (uv + (texsize.zw * tmpvar_3.xz))).xyz, vec3(0.32, 0.49, 0.29));\n  lums_1.y = dot (texture (sampler_main, (uv - (texsize.zw * tmpvar_3.xz))).xyz, vec3(0.32, 0.49, 0.29));\n  lums_1.z = dot (texture (sampler_main, (uv + (texsize.zw * tmpvar_3.zy))).xyz, vec3(0.32, 0.49, 0.29));\n  lums_1.w = dot (texture (sampler_main, (uv - (texsize.zw * tmpvar_3.zy))).xyz, vec3(0.32, 0.49, 0.29));\n  vec2 tmpvar_4;\n  tmpvar_4.x = (lums_1.x - lums_1.y);\n  tmpvar_4.y = (lums_1.z - lums_1.w);\n  vec4 tmpvar_5;\n  tmpvar_5.w = 1.0;\n  tmpvar_5.xyz = (texture (sampler_fc_main, (uv + (\n    (((clamp (\n      ((((2800.0 * tmpvar_4) / 3.5) * 0.5) + 0.5)\n    , 0.0, 1.0) * 2.0) - 1.0) * 1.4)\n   * texsize.zw))).xyz * 0.965);\n  ret = tmpvar_5.xyz;\n }",
    "comp": " shader_body { \n  vec2 uv_1;\n  vec3 ret_2;\n  uv_1 = (0.05 + (0.9 * uv));\n  ret_2 = (texture (sampler_main, uv_1).xyz * 4.0);\n  ret_2 = (ret_2 - ((\n    (texture (sampler_blur1, uv_1).xyz * scale1)\n   + bias1) * 4.0));\n  ret_2 = -(ret_2);\n  ret_2 = ((pow (ret_2, vec3(0.5, 0.5, 0.7)) - 0.1) * 1.1);\n  vec4 tmpvar_3;\n  tmpvar_3.w = 1.0;\n  tmpvar_3.xyz = ret_2;\n  ret = tmpvar_3.xyz;\n }"
  },
  "Telek - City Helix Lattice": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1.916999,
      "decay": 1,
      "echo_zoom": 0.999609,
      "echo_alpha": 0.5,
      "echo_orient": 3,
      "additivewave": 1,
      "wave_thick": 1,
      "darken": 1,
      "wave_a": 1,
      "wave_scale": 1.028413,
      "wave_smoothing": 0.45,
      "wave_mystery": -0.6,
      "modwavealphastart": 0.71,
      "modwavealphaend": 1.3,
      "warpanimspeed": 0.07316,
      "warpscale": 0.543568,
      "zoom": 0.999514,
      "warp": 0.01,
      "wave_b": 0.65,
      "wave_x": 0.7499,
      "wave_y": 0.7199,
      "ob_size": 0.02,
      "ob_a": 0.007,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "ib_a": 0.006,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      }
    ],
    "init_eqs_str": "a.warp=0;a.zoom=1;a.rot=.01;",
    "frame_eqs_str": "a.wave_b=.00001<Math.abs(below(a.treb,2))?1:0;a.decay=.00001<Math.abs(equal(mod(a.frame,20),0))?.99:1;a.dx=.00001<Math.abs(equal(mod(a.frame,100),0))?.001:0;a.rot=.05*Math.cos(.4*a.time);a.wave_x=(a.wave_x-.45)*Math.sin(.4*a.time)+a.wave_x;a.wave_y=(a.wave_y-.45)*Math.sin(.4*a.time)+a.wave_y;a.zoom=1-.05*Math.cos(.4*a.time);a.wave_x=.5+(a.wave_x-.5)*Math.cos(5*a.time);a.wave_y=.5+(a.wave_y-.5)*Math.sin(5*a.time);a.ib_a=-.5*Math.cos(.4*a.time)+.5;a.ob_a=a.ib_a;a.ob_r=.5*Math.cos(a.time)+\n.5;a.ob_b=.5;",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": "",
    "comp": ""
  },
  "Unchained - Ghostlight Whisper": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1,
      "decay": 0.982,
      "echo_zoom": 1.160967,
      "echo_alpha": 0.2,
      "wave_mode": 7,
      "additivewave": 1,
      "wave_thick": 1,
      "wave_brighten": 0,
      "wave_a": 0.625316,
      "wave_scale": 0.359738,
      "wave_smoothing": 0,
      "modwavealphastart": 0.71,
      "modwavealphaend": 1.3,
      "warpscale": 1.331,
      "zoomexp": 0.9996,
      "fshader": 0.03,
      "zoom": 0.9993,
      "rot": 0.02,
      "warp": 0.01,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0.005,
      "ob_a": 1,
      "ib_size": 0,
      "ib_r": 0.5,
      "ib_g": 0.5,
      "ib_b": 0.5,
      "mv_x": 64,
      "mv_y": 48,
      "mv_l": 0.85,
      "mv_r": 0.4999,
      "mv_g": 0.4999,
      "mv_b": 0.4999,
      "mv_a": 0.18
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      }
    ],
    "init_eqs_str": "a.bass_residual=0;a.gridx=0;a.old_treb_flop=0;a.bass_flop=0;a.grid=0;a.q6=0;a.q1=0;a.q5=0;a.treb_flop=0;a.bass_thresh=0;a.old_bass_flop=0;a.treb_thresh=0;a.pulse=0;a.bass_changed=0;a.mid_thresh=0;a.q4=0;a.mid_changed=0;a.entropy=0;a.old_mid_flop=0;a.mid_residual=0;a.treb_residual=0;a.chaos=0;a.mid_flop=0;a.q2=0;a.gridy=0;a.treb_changed=0;a.q3=0;a.q7=0;a.q8=0;a.entropy=2;",
    "frame_eqs_str": "a.warp=0;a.old_bass_flop=a.bass_flop;a.old_treb_flop=a.treb_flop;a.old_mid_flop=a.mid_flop;a.chaos=.9+.1*Math.sin(a.pulse);a.entropy=.00001<Math.abs(equal(a.pulse,-20))?1+a.bass_flop+a.treb_flop+a.mid_flop+randint(2):a.entropy;a.bass_thresh=2*above(a.bass_att,a.bass_thresh)+(1-above(a.bass_att,a.bass_thresh))*((a.bass_thresh-1.3)*a.chaos+1.3);a.bass_flop=Math.abs(a.bass_flop-equal(a.bass_thresh,2));a.treb_thresh=2*above(a.treb_att,a.treb_thresh)+(1-above(a.treb_att,a.treb_thresh))*\n((a.treb_thresh-1.3)*a.chaos+1.3);a.treb_flop=Math.abs(a.treb_flop-equal(a.treb_thresh,2));a.mid_thresh=2*above(a.mid_att,a.mid_thresh)+(1-above(a.mid_att,a.mid_thresh))*((a.mid_thresh-1.3)*a.chaos+1.3);a.mid_flop=Math.abs(a.mid_flop-equal(a.mid_thresh,2));a.bass_changed=bnot(equal(a.old_bass_flop,a.bass_flop));a.mid_changed=bnot(equal(a.old_mid_flop,a.mid_flop));a.treb_changed=bnot(equal(a.old_treb_flop,a.treb_flop));a.bass_residual=a.bass_changed*Math.sin(.1*a.pulse*a.entropy)+bnot(a.bass_changed)*\na.bass_residual;a.treb_residual=a.treb_changed*Math.sin(.1*a.pulse*a.entropy)+bnot(a.treb_changed)*a.treb_residual;a.mid_residual=a.mid_changed*Math.sin(.1*a.pulse*a.entropy)+bnot(a.mid_changed)*a.mid_residual;a.pulse=.00001<Math.abs(above(Math.abs(a.pulse),20))?-20:a.pulse+.01*(a.bass_thresh+a.mid_thresh+a.treb_thresh);a.q1=a.mid_residual;a.q2=a.bass_residual;a.q3=a.treb_residual;a.q4=Math.sin(a.pulse);a.q5=Math.cos(div(a.pulse,2)+a.q1);a.q6=above(a.q1,0)+above(a.q2,0)+above(a.q3,0)+above(a.q3,0)*\na.treb_flop+above(a.q2,0)*a.bass_flop+above(a.q1,0)*a.mid_flop;a.q7=a.entropy;a.q8=Math.sin(a.q6*a.q1+a.q7*a.q2);a.wave_r+=.5*Math.sin(a.q1+2*a.q2+2.1*a.q4);a.wave_b+=.5*Math.sin(a.q2+2*a.q3+2.2*a.q4);a.wave_g+=.5*Math.sin(a.q3+2*a.q1+2.3*a.q4);a.mv_r+=.5*Math.sin(a.q4+1.14*a.q5*a.q1);a.mv_b+=.5*Math.sin(a.q4+1.14*a.q5*a.q2);a.mv_g+=.5*Math.sin(a.q5+1.14*a.q5*a.q3);a.mv_a+=a.mv_a*Math.sin(a.q2+a.q3+1.14*a.q5);a.mv_l=2*a.q7;a.wave_x+=.03*a.q7*a.q4;a.wave_y=a.wave_x+.01*a.q6*a.q5;a.mv_x=a.q6*a.q7;a.mv_y=\na.q6*a.q7;a.zoom+=.01*a.q1;",
    "pixel_eqs_str": "a.gridx=bnot(mod(a.q7*Math.sin(3.14*a.x),2));a.gridy=bnot(mod(a.q7*Math.sin(3.14*a.y),2));a.dx=.01*Math.sin((a.y-.5)*a.q1*6.2)+a.q5*Math.sin((a.y-.5)*a.q2*6.2)*.01;a.dy=.01*Math.cos((a.x-.5)*a.q2*6.2)+a.q4*Math.cos((a.x-.5)*a.q1*6.2)*.01;a.grid=Math.sin(sigmoid(Math.sin(6.28*a.y*a.q2),Math.sin(6.28*a.x*a.q5))*(10+a.q7));a.rot=a.rot*sign(a.grid)*a.q4;a.sx+=.03*a.grid;",
    "warp": "",
    "comp": ""
  },
  "yin - 140 - Ohm to the stars": {
    "baseVals": {
      "rating": 5,
      "gammaadj": 2.26,
      "decay": 0.99,
      "echo_zoom": 0.99999,
      "echo_orient": 3,
      "wave_thick": 1,
      "wave_brighten": 0,
      "wrap": 0,
      "darken_center": 1,
      "darken": 1,
      "wave_a": 0.997938,
      "wave_scale": 0.901646,
      "wave_smoothing": 0,
      "wave_mystery": -0.5,
      "modwavealphastart": 0.5,
      "modwavealphaend": 1,
      "zoomexp": 2.216679,
      "fshader": 1,
      "zoom": 0.9999,
      "dx": 0.00001,
      "dy": 0.00001,
      "warp": 0.01,
      "wave_g": 0.25,
      "wave_b": 0.250001,
      "ob_size": 0.05,
      "ob_r": 0.5,
      "ob_g": 0.5,
      "ob_b": 0.5,
      "ib_size": 0.025,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "mv_x": 32,
      "mv_y": 48,
      "mv_dx": 0.3,
      "mv_l": 1,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      }
    ],
    "init_eqs_str": "a.maxdbass=0;a.dbass=0;a.q1=0;a.cheat=0;a.midphase=0;a.lastbeat=0;a.interval=0;a.pbass=0;a.beat=0;a.q2=0;a.phase=0;a.q3=0;a.sure=0;",
    "frame_eqs_str": "a.sure=.00001<Math.abs(equal(a.sure,0))?.6:a.sure;a.interval=.00001<Math.abs(equal(a.interval,0))?40:a.interval;a.lastbeat=.00001<Math.abs(equal(a.lastbeat,0))?a.frame-a.fps:a.lastbeat;a.dbass=div(a.bass-a.pbass,a.fps);a.beat=above(a.dbass,.6*a.maxdbass)*above(a.frame-a.lastbeat,div(a.fps,3));a.sure=.00001<Math.abs(a.beat*below(Math.abs(a.frame-(a.interval+a.lastbeat)),div(a.fps,5)))?Math.min(.095+a.sure,1):a.beat*(a.sure-.095)+(1-a.beat)*a.sure*.9996;a.sure=Math.max(.5,a.sure);\na.cheat=.00001<Math.abs(above(a.frame,a.lastbeat+a.interval+Math.floor(div(a.fps,10)))*above(a.sure,.91))?1:a.cheat;a.beat=.00001<Math.abs(a.cheat)?1:a.beat;a.sure=.00001<Math.abs(a.cheat)?.95*a.sure:a.sure;a.maxdbass=Math.max(.999*a.maxdbass,a.dbass);a.maxdbass=Math.max(.012,a.maxdbass);a.maxdbass=Math.min(.02,a.maxdbass);a.interval=.00001<Math.abs(a.beat)?a.frame-a.lastbeat:a.interval;a.lastbeat=.00001<Math.abs(a.beat)?a.frame-a.cheat*Math.floor(div(a.fps,10)):a.lastbeat;a.cheat=0;a.pbass=a.bass;\na.wave_r=.8*Math.abs(Math.cos(.07*a.time+.532+Math.sin(.125*a.time+.789)));a.wave_g=.8*Math.abs(Math.cos(.092*a.time+2.1+Math.sin(.045*a.time+1.52)));a.wave_b=.8*Math.abs(Math.cos(.1*a.time+1.452+Math.sin(.112*a.time+2.98)));a.q1=a.beat;a.ib_a=a.beat;a.ib_r=1-a.wave_r;a.ib_g=1-a.wave_g;a.ib_b=1-a.wave_b;a.wave_mystery=1-1.5*Math.min(div(a.frame-a.lastbeat,a.interval),1);a.wave_a=.00001<Math.abs(above(div(a.frame-a.lastbeat,a.interval),1))?0:1;a.phase=.00001<Math.abs(equal(mod(a.frame,a.interval),\n0))?a.phase+1:a.phase;a.phase=.00001<Math.abs(equal(mod(a.phase,18),17))?0:a.phase;a.midphase=Math.min(div(a.frame-a.lastbeat,a.interval),1);a.sx=.00001<Math.abs(equal(a.phase,15)*equal(mod(a.frame,a.interval),0))?-1:a.sx;a.sy=.00001<Math.abs(equal(a.phase,26)*equal(mod(a.frame,a.interval),0))?-1:a.sy;a.phase=.00001<Math.abs(equal(mod(a.frame,a.interval),0)*below(Math.cos(div(a.time,6)),-.5))?mod(a.phase+randint(13),14)+1:a.phase;a.q2=a.phase;a.q3=a.midphase;",
    "pixel_eqs_str": "a.zoom=1+.01*Math.sin(13.28*a.rad);a.zoom+=equal(a.q2,1)*a.q3*.1*(a.x-.5);a.zoom+=equal(a.q2,2)*a.q3*.1*(.5-a.x);a.zoom+=equal(a.q2,5)*a.q3*.1*(.5-a.y);a.zoom+=equal(a.q2,4)*a.q3*.1*(a.y-.5);a.rot+=equal(a.q2,3)*a.q3*.3;a.rot-=equal(a.q2,6)*a.q3*.3;a.sx+=equal(a.q2,7)*a.q3*.2;a.sy-=equal(a.q2,8)*a.q3*.2;a.sx-=equal(a.q2,9)*a.q3*.2;a.sy+=equal(a.q2,10)*a.q3*.2;a.dy+=equal(a.q2,11)*Math.abs(.5-a.x)*sign(.5-a.x)*a.q3*.2;a.dx+=equal(a.q2,12)*Math.abs(.5-a.y)*sign(.5-a.y)*a.q3*.2;\na.dx-=equal(a.q2,14)*Math.abs(.5-a.y)*sign(.5-a.y)*a.q3*.2;a.dy-=equal(a.q2,13)*Math.abs(.5-a.x)*sign(.5-a.x)*a.q3*.2;",
    "warp": "",
    "comp": ""
  },
  "Zylot - Star Ornament": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1,
      "decay": 0.997,
      "echo_zoom": 0.996629,
      "echo_orient": 1,
      "wave_thick": 1,
      "wave_brighten": 0,
      "darken": 1,
      "wave_a": 0.001185,
      "wave_scale": 0.01,
      "wave_smoothing": 0.27,
      "wave_mystery": -0.38,
      "modwavealphastart": 0.71,
      "modwavealphaend": 1.3,
      "warpscale": 1.331,
      "zoom": 0.999514,
      "warp": 0.01,
      "ob_size": 0,
      "ob_r": 0.01,
      "ob_a": 1,
      "ib_size": 0,
      "ib_r": 1,
      "ib_g": 1,
      "ib_b": 1,
      "ib_a": 1,
      "mv_x": 64,
      "mv_y": 48,
      "mv_l": 0.85,
      "mv_r": 0.4999,
      "mv_g": 0.4999,
      "mv_b": 0.4999,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "sides": 3,
          "rad": 0.34,
          "ang": 0.53,
          "r": 0.56,
          "g": 0.36,
          "r2": 0.9,
          "a2": 0.5,
          "border_a": 0
        },
        "init_eqs_str": "a.angle=0;a.bassspin=0;a.q1=0;a.q2=0;a.bassspin=0;a.angle=0;",
        "frame_eqs_str": "a.ang=a.angle;a.bassspin=.00001<Math.abs(above(.05*a.bass,a.bassspin))?a.bassspin+.001:a.bassspin-.001;a.bassspin*=above(a.bassspin,0);a.angle+=a.bassspin;a.r=.3*a.bass;a.g=.3*a.treb;a.b=.3*a.mid;a.r2=.8+.2*Math.sin(1.2*a.time);a.g2=.8+.2*Math.sin(.9777*a.time);a.b2=.8+.2*Math.sin(.7005*a.time);a.border_a=1*above(a.bass+a.treb+a.mid,5);a.x=.5+a.q1;a.y=.5+a.q2;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "additive": 1,
          "textured": 1,
          "rad": 0.108073,
          "g": 1,
          "b": 1,
          "r2": 1,
          "b2": 1,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.bassspin=0;a.xpos=0;a.ypos=0;a.q1=0;a.q2=0;a.bassspin=0;a.xpos=.25;a.ypos=.25;",
        "frame_eqs_str": "a.bassspin=.00001<Math.abs(above(.05*a.bass,a.bassspin))?a.bassspin+.001:a.bassspin-.001;a.bassspin*=above(a.bassspin,0);a.xpos+=a.bassspin;a.ypos+=a.bassspin;a.x=.5+a.q1+.13*Math.sin(a.xpos);a.y=.5+a.q2+.18*Math.cos(a.ypos);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 29,
          "additive": 1,
          "textured": 1,
          "rad": 0.105693,
          "g": 1,
          "b": 1,
          "r2": 1,
          "b2": 1,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.bassspin=0;a.xpos=0;a.ypos=0;a.q1=0;a.q2=0;a.bassspin=0;a.xpos=2.3;a.ypos=2.3;",
        "frame_eqs_str": "a.bassspin=.00001<Math.abs(above(.05*a.bass,a.bassspin))?a.bassspin+.001:a.bassspin-.001;a.bassspin*=above(a.bassspin,0);a.xpos+=a.bassspin;a.ypos+=a.bassspin;a.x=.5+a.q1+.13*Math.sin(a.xpos);a.y=.5+a.q2+.18*Math.cos(a.ypos);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "additive": 1,
          "textured": 1,
          "rad": 0.091434,
          "g": 1,
          "b": 1,
          "r2": 1,
          "b2": 1,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.bassspin=0;a.xpos=0;a.ypos=0;a.q1=0;a.q2=0;a.bassspin=0;a.xpos=4.5;a.ypos=4.5;",
        "frame_eqs_str": "a.bassspin=.00001<Math.abs(above(.05*a.bass,a.bassspin))?a.bassspin+.001:a.bassspin-.001;a.bassspin*=above(a.bassspin,0);a.xpos+=a.bassspin;a.ypos+=a.bassspin;a.x=.5+a.q1+.13*Math.sin(a.xpos);a.y=.5+a.q2+.18*Math.cos(a.ypos);"
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.xpos=0;a.yamptarg=0;a.ydir=0;a.q1=0;a.yaccel=0;a.xamptarg=0;a.xamp=0;a.xspeed=0;a.ypos=0;a.xaccel=0;a.att=0;a.vol=0;a.q2=0;a.yamp=0;a.xdir=0;a.yspeed=0;",
    "frame_eqs_str": "a.warp=0;a.decay=.92;a.vol=div(a.bass+a.mid+a.att,6);a.xamptarg=.00001<Math.abs(equal(mod(a.frame,15),0))?Math.min(.5*a.vol*a.bass_att,.5):a.xamptarg;a.xamp+=.5*(a.xamptarg-a.xamp);a.xdir=.00001<Math.abs(above(Math.abs(a.xpos),a.xamp))?-sign(a.xpos):.00001<Math.abs(below(Math.abs(a.xspeed),.1))?2*above(a.xpos,0)-1:a.xdir;a.xaccel=a.xdir*a.xamp-a.xpos-.055*a.xspeed*below(Math.abs(a.xpos),a.xamp);a.xspeed=a.xspeed+a.xdir*a.xamp-a.xpos-.055*a.xspeed*below(Math.abs(a.xpos),a.xamp);\na.xpos+=.001*a.xspeed;a.yamptarg=.00001<Math.abs(equal(mod(a.frame,15),0))?Math.min(.3*a.vol*a.treb_att,.5):a.yamptarg;a.yamp+=.5*(a.yamptarg-a.yamp);a.ydir=.00001<Math.abs(above(Math.abs(a.ypos),a.yamp))?-sign(a.ypos):.00001<Math.abs(below(Math.abs(a.yspeed),.1))?2*above(a.ypos,0)-1:a.ydir;a.yaccel=a.ydir*a.yamp-a.ypos-.055*a.yspeed*below(Math.abs(a.ypos),a.yamp);a.yspeed=a.yspeed+a.ydir*a.yamp-a.ypos-.055*a.yspeed*below(Math.abs(a.ypos),a.yamp);a.ypos+=.001*a.yspeed;a.q1=a.ypos;a.q2=a.xpos;",
    "pixel_eqs_str": "a.zoom+=a.q1*a.q2*2;a.rot=10+a.rad*a.treb*.1;",
    "warp": "",
    "comp": ""
  },
  "Aderrasi - Calabi-Jau Space Bar": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1.7,
      "decay": 0.9,
      "echo_zoom": 1,
      "echo_alpha": 0.5,
      "echo_orient": 3,
      "wave_thick": 1,
      "darken": 1,
      "wave_a": 100,
      "wave_scale": 0.653093,
      "wave_smoothing": 0.5,
      "modwavealphastart": 0.5,
      "modwavealphaend": 1,
      "dx": 0.00001,
      "dy": 0.00001,
      "warp": 0.01,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0,
      "ob_a": 1,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "mv_x": 0,
      "mv_y": 0,
      "mv_l": 1,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "rad": 0.80814,
          "g": 1,
          "b2": 1,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.q2=0;a.q1=0;a.q3=0;a.q2=0;a.q1=0;a.q3=0;",
        "frame_eqs_str": "a.sides=3*a.bass_att;a.r=a.q2;a.g=a.q1;a.b=a.q3;a.r2=1-Math.abs(a.q2);a.g2=1-Math.abs(a.q1);a.b2=1-Math.abs(a.q3);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 3,
          "x": 0.6,
          "rad": 0.134785,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.q3=0;a.q2=0;a.q1=0;a.q3=0;a.q2=0;a.q1=0;",
        "frame_eqs_str": "a.x+=.18*Math.sin(3.21*a.time);a.y+=.12*Math.sin(2.74*a.time);a.sides=5*a.bass_att;a.r=a.q3;a.g=a.q2;a.b=a.q1;a.r2=1-Math.abs(a.q3);a.g2=1-Math.abs(a.q2);a.b2=1-Math.abs(a.q1);a.ang+=.23*Math.tan(2*a.time);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 3,
          "textured": 1,
          "y": 0.4,
          "rad": 0.270481,
          "tex_zoom": 0.999995,
          "r": 0,
          "b": 1,
          "a2": 1
        },
        "init_eqs_str": "a.q1=0;a.q3=0;a.q2=0;a.q1=0;a.q3=0;a.q2=0;",
        "frame_eqs_str": "a.y+=.18*Math.sin(1.2*a.time);a.x+=.11*Math.sin(5.67*a.time);a.sides=5*a.treb_att;a.ang+=.45*Math.tan(4.3*a.time);a.r=2*a.q1;a.g=2*a.q3;a.b=2*a.q2;a.r2=1-Math.abs(2*a.q1);a.g2=1-Math.abs(2*a.q3);a.b2=1-Math.abs(2*a.q2);"
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.thresh=0;a.dx_r=0;a.dy_r=0;a.q1=0;a.q2=0;a.q3=0;",
    "frame_eqs_str": "a.warp=0;a.wave_r=a.wave_r+.25*Math.cos(1.12*a.time)+.2*(.3*Math.cos(1.28*a.time)+.3*Math.sin(2*a.time));a.wave_g=a.wave_g+.25*Math.cos(1.142*a.time)+.2*(.3*Math.cos(1.2*a.time)+.32*Math.sin(1.623*a.time));a.wave_b=a.wave_b+.25*Math.cos(1.13*a.time)+.2*(.4*Math.cos(1.9*a.time)+.34*Math.sin(1.5245*a.time));a.q1=a.wave_r;a.q2=a.wave_g;a.q3=a.wave_b;",
    "pixel_eqs_str": "a.thresh=2*above(a.bass_att,a.thresh)+(1-above(a.bass_att,a.thresh))*(.96*(a.thresh-1.3)+1.3);a.dx_r=.15*equal(a.thresh,2)*Math.sin(5*a.time)+(1-equal(a.thresh,2))*a.dx_r;a.dy_r=.15*equal(a.thresh,2)*Math.sin(6*a.time)+(1-equal(a.thresh,2))*a.dy_r;a.rot+=.2*Math.abs(7*a.dx_r*(2*a.rad-Math.cos(12*a.ang))*Math.sin(2-a.rad)*Math.abs(1.2*a.dx_r));a.zoom+=.2*Math.abs(8*a.dy_r*Math.abs(a.dx_r*Math.sin(2*Math.sin(2*a.rad)*Math.tan(6*a.rad))));a.zoom+=4*a.dx_r*(a.rad-3.5*a.x*Math.cos(Math.sin(3-\n3*a.rad*Math.cos(2*a.y-a.bass_att)))*(.5-a.rad));",
    "warp": "",
    "comp": ""
  },
  "Aderrasi - Halls Of Centrifuge": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1,
      "decay": 1,
      "echo_zoom": 1,
      "echo_alpha": 0.5,
      "echo_orient": 3,
      "wave_mode": 1,
      "wave_brighten": 0,
      "wrap": 0,
      "darken_center": 1,
      "wave_a": 100,
      "wave_scale": 1.48862,
      "wave_smoothing": 0,
      "modwavealphastart": 0.5,
      "modwavealphaend": 1,
      "warpanimspeed": 0.01,
      "warpscale": 0.01,
      "fshader": 1,
      "dx": 0.00001,
      "dy": 0.00001,
      "warp": 0.01,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0.2,
      "ob_r": 0.9,
      "ob_g": 0.9,
      "ob_b": 0.9,
      "ob_a": 0.5,
      "ib_size": 0.05,
      "ib_r": 0.9,
      "ib_g": 0.9,
      "ib_b": 0.9,
      "ib_a": 0.5,
      "mv_x": 1.28,
      "mv_y": 9.599999,
      "mv_dx": 0.4,
      "mv_dy": -0.2,
      "mv_l": 5,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      }
    ],
    "init_eqs_str": "a.thresh=0;a.dx_r=0;a.dy_r=0;",
    "frame_eqs_str": "a.wave_r=a.wave_r+.25*Math.sin(1.4*a.time)+.25*Math.sin(2.25*a.time);a.wave_g=a.wave_g+.25*Math.sin(1.7*a.time)+.25*Math.sin(2.11*a.time);a.wave_b=a.wave_b+.25*Math.sin(1.84*a.time)+.25*Math.sin(2.3*a.time);a.warp=0;a.ib_r=a.wave_b;a.ib_g=a.wave_r;a.ib_b=a.wave_g;a.ob_r=a.wave_r*Math.sin(a.wave_b);a.ob_g=a.wave_g*Math.sin(a.wave_r);a.ob_b=a.wave_b*Math.sin(a.wave_g);a.zoom-=.05;",
    "pixel_eqs_str": "a.thresh=2*above(a.bass_att,a.thresh)+(1-above(a.bass_att,a.thresh))*(.96*(a.thresh-1.3)+1.3);a.dx_r=.015*equal(a.thresh,2)*Math.sin(5*a.time)+(1-equal(a.thresh,2))*a.dx_r;a.dy_r=.015*equal(a.thresh,2)*Math.sin(6*a.time)+(1-equal(a.thresh,2))*a.dy_r;a.rot+=a.rad*(1.1*Math.sin(a.time)-a.rad)*1.25;a.rot+=.1*above(a.rad,.7-.2*Math.sin(a.bass));a.zoom-=above(a.rad,.5+.1*Math.sin(1-a.rad*Math.cos(a.time)))*below(.5*Math.sin(a.time)-a.rad,.5)*.09*a.rad;a.zoom+=.025*below(a.rad,.75+\n.5*Math.sin(a.bass*a.time));a.zoom-=.02*(Math.sin(a.time)-a.rad-a.rad);a.zoom+=.03*(.1+(1+a.rad))*below(a.rad,.1)*above(a.bass,1);",
    "warp": "",
    "comp": ""
  },
  "Aderrasi - Horvath′s Holistic Abyss": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1,
      "decay": 1,
      "echo_zoom": 0.999997,
      "wave_thick": 1,
      "wrap": 0,
      "wave_a": 100,
      "wave_scale": 0.01,
      "wave_smoothing": 0.5,
      "wave_mystery": 0.4,
      "modwavealphastart": 0.5,
      "modwavealphaend": 1,
      "zoomexp": 1.000157,
      "dx": 0.00001,
      "dy": 0.00001,
      "warp": 0.01,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0,
      "ob_a": 1,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "mv_x": 64,
      "mv_y": 1.488,
      "mv_dy": -0.1,
      "mv_l": 0.5,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      }
    ],
    "init_eqs_str": "a.thresh=0;a.dx_r=0;a.dy_r=0;",
    "frame_eqs_str": "a.wave_r=a.wave_r+3.35*Math.sin(4*a.mid_att)-3.25*Math.sin(2.5*a.bass);a.wave_g=a.wave_g+3.35*Math.sin(3.7*a.treb_att)-3.25*Math.sin(2.11*a.mid);a.wave_b=a.wave_b+3.35*Math.sin(3.84*a.bass_att)-3.25*Math.sin(2.3*a.treb);a.warp=0;a.zoom+=.03;",
    "pixel_eqs_str": "a.thresh=2*above(a.bass_att,a.thresh)+(1-above(a.bass_att,a.thresh))*(.96*(a.thresh-1.3)+1.3);a.dx_r=.015*equal(a.thresh,2)*Math.sin(5*a.time)+(1-equal(a.thresh,2))*a.dx_r;a.dy_r=.015*equal(a.thresh,2)*Math.sin(6*a.time)+(1-equal(a.thresh,2))*a.dy_r;a.zoom+=.00001<Math.abs(above(a.rad,.2+.25*Math.sin(1.2*a.time)))?.00001<Math.abs(below(a.rad,.5+.25*Math.sin(1.2*a.time)))?-.05:-.025:-.02*(1-a.rad);a.rot+=.00001<Math.abs(above(a.rad,.2+.25*Math.cos(1.8*a.time)))?.00001<Math.abs(below(a.rad,\n.5+.25*Math.cos(1.8*a.time)))?.08:-.08:-.5*(.5-a.rad);a.zoom+=.003;a.dx+=(1-a.rad)*a.dx_r;a.dy+=(1-a.rad)*a.dy_r;a.dx+=.03*above(a.rad,.5+.4*Math.cos(2*a.time))*a.dx_r;a.dy+=.03*above(a.rad,.5+.4*Math.sin(2*a.time))*a.dy_r;",
    "warp": "",
    "comp": ""
  },
  "Eo.S. - starburst 01": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1,
      "decay": 0.96,
      "echo_zoom": 1.006596,
      "echo_orient": 1,
      "wave_mode": 2,
      "wave_dots": 1,
      "wave_brighten": 0,
      "wrap": 0,
      "wave_a": 0.001,
      "wave_scale": 0.011726,
      "wave_smoothing": 0.9,
      "warpanimspeed": 0.010284,
      "warpscale": 0.01,
      "warp": 0.01,
      "wave_r": 0.5,
      "wave_g": 0.4,
      "wave_b": 0.3,
      "ob_size": 0,
      "ob_r": 0.11,
      "ob_b": 0.1,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "mv_x": 64,
      "mv_y": 48,
      "mv_l": 1,
      "mv_r": 0.39,
      "mv_g": 0.44,
      "mv_b": 0.9,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "sides": 10,
          "additive": 1,
          "textured": 1,
          "rad": 0.419061,
          "tex_zoom": 1.257163,
          "r": 0.8,
          "g": 0.9,
          "b": 1,
          "a": 0.2,
          "g2": 0.5,
          "b2": 1,
          "border_a": 0
        },
        "init_eqs_str": "",
        "frame_eqs_str": ""
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 1,
          "additive": 1,
          "r": 0.3,
          "g": 0.7
        },
        "init_eqs_str": "a.n=0;a.yq=0;a.xp=0;a.xs=0;a.yp=0;a.xq=0;a.flip=0;a.ys=0;a.zq=0;a.ang=0;a.zp=0;a.phase=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.n=6.283*a.sample;a.flip+=1;a.flip*=below(a.flip,2);a.phase=Math.sin(3*a.n)*Math.sin(7.9*a.n)*Math.sin(16.7*a.n)*Math.sin(63.5*a.n)*6;a.xp=Math.sin(a.n+a.phase)*a.flip;a.yp=Math.cos(a.n+a.phase)*a.flip;a.zp=0;a.ang=2*a.n+.2*a.phase;a.xq=a.xp*Math.sin(a.ang)+a.zp*Math.cos(a.ang);a.yq=a.yp;a.zq=a.xp*Math.cos(a.ang)-a.zp*Math.sin(a.ang);a.ang=.1*a.time;a.xp=a.xq*Math.sin(a.ang)+a.zq*Math.cos(a.ang);a.yp=a.yq;a.zp=a.xq*Math.cos(a.ang)-a.zq*Math.sin(a.ang);a.ang=.17*a.time;a.xq=\na.xp;a.yq=a.yp*Math.sin(a.ang)+a.zp*Math.cos(a.ang);a.zq=a.yp*Math.cos(a.ang)-a.zp*Math.sin(a.ang);a.zq+=3.1;a.xs=div(a.xq,a.zq);a.ys=div(a.yq,a.zq);a.x=a.xs+.5;a.y=1.3*a.ys+.5;a.a=.05*(1-a.flip);"
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.mv_x=64;a.mv_y=48;a.nut=0;a.stp=0;a.stq=0;a.rtp=0;a.rtq=0;a.wvr=0;a.decay=0;a.dcsp=0;",
    "frame_eqs_str": "a.decay=.91;a.zoom=1.03;",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": "",
    "comp": ""
  },
  "Flexi - impulse drive": {
    "baseVals": {
      "rating": 1,
      "gammaadj": 1,
      "wave_thick": 1,
      "wrap": 0,
      "wave_a": 0.004,
      "wave_scale": 0.037,
      "wave_smoothing": 0,
      "wave_mystery": -0.44,
      "modwavealphastart": 1,
      "modwavealphaend": 1,
      "warpanimspeed": 0.803,
      "warpscale": 1.22,
      "zoomexp": 1.50374,
      "warp": 0.31218,
      "wave_y": 0.04,
      "ob_size": 0.005,
      "ob_a": 1,
      "ib_size": 0,
      "ib_r": 1,
      "ib_g": 0,
      "ib_b": 0.75,
      "ib_a": 1,
      "mv_x": 64,
      "mv_y": 48,
      "mv_l": 0,
      "mv_b": 0,
      "mv_a": 0,
      "b1ed": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "additive": 1,
          "num_inst": 50,
          "rad": 0.01,
          "ang": 3.20442,
          "tex_zoom": 6.23873,
          "g": 1,
          "b": 1,
          "a": 0,
          "r2": 1,
          "b2": 1,
          "border_a": 0.82
        },
        "init_eqs_str": "a.index=0;a.q32=0;a.index=0;a.index=0;a.index=0;a.index=0;a.index=0;a.index=0;a.q2=0;",
        "frame_eqs_str": "a.index=a.instance*a.q32;a.x=a.gmegabuf[Math.floor(a.index)];a.y=a.gmegabuf[Math.floor(a.index+1)];a.rad=2*a.gmegabuf[Math.floor(a.index+4)];a.r=a.gmegabuf[Math.floor(a.index+5)];a.g=a.gmegabuf[Math.floor(a.index+6)];a.b=a.gmegabuf[Math.floor(a.index+7)];a.r2=a.r;a.g2=a.g;a.b2=a.b;a.x=.5+div(a.x-.5,a.q2);"
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 1,
          "samples": 442,
          "additive": 1,
          "scaling": 5.92556,
          "smoothing": 0,
          "a": 0.16
        },
        "init_eqs_str": "a.d=0;a.xx=0;a.w=0;a.index2=0;a.ppo=0;a.index=0;a.smaller=0;a.t1=0;a.j=0;a.q31=0;a.smallestfind=0;a.distance=0;a.i=0;a.t2=0;a.q2=0;a.q32=0;a.yy=0;a.findindex=0;",
        "frame_eqs_str": "a.t1=0;a.t2=0;",
        "point_eqs_str": "a.ppo=11;a.index=a.t2*a.q32;a.x=.5+div(a.gmegabuf[Math.floor(a.index)]-.5,a.q2);a.y=.5+div(a.gmegabuf[Math.floor(a.index+1)]-.5,a.q2);a.i=0;for(var b=a.j=0;b<a.q31;b++)a.d=sqrt(sqr(a.gmegabuf[Math.floor(a.index)]-a.gmegabuf[Math.floor(a.i)])+sqr(a.gmegabuf[Math.floor(a.index+1)]-a.gmegabuf[Math.floor(a.i+1)])),a.megabuf[Math.floor(a.j)]=a.i,a.megabuf[Math.floor(a.j+1)]=a.d,a.j+=2,a.i+=a.q32;for(b=a.i=0;7>b;b++){a.j=a.i;a.smallestfind=100;a.findindex=-1;for(var c=0;c<a.q31-a.j;c++)a.distance=\na.megabuf[Math.floor(2*a.j+1)],a.smaller=above(a.smallestfind,a.distance),a.smallestfind=.00001<Math.abs(a.smaller)?a.distance:a.smallestfind,a.findindex=.00001<Math.abs(a.smaller)?2*a.j:a.findindex,a.j+=1;a.j=a.megabuf[Math.floor(a.i)];a.d=a.megabuf[Math.floor(a.i+1)];a.megabuf[Math.floor(a.i)]=a.megabuf[Math.floor(a.findindex)];a.megabuf[Math.floor(a.i+1)]=a.megabuf[Math.floor(a.findindex+1)];a.megabuf[Math.floor(a.findindex)]=a.j;a.megabuf[Math.floor(a.findindex+1)]=a.d;a.i+=1}a.index2=mod(a.t1,\na.ppo);a.i=.00001<Math.abs(below(a.index2,a.ppo-4))?a.megabuf[Math.floor(a.index2)]:a.index;a.xx=.5+div(a.gmegabuf[Math.floor(a.i)]-.5,a.q2);a.yy=.5+div(a.gmegabuf[Math.floor(a.i+1)]-.5,a.q2);a.w=div(Math.asin(1)*a.index2,4);a.x=.00001<Math.abs(equal(mod(a.index2,2),0))?a.x:a.xx;a.y=.00001<Math.abs(equal(mod(a.index2,2),0))?a.y:a.yy;a.b=below(a.index2,a.ppo-1)*above(a.index2,0);a.r=a.b;a.g=a.b;a.t2+=equal(mod(a.t1,a.ppo),a.ppo-1);a.t1+=1;"
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.w=0;a.index2=0;a.index=0;a.w2=0;a.ref_ang=0;a.q1=0;a.count=0;a.gravity=0;a.vv1=0;a.vv2=0;a.w1=0;a.attributes=0;a.m2=0;a.hit=0;a.q2=0;a.m1=0;a.v1=0;a.pi2=0;a.v2=0;a.dampening=0;for(var b=a.i=0;1048576>b;b++)a.gmegabuf[Math.floor(a.i)]=0,a.i+=1;a.count=40;a.attributes=9;a.minradius=.005;a.maxradius=.045;a.v=.005;for(b=a.index=0;b<a.count;b++)a.gmegabuf[Math.floor(a.index*a.attributes)]=div(randint(1E3),1E3),a.gmegabuf[Math.floor(a.index*a.attributes+1)]=div(randint(1E3),1E3),\na.gmegabuf[Math.floor(a.index*a.attributes+2)]=a.v*(div(randint(1E3),1E3)-.5),a.gmegabuf[Math.floor(a.index*a.attributes+3)]=a.v*(div(randint(1E3),1E3)-.5),a.gmegabuf[Math.floor(a.index*a.attributes+4)]=a.minradius+div((a.maxradius-a.minradius)*(a.index+1),a.count),a.gmegabuf[Math.floor(a.index*a.attributes+5)]=div(randint(1E3),1E3),a.gmegabuf[Math.floor(a.index*a.attributes+6)]=div(randint(1E3),1E3),a.gmegabuf[Math.floor(a.index*a.attributes+7)]=div(randint(1E3),1E3),a.gmegabuf[Math.floor(a.index*\na.attributes+8)]=sqr(a.gmegabuf[Math.floor(a.index*a.attributes+4)]),a.index+=1;a.q31=a.count;a.q32=a.attributes;",
    "frame_eqs_str": "a.warp=0;a.zoom=1;a.gravity=0*div(.005,a.fps);a.dampening=.995;a.pi2=Math.asin(1);a.index=0;a.index2=0;a.w=div(a.aspecty-a.aspectx,2);for(var b=0;b<a.count;b++){a.gmegabuf[Math.floor(a.index*a.attributes+1)]+=a.gmegabuf[Math.floor(a.index*a.attributes+3)];a.gmegabuf[Math.floor(a.index*a.attributes)]+=a.gmegabuf[Math.floor(a.index*a.attributes+2)];a.gmegabuf[Math.floor(a.index*a.attributes+2)]=.00001<Math.abs(below(a.gmegabuf[Math.floor(a.index*a.attributes)],0-a.w+a.gmegabuf[Math.floor(a.index*\na.attributes+4)]))?Math.abs(a.gmegabuf[Math.floor(a.index*a.attributes+2)])*a.dampening:a.gmegabuf[Math.floor(a.index*a.attributes+2)];a.gmegabuf[Math.floor(a.index*a.attributes+2)]=.00001<Math.abs(above(a.gmegabuf[Math.floor(a.index*a.attributes)],1+a.w-a.gmegabuf[Math.floor(a.index*a.attributes+4)]))?-Math.abs(a.gmegabuf[Math.floor(a.index*a.attributes+2)])*a.dampening:a.gmegabuf[Math.floor(a.index*a.attributes+2)];a.gmegabuf[Math.floor(a.index*a.attributes+3)]-=a.gravity;a.gmegabuf[Math.floor(a.index*\na.attributes+3)]=.00001<Math.abs(below(a.gmegabuf[Math.floor(a.index*a.attributes+1)],a.gmegabuf[Math.floor(a.index*a.attributes+4)]))?Math.abs(a.gmegabuf[Math.floor(a.index*a.attributes+3)])*a.dampening:a.gmegabuf[Math.floor(a.index*a.attributes+3)];a.gmegabuf[Math.floor(a.index*a.attributes+3)]=.00001<Math.abs(above(a.gmegabuf[Math.floor(a.index*a.attributes+1)],1-a.gmegabuf[Math.floor(a.index*a.attributes+4)]))?-Math.abs(a.gmegabuf[Math.floor(a.index*a.attributes+3)])*a.dampening:a.gmegabuf[Math.floor(a.index*\na.attributes+3)];a.hit=-1;a.index2=a.index;for(var c=0;c<a.count-a.index;c++)a.hit=below(sqrt(sqr(a.gmegabuf[Math.floor(a.index*a.attributes)]-a.gmegabuf[Math.floor(a.index2*a.attributes)])+sqr(a.gmegabuf[Math.floor(a.index*a.attributes+1)]-a.gmegabuf[Math.floor(a.index2*a.attributes+1)])),a.gmegabuf[Math.floor(a.index*a.attributes+4)]+a.gmegabuf[Math.floor(a.index2*a.attributes+4)])*above(sqrt(sqr(a.gmegabuf[Math.floor(a.index*a.attributes)]-a.gmegabuf[Math.floor(a.index2*a.attributes)])+sqr(a.gmegabuf[Math.floor(a.index*\na.attributes+1)]-a.gmegabuf[Math.floor(a.index2*a.attributes+1)])),sqrt(sqr(a.gmegabuf[Math.floor(a.index*a.attributes)]-a.gmegabuf[Math.floor(a.index2*a.attributes)]+a.gmegabuf[Math.floor(a.index*a.attributes+2)]-a.gmegabuf[Math.floor(a.index2*a.attributes+2)])+sqr(a.gmegabuf[Math.floor(a.index*a.attributes+1)]-a.gmegabuf[Math.floor(a.index2*a.attributes+1)]+a.gmegabuf[Math.floor(a.index*a.attributes+3)]-a.gmegabuf[Math.floor(a.index2*a.attributes+3)]))),a.ref_ang=Math.atan2(a.gmegabuf[Math.floor(a.index2*\na.attributes)]-a.gmegabuf[Math.floor(a.index*a.attributes)],a.gmegabuf[Math.floor(a.index2*a.attributes+1)]-a.gmegabuf[Math.floor(a.index*a.attributes+1)])+a.pi2,a.v1=sqrt(sqr(a.gmegabuf[Math.floor(a.index*a.attributes+2)])+sqr(a.gmegabuf[Math.floor(a.index*a.attributes+3)])),a.v2=sqrt(sqr(a.gmegabuf[Math.floor(a.index2*a.attributes+2)])+sqr(a.gmegabuf[Math.floor(a.index2*a.attributes+3)])),a.w1=Math.atan2(a.gmegabuf[Math.floor(a.index*a.attributes+2)],a.gmegabuf[Math.floor(a.index*a.attributes+3)]),\na.w2=Math.atan2(a.gmegabuf[Math.floor(a.index2*a.attributes+2)],a.gmegabuf[Math.floor(a.index2*a.attributes+3)]),a.m1=a.gmegabuf[Math.floor(a.index*a.attributes+8)],a.m2=a.gmegabuf[Math.floor(a.index2*a.attributes+8)],a.vv1=div((a.m1-a.m2)*a.v1+2*a.m2*a.v2,a.m1+a.m2),a.vv2=div((a.m2-a.m1)*a.v2+2*a.m1*a.v1,a.m1+a.m2),a.gmegabuf[Math.floor(a.index*a.attributes+2)]=.00001<Math.abs(a.hit)?Math.sin(a.ref_ang)*a.v1*Math.cos(a.w1-a.ref_ang)+Math.sin(a.ref_ang+a.pi2)*a.vv1*Math.cos(a.w2-a.ref_ang-a.pi2):\na.gmegabuf[Math.floor(a.index*a.attributes+2)],a.gmegabuf[Math.floor(a.index*a.attributes+3)]=.00001<Math.abs(a.hit)?Math.cos(a.ref_ang)*a.v1*Math.cos(a.w1-a.ref_ang)+Math.cos(a.ref_ang+a.pi2)*a.vv1*Math.cos(a.w2-a.ref_ang-a.pi2):a.gmegabuf[Math.floor(a.index*a.attributes+3)],a.gmegabuf[Math.floor(a.index2*a.attributes+2)]=.00001<Math.abs(a.hit)?Math.sin(a.ref_ang)*a.v2*Math.cos(a.w2-a.ref_ang)+Math.sin(a.ref_ang+a.pi2)*a.vv2*Math.cos(a.w1-a.ref_ang-a.pi2):a.gmegabuf[Math.floor(a.index2*a.attributes+\n2)],a.gmegabuf[Math.floor(a.index2*a.attributes+3)]=.00001<Math.abs(a.hit)?Math.cos(a.ref_ang)*a.v2*Math.cos(a.w2-a.ref_ang)+Math.cos(a.ref_ang+a.pi2)*a.vv2*Math.cos(a.w1-a.ref_ang-a.pi2):a.gmegabuf[Math.floor(a.index2*a.attributes+3)],a.index2+=1;a.index+=1}a.q1=a.aspectx;a.q2=a.aspecty;a.monitor=a.aspecty;",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": " shader_body { \n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  tmpvar_1.xyz = (texture (sampler_main, uv).xyz * 0.75);\n  ret = tmpvar_1.xyz;\n }",
    "comp": " shader_body { \n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  tmpvar_1.xyz = texture (sampler_main, uv).xyz;\n  ret = tmpvar_1.xyz;\n }"
  },
  "Flexi - oldschool tree": {
    "baseVals": {
      "rating": 5,
      "gammaadj": 1,
      "decay": 1,
      "echo_zoom": 1,
      "echo_alpha": 1,
      "echo_orient": 2,
      "wave_thick": 1,
      "wave_brighten": 0,
      "wrap": 0,
      "brighten": 1,
      "wave_a": 0.004,
      "wave_scale": 0.01,
      "wave_smoothing": 0,
      "wave_mystery": -0.44,
      "modwavealphastart": 1,
      "modwavealphaend": 1,
      "warpanimspeed": 0.01,
      "warpscale": 100,
      "zoomexp": 1.83149,
      "zoom": 0.9901,
      "warp": 0.01,
      "wave_y": 0.04,
      "ob_size": 0.005,
      "ob_a": 1,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "ib_a": 1,
      "mv_x": 64,
      "mv_y": 48,
      "mv_l": 0,
      "mv_b": 0,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "additive": 1,
          "thickoutline": 1,
          "textured": 1,
          "y": 0.4,
          "rad": 0.59958,
          "ang": 0.81681,
          "tex_zoom": 0.75683,
          "g": 1,
          "b": 1,
          "r2": 0.8,
          "g2": 0.4,
          "b2": 0.2,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.x1=0;a.x2=0;a.ox=0;a.q2=0;a.y2=0;a.s=0;a.s=0;a.y2=0;a.s=0;a.s=0;a.x1=0;a.s=0;a.x2=0;a.xx=0;a.q1=0;a.ox=0;a.q4=0;a.vx=0;",
        "frame_eqs_str": "a.x1=.5;a.x2=.5+a.ox+.3*Math.sin(a.q2);a.y2=.78;a.s=.5;a.y=(1-a.s)*a.y2+a.s-.16;a.x=a.s*a.x1+(1-a.s)*a.x2-.12;a.xx=a.q1;a.ox=.2*(a.q4-.5);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "additive": 1,
          "thickoutline": 1,
          "textured": 1,
          "y": 0.4,
          "rad": 0.59958,
          "ang": 5.46637,
          "tex_zoom": 0.75683,
          "g": 1,
          "b": 1,
          "r2": 0.4,
          "g2": 0.8,
          "b2": 0.2,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.x1=0;a.x2=0;a.ox=0;a.q2=0;a.y2=0;a.s=0;a.s=0;a.y2=0;a.s=0;a.s=0;a.x1=0;a.s=0;a.x2=0;a.xx=0;a.q1=0;a.ox=0;a.q4=0;a.vx=0;",
        "frame_eqs_str": "a.x1=.5;a.x2=.5+a.ox+.3*Math.sin(a.q2);a.y2=.78;a.s=.5;a.y=(1-a.s)*a.y2+a.s-.16;a.x=a.s*a.x1+(1-a.s)*a.x2+.12;a.xx=a.q1;a.ox=.2*(a.q4-.5);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "additive": 1,
          "thickoutline": 1,
          "textured": 1,
          "y": 0.4,
          "rad": 2.20775,
          "tex_zoom": 0.35528,
          "g": 1,
          "b": 1,
          "r2": 1,
          "b2": 1,
          "a2": 1,
          "border_a": 0.16
        },
        "init_eqs_str": "a.q4=0;a.q2=0;a.vx=0;",
        "frame_eqs_str": "a.x=.5+.2*(a.q4-.5);a.ang=a.q2;"
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 1,
          "thick": 1,
          "scaling": 2.44415,
          "smoothing": 0,
          "r": 0.5,
          "g": 0.4,
          "b": 0.14
        },
        "init_eqs_str": "a.d=0;a.xx=0;a.x1=0;a.q1=0;a.t8=0;a.q11=0;a.q10=0;a.q4=0;a.x2=0;a.y2=0;a.q2=0;a.ox=0;a.t2=0;a.t3=0;a.t4=0;a.cl=0;",
        "frame_eqs_str": "a.t8=1;",
        "point_eqs_str": "a.t8=-a.t8;a.x1=.5;a.x2=.5+a.ox+.3*Math.sin(a.q2);a.y2=.79;a.d=a.t8*(.01*a.sample+.03);a.y=(1-a.sample)*a.y2+a.sample+a.d*(a.x2-a.x1)-.03;a.x=a.sample*a.x1+(1-a.sample)*a.x2+a.d*(1-a.y2);a.xx=a.q1;a.ox=.2*(a.q4-.5);a.x=.5+div(a.x-.5,a.q10);a.y=.5+div(a.y-.5,a.q11);"
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.y3=0;a.y1=0;a.spx3=0;a.x1=0;a.vx3=0;a.q6=0;a.spy2=0;a.dt=0;a.spy3=0;a.q1=0;a.q5=0;a.spx2=0;a.vx4=0;a.spx4=0;a.grav=0;a.x3=0;a.q11=0;a.q10=0;a.xx2=0;a.q4=0;a.spy4=0;a.yy1=0;a.vy4=0;a.bounce=0;a.x4=0;a.x2=0;a.vy2=0;a.y2=0;a.q2=0;a.spring=0;a.vx2=0;a.q3=0;a.resist=0;a.y4=0;a.q7=0;a.vy3=0;a.xx1=0;a.q8=0;a.x1=.9;a.y1=.5;a.x2=.5;a.y2=.5;a.x3=.5;a.y3=.5;a.x4=.5;a.y4=.5;",
    "frame_eqs_str": "a.decay=0;a.xx1=.9*a.xx1+.01*a.bass;a.xx2=.9*a.xx2+.01*a.treb;a.yy1=.94*a.yy1+.0075*(a.treb+a.bass);a.x1=.5+3*(a.xx1-a.xx2);a.y1=1-.75*a.yy1;a.spring=20;a.grav=.65-.25*a.yy1;a.resist=.03;a.bounce=1;a.dt=.0005;a.spx2=(a.x1+a.x3-2*a.x2)*a.spring;a.spy2=(a.y1+a.y3-2*a.y2)*a.spring;a.spx3=(a.x2+a.x4-2*a.x3)*a.spring;a.spy3=(a.y2+a.y4-2*a.y3)*a.spring;a.spx4=(a.x3-a.x4)*a.spring;a.spy4=(a.y3-a.y4)*a.spring;a.vx2=a.vx2*(1-a.resist)+a.dt*a.spx2;a.vy2=a.vy2*(1-a.resist)+a.dt*(a.spy2-\na.grav);a.vx3=a.vx3*(1-a.resist)+a.dt*a.spx3;a.vy3=a.vy3*(1-a.resist)+a.dt*(a.spy3-1.5*a.grav);a.vx4=a.vx4*(1-a.resist)+a.dt*a.spx4;a.vy4=a.vy4*(1-a.resist)+a.dt*(a.spy4-4*a.grav);a.x2+=a.vx2;a.y2+=a.vy2;a.x3+=a.vx3;a.y3+=a.vy3;a.x4+=a.vx4;a.y4+=a.vy4;a.vx2=.00001<Math.abs(above(a.x2,0))?a.vx2:Math.abs(a.vx2)*a.bounce;a.vx2=.00001<Math.abs(below(a.x2,1))?a.vx2:-Math.abs(a.vx2)*a.bounce;a.vx3=.00001<Math.abs(above(a.x3,0))?a.vx3:Math.abs(a.vx3)*a.bounce;a.vx3=.00001<Math.abs(below(a.x3,1))?a.vx3:-Math.abs(a.vx3)*\na.bounce;a.vx4=.00001<Math.abs(above(a.x4,0))?a.vx4:Math.abs(a.vx4)*a.bounce;a.vx4=.00001<Math.abs(below(a.x4,1))?a.vx4:-Math.abs(a.vx4)*a.bounce;a.vy2=.00001<Math.abs(above(a.y2,0))?a.vy2:Math.abs(a.vy2)*a.bounce;a.vy2=.00001<Math.abs(below(a.y2,1))?a.vy2:-Math.abs(a.vy2)*a.bounce;a.vy3=.00001<Math.abs(above(a.y3,0))?a.vy3:Math.abs(a.vy3)*a.bounce;a.vy3=.00001<Math.abs(below(a.y3,1))?a.vy3:-Math.abs(a.vy3)*a.bounce;a.vy4=.00001<Math.abs(above(a.y4,0))?a.vy4:Math.abs(a.vy4)*a.bounce;a.vy4=.00001<\nMath.abs(below(a.y4,1))?a.vy4:-Math.abs(a.vy4)*a.bounce;a.q1=a.x1;a.q2=a.x2;a.q3=a.x3;a.q4=a.x4;a.q5=a.y1;a.q6=a.y2;a.q7=a.y3;a.q8=a.y4;a.q2=.2*Math.sin(Math.atan2(a.x4-a.x3,a.y4-a.y3)-2*Math.asin(1));a.monitor=a.q2;a.zoom=1;a.q10=a.aspectx;a.q11=a.aspecty;a.wave_a=0;",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": "",
    "comp": ""
  },
  "Flexi + Martin - astral projection": {
    "baseVals": {
      "rating": 4,
      "gammaadj": 1,
      "decay": 0.9,
      "echo_zoom": 1,
      "wave_brighten": 0,
      "wrap": 0,
      "wave_a": 0.001,
      "wave_scale": 5.715,
      "wave_smoothing": 0.9,
      "modwavealphastart": 1,
      "modwavealphaend": 1,
      "warpanimspeed": 0.162,
      "warpscale": 5.582,
      "zoomexp": 0.32104,
      "zoom": 0.9901,
      "warp": 0.11563,
      "wave_r": 0,
      "wave_g": 0,
      "wave_b": 0,
      "ob_size": 0,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "ib_a": 1,
      "mv_x": 64,
      "mv_y": 48,
      "mv_l": 0,
      "mv_b": 0,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "thickoutline": 1,
          "textured": 1,
          "rad": 0.05343,
          "tex_zoom": 12.77228,
          "g": 1,
          "b": 1,
          "a": 0,
          "r2": 1,
          "b2": 1,
          "a2": 1,
          "border_g": 0,
          "border_a": 0
        },
        "init_eqs_str": "a.vx=0;a.vy=0;",
        "frame_eqs_str": ""
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "textured": 1,
          "y": 0.75,
          "rad": 0.46753,
          "g": 1,
          "b": 1,
          "r2": 1,
          "b2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.w=0;a.q1=0;",
        "frame_eqs_str": "a.w=4*-Math.atan2(.5,a.q1)+4*Math.asin(1);a.ang=a.w;a.x=.5+.19*Math.sin(a.w);a.y=.5+.26*Math.cos(a.w);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "textured": 1,
          "y": 0.75,
          "rad": 0.46753,
          "g": 1,
          "b": 1,
          "r2": 1,
          "b2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.w=0;a.q1=0;",
        "frame_eqs_str": "a.w=4*-Math.atan2(.5,a.q1)+4*Math.asin(1)+div(2*Math.asin(1),3);a.ang=a.w;a.x=.5+.19*Math.sin(a.w);a.y=.5+.26*Math.cos(a.w);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 100,
          "textured": 1,
          "y": 0.75,
          "rad": 0.46753,
          "g": 1,
          "b": 1,
          "r2": 1,
          "b2": 1,
          "border_a": 0
        },
        "init_eqs_str": "a.w=0;a.q1=0;",
        "frame_eqs_str": "a.w=4*-Math.atan2(.5,a.q1)+4*Math.asin(1)-div(2*Math.asin(1),3);a.ang=a.w;a.x=.5+.19*Math.sin(a.w);a.y=.5+.26*Math.cos(a.w);"
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 1,
          "usedots": 1,
          "thick": 1,
          "additive": 1,
          "scaling": 2.44415,
          "smoothing": 0
        },
        "init_eqs_str": "a.d=0;a.n=0;a.y1=0;a.xx=0;a.z=0;a.w=0;a.t5=0;a.t1=0;a.x1=0;a.cl3=0;a.j3=0;a.cl2=0;a.zoom=0;a.j=0;a.cl1=0;a.t8=0;a.v=0;a.t3=0;a.t6=0;a.pi3=0;a.t7=0;a.c2=0;a.j2=0;a.s3=0;a.t=0;a.k=0;a.zz=0;a.c3=0;a.t2=0;a.bb=0;a.s1=0;a.s2=0;a.t4=0;a.yy=0;a.c=0;a.c1=0;a.t2=0;a.t3=0;a.t4=0;a.cl=0;",
        "frame_eqs_str": "a.t1=0;a.v=.01;a.j+=.01*a.bass;a.j2+=.01*a.mid_att;a.j3+=.01*a.treb_att;a.t2=a.j;a.t3=a.j2;a.t4=a.j3;a.k=.99*a.k+div(10*a.mid,a.fps);a.t5=-a.k;a.cl1=a.cl1-.0005-.003*a.bass;a.cl1=.00001<Math.abs(above(a.cl1,1))?0:a.cl1;a.cl1=.00001<Math.abs(below(a.cl1,0))?1:a.cl1;a.t8=a.cl1;a.cl2=a.cl2+.0001+.001*a.mid-.0005*a.bass-.0005*a.treb;a.cl2=.00001<Math.abs(above(a.cl2,1))?0:a.cl2;a.cl2=.00001<Math.abs(below(a.cl2,0))?1:a.cl2;a.t7=a.cl2;a.cl3=a.cl3+.0001+.001*a.treb-.0005*a.bass-.0005*\na.mid;a.cl3=.00001<Math.abs(above(a.cl3,1))?0:a.cl3;a.cl3=.00001<Math.abs(below(a.cl3,0))?1:a.cl3;a.t6=a.cl3;",
        "point_eqs_str": "a.xx=div(mod(983624912364*a.sample,1E7)+100,1E7);a.yy=div(mod(1896575575*a.xx,1E7)+100,1E7);a.zz=div(mod(58652340875*a.yy,1E7)+100,1E7);a.d=sqrt(sqr(a.xx)+sqr(a.yy)+sqr(a.zz));a.zz=a.zz+a.t8-(.00001<Math.abs(above(a.zz+a.t8,1))?1:0)-.5;a.xx=a.xx+a.t7-(.00001<Math.abs(above(a.xx+a.t7,1))?1:0)-.5;a.yy=a.yy+a.t6-(.00001<Math.abs(above(a.yy+a.t6,1))?1:0)-.5;a.v=.001;a.w=1;a.bb=a.d*a.d*.5;a.n=.3;a.s1=Math.sin(Math.sin(a.t2*a.w+a.bb)*a.n);a.s2=Math.sin(Math.sin(a.t3*a.w+a.bb)*a.n);\na.s3=Math.sin(Math.sin(a.t4*a.w+a.bb)*a.n);a.c1=Math.cos(Math.sin(a.t2*a.w+a.bb)*a.n);a.c2=Math.cos(Math.sin(a.t3*a.w+a.bb)*a.n);a.c3=Math.cos(Math.sin(a.t4*a.w+a.bb)*a.n);a.z=(a.c3*a.s1*a.c2+a.s3*a.s2)*a.xx-(a.c3*a.s1*a.s2-a.s3*a.c2)*a.yy+a.c3*a.c1*a.zz;a.x1=a.c1*a.c2*a.xx+a.c1*a.s2*a.yy-a.s1*a.zz;a.y1=(a.s3*a.s1*a.c2-a.c3*a.s2)*a.xx+(a.s3*a.s1*a.s2+a.c3*a.c2)*a.yy+a.s3*a.c1*a.zz;a.zoom=.5*div(1,a.z+.5);a.x=.5+a.zoom*a.x1+0*Math.sin(.1*a.time);a.y=.5+a.zoom*a.y1+0*Math.cos(.16801*a.time);a.pi3=2.0941239;\na.t=2*a.z+1*a.t2;a.c=3;a.r=Math.sin(a.t)*a.c;a.g=Math.sin(a.t+a.pi3)*a.c;a.b=Math.sin(a.t-a.pi3)*a.c;a.r=.00001<Math.abs(above(a.r,1))?1:a.r;a.r=.00001<Math.abs(below(a.r,0))?0:a.r;a.g=.00001<Math.abs(above(a.g,1))?1:a.g;a.g=.00001<Math.abs(below(a.g,0))?0:a.g;a.b=.00001<Math.abs(above(a.b,1))?1:a.b;a.b=.00001<Math.abs(below(a.b,0))?0:a.b;a.a=-a.z+.7;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "thick": 1,
          "scaling": 2.44415,
          "smoothing": 0,
          "a": 0.05
        },
        "init_eqs_str": "a.t8=0;a.q1=0;a.pi3=0;a.t=0;a.q4=0;a.q6=0;a.c=0;a.t2=0;a.t3=0;a.t4=0;a.cl=0;",
        "frame_eqs_str": "a.t8=1;",
        "point_eqs_str": "a.t8=-a.t8;a.y=.48*a.sample;a.x=.5+.04*a.t8-a.t8*a.sample*.02+(sqr(2*a.sample-1)-1)*a.q1*.5;a.pi3=2.0941239;a.t=10*-(a.q4-a.q6)+a.sample*Math.asin(1)*4.01;a.c=9;a.r=Math.sin(a.t)*a.c;a.g=Math.sin(a.t+a.pi3)*a.c;a.b=Math.sin(a.t-a.pi3)*a.c;a.r=.00001<Math.abs(above(a.r,1))?1:a.r;a.r=.00001<Math.abs(below(a.r,0))?0:a.r;a.g=.00001<Math.abs(above(a.g,1))?1:a.g;a.g=.00001<Math.abs(below(a.g,0))?0:a.g;a.b=.00001<Math.abs(above(a.b,1))?1:a.b;a.b=.00001<Math.abs(below(a.b,0))?0:a.b;\n"
      },
      {
        "baseVals": {
          "enabled": 1,
          "samples": 49,
          "scaling": 2.44415,
          "smoothing": 0,
          "r": 0,
          "g": 0,
          "b": 0
        },
        "init_eqs_str": "a.t8=0;a.q1=0;a.t2=0;a.t3=0;a.t4=0;a.cl=0;",
        "frame_eqs_str": "a.t8=1;",
        "point_eqs_str": "a.t8=-1;a.y=.48*a.sample;a.x=.5+.04*a.t8-a.t8*a.sample*.02+(sqr(2*a.sample-1)-1)*a.q1*.5;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "samples": 49,
          "scaling": 2.44415,
          "smoothing": 0,
          "r": 0,
          "g": 0,
          "b": 0
        },
        "init_eqs_str": "a.t8=0;a.q1=0;a.t2=0;a.t3=0;a.t4=0;a.cl=0;",
        "frame_eqs_str": "a.t8=1;",
        "point_eqs_str": "a.t8=1;a.y=.48*a.sample;a.x=.5+.04*a.t8-a.t8*a.sample*.02+(sqr(2*a.sample-1)-1)*a.q1*.5;"
      }
    ],
    "init_eqs_str": "a.d=0;a.vt=0;a.q6=0;a.q1=0;a.q5=0;a.vb=0;a.q9=0;a.v=0;a.mm=0;a.tt=0;a.q4=0;a.bb=0;a.q2=0;a.q3=0;a.vvm=0;a.vvb=0;a.vm=0;a.vvt=0;a.x1=0;a.y1=0;",
    "frame_eqs_str": "a.zoom=1;a.q1=.1*(a.bass-a.treb);a.vvb=.00001<Math.abs(below(a.vvb,0))?0:a.vvb;a.vvm=.00001<Math.abs(below(a.vvm,0))?0:a.vvm;a.vvt=.00001<Math.abs(below(a.vvt,0))?0:a.vvt;a.vb=.85*a.vb+(1-a.vb)*pow(a.bass,2)*.001;a.vvb=.95*a.vvb+(1-a.vvb)*a.vb*.2;a.vm=.85*a.vm+(1-a.vm)*pow(a.mid,2)*.01;a.vvm=.95*a.vvm+(1-a.vvm)*a.vm*.2;a.vt=.85*a.vt+(1-a.vt)*pow(a.treb,2)*.001;a.vvt=.95*a.vvt+(1-a.vvt)*a.vt*.2;a.q1=(a.vvb-a.vvt)*a.vvm;a.q2=a.vvm;a.q3=a.vvt;a.v=.2;a.d=0;a.bb=a.bb+a.vvb*a.v-a.d;\na.mm=a.mm+a.vvm*a.v-a.d;a.tt=a.tt+a.vvt*a.v-a.d;a.q4=a.bb;a.q5=a.mm;a.q6=a.tt;a.q4=.00001<Math.abs(above(Math.abs(a.q1),.02))?.99:1;a.q9=.5+.5*Math.sin(.14*a.time);",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": " shader_body { \n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  tmpvar_1.xyz = (texture (sampler_fc_main, uv) * q4).xyz;\n  ret = tmpvar_1.xyz;\n }",
    "comp": " shader_body { \n  vec2 tmpvar_1;\n  tmpvar_1.x = 0.5;\n  tmpvar_1.y = (1.0 - q9);\n  vec2 tmpvar_2;\n  tmpvar_2 = (uv_orig - tmpvar_1);\n  float tmpvar_3;\n  tmpvar_3 = (3.0 / tmpvar_2.y);\n  vec2 tmpvar_4;\n  tmpvar_4.x = ((tmpvar_2.x * tmpvar_3) * q9);\n  tmpvar_4.y = (tmpvar_3 * q9);\n  vec4 tmpvar_5;\n  tmpvar_5 = texture (sampler_main, fract(((1.0 - \n    abs(((fract(\n      ((tmpvar_2 + vec2(0.5, 1.0)) * 0.5)\n    ) * 2.0) - 1.0))\n  ) - (\n    ((texture (sampler_noise_hq, ((tmpvar_4 * 0.05) + (vec2(0.1, -0.05) * time))) - 0.5) * float(int((tmpvar_2.y > 0.0))))\n  .xy * 0.025))));\n  vec4 tmpvar_6;\n  tmpvar_6.w = 1.0;\n  tmpvar_6.xyz = (((tmpvar_5.xyz * tmpvar_5.xyz) * 1.4) - 0.04);\n  ret = tmpvar_6.xyz;\n }"
  },
  "Geiss - Cosmic Dust 2 - static noise": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1.9,
      "echo_zoom": 1.169,
      "wave_mode": 5,
      "additivewave": 1,
      "wave_dots": 1,
      "wave_a": 3.3,
      "wave_scale": 1.694,
      "wave_smoothing": 0.9,
      "warpscale": 3.138,
      "zoom": 1.053,
      "warp": 0.17963,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.8,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.decay_rate=0;a.bass_thresh=0;a.prev_beat=0;a.is_beat=0;a.dx_residual=0;a.min_att=0;a.beat=0;a.decay_to=0;a.beat_level=0;a.dy_residual=0;a.dx_residual=0;a.dy_residual=0;",
    "frame_eqs_str": "a.wave_r+=.65*(.6*Math.sin(1.437*a.time)+.4*Math.sin(.97*a.time));a.wave_g+=.65*(.6*Math.sin(1.344*a.time)+.4*Math.sin(.841*a.time));a.wave_b+=.65*(.6*Math.sin(1.251*a.time)+.4*Math.sin(1.055*a.time));a.rot+=.01*(.6*Math.sin(.381*a.time)+.4*Math.sin(.579*a.time));a.cx+=.21*(.6*Math.sin(.374*a.time)+.4*Math.sin(.294*a.time));a.cy+=.21*(.6*Math.sin(.393*a.time)+.4*Math.sin(.223*a.time));a.dx+=.01*(.6*Math.sin(.234*a.time)+.4*Math.sin(.277*a.time));a.dy+=.01*(.6*Math.sin(.284*\na.time)+.4*Math.sin(.247*a.time));a.decay-=.01*equal(mod(a.frame,6),0);a.dx+=.01*a.dx_residual;a.dy+=.01*a.dy_residual;a.bass_thresh=2*above(a.bass_att,a.bass_thresh)+(1-above(a.bass_att,a.bass_thresh))*(.96*(a.bass_thresh-1.3)+1.3);a.decay_rate=pow(.993,a.fps);a.min_att=2.5;a.decay_to=1;a.beat=div(a.bass,Math.max(a.min_att,a.bass_att));a.beat=Math.max(a.beat,div(a.mid,Math.max(a.min_att,a.mid_att)));a.beat=Math.max(a.beat,div(a.treb,Math.max(a.min_att,a.treb_att)));a.beat=Math.max(a.beat,(a.prev_beat-\na.decay_to)*a.decay_rate+a.decay_to);a.beat_level=24*(a.beat-a.prev_beat-.1);a.is_beat=above(a.beat_level,.5);a.prev_beat=a.beat;a.dx_residual=a.dx_residual*(1-a.is_beat)+a.is_beat*(.02*randint(100)-1);a.dy_residual=a.dy_residual*(1-a.is_beat)+a.is_beat*(.02*randint(100)-1);",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": " shader_body { \n  vec3 ret_1;\n  ret_1 = (texture (sampler_main, uv).xyz + ((\n    (texture (sampler_noise_lq, ((uv * texsize.xy) * texsize_noise_lq.zw)).xxx * 2.0)\n   - 1.0) * 0.05));\n  ret_1 = (ret_1 * 0.97);\n  vec4 tmpvar_2;\n  tmpvar_2.w = 1.0;\n  tmpvar_2.xyz = ret_1;\n  ret = tmpvar_2.xyz;\n }",
    "comp": " shader_body { \n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  tmpvar_1.xyz = (texture (sampler_main, uv).xyz * 1.333);\n  ret = tmpvar_1.xyz;\n }"
  },
  "Geiss - Cosmic Dust 2 - Trails 7": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1.9,
      "echo_zoom": 1.16936,
      "wave_mode": 7,
      "modwavealphabyvolume": 1,
      "wave_brighten": 0,
      "wave_a": 1.0029,
      "wave_scale": 2.911018,
      "wave_smoothing": 0.9,
      "modwavealphastart": 1.15,
      "modwavealphaend": 1.469999,
      "warpscale": 3.138,
      "zoom": 1.063,
      "dy": -0.005,
      "warp": 0.000536,
      "wave_r": 0.83,
      "wave_g": 0.8,
      "wave_b": 0.8,
      "wave_y": 0.35,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.dx_residual=0;a.dy_residual=0;a.bass_thresh=0;a.q1=0;a.q2=0;a.q3=0;a.q4=0;",
    "frame_eqs_str": "a.wave_r+=.65*(.6*Math.sin(1.437*a.time)+.4*Math.sin(.97*a.time));a.wave_g+=.65*(.6*Math.sin(1.344*a.time)+.4*Math.sin(.841*a.time));a.wave_b+=.65*(.6*Math.sin(1.251*a.time)+.4*Math.sin(1.055*a.time));a.rot+=.01*(.6*Math.sin(.381*a.time)+.4*Math.sin(.579*a.time));a.cx+=.21*(.6*Math.sin(.374*a.time)+.4*Math.sin(.294*a.time));a.cy+=.21*(.6*Math.sin(.393*a.time)+.4*Math.sin(.223*a.time));a.dx+=.01*(.6*Math.sin(.234*a.time)+.4*Math.sin(.277*a.time));a.dy+=.01*(.6*Math.sin(.284*\na.time)+.4*Math.sin(.247*a.time));a.decay-=.01*equal(mod(a.frame,6),0);a.dx+=a.dx_residual;a.dy+=a.dy_residual;a.bass_thresh=2*above(a.bass_att,a.bass_thresh)+(1-above(a.bass_att,a.bass_thresh))*(.96*(a.bass_thresh-1.3)+1.3);a.dx_residual=.9*(.016*equal(a.bass_thresh,2.13)*Math.sin(7*a.time)+(1-equal(a.bass_thresh,2.13))*a.dx_residual);a.dy_residual=.9*(.012*equal(a.bass_thresh,2.13)*Math.sin(9*a.time)+(1-equal(a.bass_thresh,2.13))*a.dy_residual);a.wave_x-=7*a.dx_residual;a.wave_y-=7*a.dy_residual;\na.zoom+=.04*Math.cos(.513*a.time+2);a.q1=.12*Math.cos(.479*a.time+1);a.q2=.52*Math.cos(.359*a.time+2);a.q3=.52*Math.cos(.27*a.time+6);a.q4=.12*Math.cos(.394*a.time+1);",
    "pixel_eqs_str": "",
    "pixel_eqs": "",
    "warp": " shader_body { \n  vec2 uv_1;\n  vec2 tmpvar_2;\n  tmpvar_2 = (uv - 0.5);\n  uv_1 = (tmpvar_2 * ((1.0 + \n    (q1 * tmpvar_2.y)\n  ) + (q2 * tmpvar_2.x)));\n  uv_1 = (uv_1 + 0.5);\n  vec4 tmpvar_3;\n  tmpvar_3 = texture (sampler_main, uv_1);\n  uv_1 = (tmpvar_2 * ((1.0 + \n    (q3 * tmpvar_2.y)\n  ) + (q4 * tmpvar_2.x)));\n  uv_1 = (uv_1 + 0.5);\n  vec4 tmpvar_4;\n  tmpvar_4.w = 1.0;\n  tmpvar_4.xyz = ((max (tmpvar_3.xyz, texture (sampler_main, uv_1).xyz) - 0.004) * 0.97);\n  ret = tmpvar_4.xyz;\n }",
    "comp": " shader_body { \n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  tmpvar_1.xyz = (pow (texture (sampler_main, uv).xyz, vec3(0.7, 1.1, 1.5)) * 1.333);\n  ret = tmpvar_1.xyz;\n }"
  },
  "Telek - Slow Thing (Spiderman Mix)": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1.28,
      "decay": 1,
      "echo_zoom": 1.356739,
      "wave_thick": 1,
      "modwavealphabyvolume": 1,
      "wave_brighten": 0,
      "wave_a": 0.209289,
      "wave_scale": 1.486134,
      "wave_smoothing": 0,
      "wave_mystery": -0.3,
      "modwavealphastart": 0.71,
      "modwavealphaend": 1.3,
      "warpanimspeed": 24.831774,
      "warpscale": 0.419995,
      "zoom": 0.999514,
      "warp": 55.044964,
      "wave_r": 0,
      "wave_g": 0,
      "wave_b": 0,
      "wave_y": 0.33,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "ib_a": 1,
      "mv_x": 33.152,
      "mv_y": 28.799997,
      "mv_dx": 0.006,
      "mv_l": 1,
      "mv_r": 0.2,
      "mv_g": 0,
      "mv_b": 0,
      "mv_a": 0.6
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.near=0;a.q1=0;a.q2=0;a.notnear=0;",
    "frame_eqs_str": "a.warp=0;a.wave_b=.00001<Math.abs(below(a.treb,1.8))?1-.025*randint(10):0;a.wave_g*=sqr(.01*randint(100));a.decay=1+0*(.00001<Math.abs(equal(mod(a.frame,10),0))?.95:1);a.monitor=a.wave_g;a.cx=.5+.3*Math.cos(.21*a.time);a.cy=.5+.3*Math.sin(.1*a.time);a.cx+=.1*(a.bass-1.2);a.cy+=.1*(a.treb_att-1);a.mv_r=.4*a.bass_att;a.wave_x=a.cx;a.wave_y=1-a.cy;a.q1=a.cx;a.q2=a.cy;",
    "pixel_eqs_str": "a.near=below(sqr(a.q1-a.x)+sqr(a.q2-a.y),.04);a.notnear=1-a.near;a.sy=Math.max(.3,pow(a.bass_att,.2))*a.near+a.notnear;a.sx=div(1,a.sy)*a.near+a.notnear;a.rot=.02*Math.sin(5*a.x+a.time)*a.notnear-.03;a.zoom=1+.001*a.notnear*(.5+Math.sin(5*a.ang+a.time));",
    "warp": "",
    "comp": ""
  },
  "Tripgnosis - Negative Photon Burn": {
    "baseVals": {
      "rating": 2,
      "gammaadj": 1,
      "decay": 0.906,
      "echo_zoom": 2.003,
      "echo_alpha": 0.5,
      "echo_orient": 3,
      "wave_mode": 5,
      "additivewave": 1,
      "modwavealphabyvolume": 1,
      "wave_a": 0.1,
      "wave_scale": 1.511,
      "wave_smoothing": 0.9,
      "warpanimspeed": 0.037,
      "warpscale": 0.015,
      "warp": 0.033,
      "wave_r": 0.5,
      "wave_g": 0.4,
      "wave_b": 0.3,
      "ob_size": 0,
      "ob_r": 0.11,
      "ob_b": 0.1,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "mv_x": 3,
      "mv_y": 2,
      "mv_dx": 0.02,
      "mv_dy": -0.02,
      "mv_l": 0.15,
      "mv_r": 0.49,
      "mv_g": 0.48,
      "mv_b": 0.3,
      "mv_a": 0,
      "b2n": 0.1,
      "b3n": 0.15,
      "b1x": 0.9,
      "b2x": 0.85,
      "b3x": 0.75,
      "b1ed": 0.2
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.zm=0;a.vol=0;a.mtime=0;a.q1=0;a.gamma=0;a.mv_x=64;a.mv_y=48;a.nut=0;a.stp=0;a.stq=0;a.rtp=0;a.rtq=0;a.wvr=0;a.decay=0;a.dcsp=0;",
    "frame_eqs_str": "a.decay=.975;a.vol=.25*(a.bass+a.mid+a.treb);a.vol*=a.vol;a.mtime+=.01*a.vol;a.q1=.5*a.time;a.gamma=1+.7*Math.min(.8*a.vol,1);",
    "pixel_eqs_str": "a.zm=1;a.sx=a.zm;a.sy=a.zm;",
    "warp": " shader_body { \n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  float tmpvar_2;\n  tmpvar_2 = dot (texsize.zw, texsize.zw);\n  vec2 tmpvar_3;\n  tmpvar_3 = (uv - 0.5);\n  tmpvar_1.xyz = (max (max (texture (sampler_main, uv).xyz, texture (sampler_main, \n    ((tmpvar_3 * (1.0 - (8.0 * \n      sqrt(tmpvar_2)\n    ))) + 0.5)\n  ).xyz), texture (sampler_main, (\n    (tmpvar_3 * (1.0 + (8.0 * sqrt(tmpvar_2))))\n   + 0.5)).xyz) - 0.034);\n  ret = tmpvar_1.xyz;\n }",
    "comp": " shader_body { \n  vec3 ret_1;\n  vec4 tmpvar_2;\n  tmpvar_2 = texture (sampler_main, uv);\n  vec2 tmpvar_3;\n  tmpvar_3.x = uv.y;\n  tmpvar_3.y = abs((uv.x - 1.0));\n  vec4 tmpvar_4;\n  tmpvar_4 = texture (sampler_main, tmpvar_3);\n  ret_1 = (tmpvar_2.xyz + ((tmpvar_2.xyz * tmpvar_2.xyz) * 10.0));\n  vec3 tmpvar_5;\n  tmpvar_5 = mix ((tmpvar_4.xyz + (\n    (tmpvar_4.xyz * tmpvar_4.xyz)\n   * 10.0)), ret_1, vec3(0.5, 0.5, 0.5));\n  vec3 tmpvar_6;\n  tmpvar_6 = mix (tmpvar_5, (tmpvar_2.xyz + (\n    (tmpvar_2.xyz * tmpvar_2.xyz)\n   * \n    (5.0 * treb)\n  )), (tmpvar_5 * bass));\n  ret_1 = tmpvar_6;\n  vec4 tmpvar_7;\n  tmpvar_7.w = 1.0;\n  tmpvar_7.xyz = tmpvar_6;\n  ret = tmpvar_7.xyz;\n }"
  },
  "Unchained - Beyond The Strife Nexus": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1.560001,
      "decay": 1,
      "echo_zoom": 0.9997,
      "echo_alpha": 0.5,
      "echo_orient": 1,
      "wave_mode": 5,
      "additivewave": 1,
      "wave_dots": 1,
      "wave_thick": 1,
      "wave_brighten": 0,
      "wave_a": 25.573208,
      "wave_scale": 0.282091,
      "wave_smoothing": 0,
      "zoomexp": 0.99817,
      "zoom": 0.998137,
      "rot": 1,
      "cx": 2,
      "warp": 0.01,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0.005,
      "ob_r": 1,
      "ob_a": 0.2,
      "ib_size": 0.005,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "ib_a": 0.6,
      "mv_x": 19.199999,
      "mv_y": 14.400005,
      "mv_l": 0.85,
      "mv_r": 0.5,
      "mv_g": 0.5,
      "mv_b": 0.5,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      }
    ],
    "init_eqs_str": "a.bblock=0;a.grid=0;a.q6=0;a.snee=0;a.q1=0;a.q5=0;a.tth=0;a.tblock=0;a.bpulse=0;a.pulse=0;a.mblock=0;a.q4=0;a.snur=0;a.mpulse=0;a.mod_state=0;a.bth=0;a.mres=0;a.checkx=0;a.tpulse=0;a.tres=0;a.le=0;a.ccl=0;a.q2=0;a.bres=0;a.q3=0;a.mth=0;a.q7=0;a.checky=0;a.q8=0;",
    "frame_eqs_str": "a.warp=0;a.le=1.5+2*Math.sin(a.bass_att);a.bpulse=band(above(a.le,a.bth),above(a.le-a.bth,a.bblock));a.bblock=a.le-a.bth;a.bth=.00001<Math.abs(above(a.le,a.bth))?a.le+div(114,a.le+10)-7.407:a.bth+div(.07*a.bth,a.bth-12)+.1*below(a.bth,2.7)*(2.7-a.bth);a.bth=.00001<Math.abs(above(a.bth,6))?6:a.bth;a.bres=a.bpulse*Math.sin(a.pulse+.5*a.le)+bnot(a.bpulse)*a.bres;a.le=1.5+2*Math.sin(a.treb_att);a.tpulse=band(above(a.le,a.tth),above(a.le-a.tth,a.tblock));a.tblock=a.le-a.tth;a.tth=\n.00001<Math.abs(above(a.le,a.tth))?a.le+div(114,a.le+10)-7.407:a.tth+div(.07*a.tth,a.tth-12)+.1*below(a.tth,2.7)*(2.7-a.tth);a.tth=.00001<Math.abs(above(a.tth,6))?6:a.tth;a.tres=a.tpulse*Math.sin(a.pulse+.5*a.le)+bnot(a.tpulse)*a.tres;a.le=1.5+2*Math.sin(a.mid_att);a.mpulse=band(above(a.le,a.mth),above(a.le-a.mth,a.mblock));a.mblock=a.le-a.mth;a.mth=.00001<Math.abs(above(a.le,a.mth))?a.le+div(114,a.le+10)-7.407:a.mth+div(.07*a.mth,a.mth-12)+.1*below(a.mth,2.7)*(2.7-a.mth);a.mth=.00001<Math.abs(above(a.mth,\n6))?6:a.mth;a.mres=a.mpulse*Math.sin(a.pulse+.5*a.le)+bnot(a.mpulse)*a.mres;a.pulse=.00001<Math.abs(above(Math.abs(a.pulse),3.14))?-3.14:a.pulse+.003*(a.bth+a.mth+a.tth);a.q1=a.bres;a.q2=a.tres;a.q3=a.mres;a.q4=Math.sin(a.pulse);a.mod_state=(above(a.q1,0)+above(a.q2,0)+above(a.q3,0))*(1+above(a.q4,0));a.ccl=a.ccl+a.tpulse+a.mpulse-a.bpulse;a.q5=Math.cos(a.pulse*(.5+.1*a.mod_state));a.q6=Math.sin(a.pulse*(.5+pow(.25,a.mod_state)));a.q7=a.mod_state;a.q8=a.ccl;a.ob_r=.5+.5*Math.cos(a.q1+a.q7);a.ob_g=\n.5+.5*Math.cos(3.14*a.q2+a.q7);a.ob_b=.5+.5*Math.cos(2*a.q3+Math.sin(.0816*a.time));a.ib_size=.025+.02*a.q2;a.ob_size=.03+.02*a.q3-.002*a.q7;a.wave_r=.5+.5*Math.sin(a.q1*a.q7+2.183*a.time);a.wave_g=.5+.5*Math.sin(3*a.q2+1.211*a.time);a.wave_b=.5+.5*Math.sin(a.q3+1.541*a.time);a.wave_mystery+=Math.sin(2.18*a.time+a.q6);a.wave_x=a.wave_x+.25*Math.sin(.811*a.time+a.q1)+.1*mod(a.frame,3)*sign(a.q3);a.wave_y=a.wave_y+.25*Math.sin(.788*a.time+a.q2)+.1*mod(a.frame,2)*sign(a.q3);a.cy=.5+.5*a.q4+Math.sin(.086*\na.time);a.decay=.995+.0025*a.q3+.0025*a.q1;a.mv_a=above(a.q2,0)*(.1+.1*a.q5);a.mv_r=1-a.ob_g;a.mv_b=1-a.ob_r;a.mv_g=1-a.ob_b;",
    "pixel_eqs_str": "a.snee=bnot(above(Math.sin(a.ang)-a.x,.5)*above(a.q2,0)+above(a.y-Math.cos(a.ang),.5)*above(a.q1,0));a.snur=bnot(below(a.x,.5)*above(a.q3,0)+below(a.y,.5)*below(a.q7,4));a.grid=Math.sin(sigmoid(Math.sin(6.28*a.y*a.q2),Math.sin(6.28*a.x*a.q1))*(10+a.q7));a.rot=a.snee*(.00001<Math.abs(above(a.grid,0))?a.snur:bnot(a.snur));a.zoom=(1+.01*Math.sin(a.rad*a.q7+a.q5)*bnot(a.snee)*(.00001<Math.abs(a.snur)?-1:1))*(1+.03*a.q1*Math.atan(a.ang*a.q4-a.rot*a.q2));a.sx+=.001*bor(bnot(a.snee),\nbnot(a.snur))*Math.cos(3.14*a.y*a.q4);a.sy+=.001*bor(bnot(a.snee),a.snur)*Math.cos(3.14*a.x*a.q6);a.checkx=bor(above(Math.abs(a.q1),a.x)*below(Math.abs(a.q2),a.x),above(Math.abs(a.q2),a.x)*below(Math.abs(a.q1),a.x));a.checky=bor(above(Math.abs(a.q1),a.y)*below(Math.abs(a.q2),a.y),above(Math.abs(a.q2),a.y)*below(Math.abs(a.q1),a.y));a.dx=a.checkx*Math.sin(a.x*a.q3*6.29)*a.rot;a.dy=a.checky*Math.sin(a.y*a.q3*6.29)*a.rot;a.rot=.00001<Math.abs(above(a.y,.5))?.01*a.rot:a.rot*a.zoom*.005;a.dx*=Math.atan2(pow(a.ang*\na.q4,1+a.q7),a.ang*Math.sin(3.14*a.rad*a.q2));a.dy*=Math.atan2(pow(a.ang*a.q5,1+mod(a.q8,6)),a.ang*Math.sin(3.14*a.y*a.q1));",
    "warp": "",
    "comp": ""
  },
  "Unchained - Scientific Shapes 2": {
    "baseVals": {
      "rating": 0,
      "gammaadj": 1,
      "decay": 0.95,
      "echo_zoom": 0.9998,
      "echo_alpha": 0.5,
      "echo_orient": 3,
      "wave_mode": 1,
      "additivewave": 1,
      "wave_dots": 1,
      "wave_brighten": 0,
      "wave_a": 1.254574,
      "wave_scale": 0.45029,
      "wave_smoothing": 0,
      "zoomexp": 0.112222,
      "fshader": 0.4,
      "zoom": 0.693048,
      "warp": 0.01,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0.005,
      "ob_r": 1,
      "ob_a": 1,
      "ib_size": 0.005,
      "ib_r": 0,
      "ib_g": 0,
      "ib_b": 0,
      "ib_a": 0.9,
      "mv_x": 64,
      "mv_y": 48,
      "mv_l": 0.85,
      "mv_r": 0.4999,
      "mv_g": 0.4999,
      "mv_b": 0.4999,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "additive": 1,
          "textured": 1,
          "a": 0.7,
          "border_a": 1
        },
        "init_eqs_str": "a.q1=0;a.q2=0;a.q4=0;a.q8=0;",
        "frame_eqs_str": "a.x+=.3*a.q1;a.y+=.3*a.q2;a.rad=2+a.q4;a.sides=3+mod(a.q8,7);a.textured=mod(a.sides,2);"
      },
      {
        "baseVals": {
          "enabled": 1
        },
        "init_eqs_str": "a.q2=0;a.q1=0;a.q5=0;a.q7=0;",
        "frame_eqs_str": "a.x+=.2*a.q2;a.y+=.2*a.q1;a.rad=.5+.5*a.q5;a.r=.5+Math.sin(1.32*a.time);a.b=.5+Math.sin(1.11*a.time);a.g=.5+Math.sin(1.23*a.time);a.sides=3+a.q7;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "a2": 0.5,
          "border_r": 0,
          "border_g": 0,
          "border_b": 0,
          "border_a": 1
        },
        "init_eqs_str": "a.q3=0;a.q4=0;a.q5=0;a.q8=0;a.q1=0;a.q2=0;a.q3=0;",
        "frame_eqs_str": "a.x+=.3*a.q3;a.y+=.3*a.q4;a.rad=.3+.3*a.q5;a.sides=3+mod(a.q8,3);a.textured=bnot(mod(a.sides,2));a.r2=a.q1;a.g2=a.q2;a.b2=a.q3;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "a2": 0.8,
          "border_a": 1
        },
        "init_eqs_str": "a.q5=0;a.q1=0;a.q6=0;a.q8=0;a.q2=0;a.q3=0;a.q1=0;",
        "frame_eqs_str": "a.x+=.25*a.q5;a.y+=.25*a.q1;a.rad=.3+.2*a.q6;a.sides=3+mod(a.q8,5);a.r2=a.q2;a.g2=a.q3;a.b2=a.q1;"
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "init_eqs_str": "a.bblock=0;a.grid=0;a.q6=0;a.snee=0;a.q1=0;a.q5=0;a.tth=0;a.tblock=0;a.bpulse=0;a.pulse=0;a.mblock=0;a.q4=0;a.snur=0;a.mpulse=0;a.mod_state=0;a.bth=0;a.mres=0;a.tpulse=0;a.tres=0;a.le=0;a.ccl=0;a.q2=0;a.bres=0;a.q3=0;a.mth=0;a.q7=0;a.q8=0;",
    "frame_eqs_str": "a.warp=0;a.le=1.5+2*Math.sin(a.bass_att);a.bpulse=band(above(a.le,a.bth),above(a.le-a.bth,a.bblock));a.bblock=a.le-a.bth;a.bth=.00001<Math.abs(above(a.le,a.bth))?a.le+div(114,a.le+10)-7.407:a.bth+div(.07*a.bth,a.bth-12)+.1*below(a.bth,2.7)*(2.7-a.bth);a.bth=.00001<Math.abs(above(a.bth,6))?6:a.bth;a.bres=a.bpulse*Math.sin(a.pulse+.5*a.le)+bnot(a.bpulse)*a.bres;a.le=1.5+2*Math.sin(a.treb_att);a.tpulse=band(above(a.le,a.tth),above(a.le-a.tth,a.tblock));a.tblock=a.le-a.tth;a.tth=\n.00001<Math.abs(above(a.le,a.tth))?a.le+div(114,a.le+10)-7.407:a.tth+div(.07*a.tth,a.tth-12)+.1*below(a.tth,2.7)*(2.7-a.tth);a.tth=.00001<Math.abs(above(a.tth,6))?6:a.tth;a.tres=a.tpulse*Math.sin(a.pulse+.5*a.le)+bnot(a.tpulse)*a.tres;a.le=1.5+2*Math.sin(a.mid_att);a.mpulse=band(above(a.le,a.mth),above(a.le-a.mth,a.mblock));a.mblock=a.le-a.mth;a.mth=.00001<Math.abs(above(a.le,a.mth))?a.le+div(114,a.le+10)-7.407:a.mth+div(.07*a.mth,a.mth-12)+.1*below(a.mth,2.7)*(2.7-a.mth);a.mth=.00001<Math.abs(above(a.mth,\n6))?6:a.mth;a.mres=a.mpulse*Math.sin(a.pulse+.5*a.le)+bnot(a.mpulse)*a.mres;a.pulse=.00001<Math.abs(above(Math.abs(a.pulse),3.14))?-3.14:a.pulse+.003*(a.bth+a.mth+a.tth);a.q1=a.bres;a.q2=a.tres;a.q3=a.mres;a.q4=Math.sin(a.pulse);a.mod_state=(above(a.q1,0)+above(a.q2,0)+above(a.q3,0))*(1+above(a.q4,0));a.ccl=a.ccl+a.tpulse+a.mpulse-a.bpulse;a.q5=Math.cos(a.pulse*(.5+.1*a.mod_state));a.q6=Math.sin(a.pulse*(.5+pow(.25,a.mod_state)));a.q7=a.mod_state;a.q8=a.ccl;a.ob_r=.5+.5*Math.cos(a.q1+a.q7);a.ob_g=\n.5+.5*Math.cos(3.14*a.q2+a.q7);a.ob_b=.5+.5*Math.cos(2*a.q3+Math.sin(.0816*a.time));a.ib_size=.025+.02*a.q2;a.ob_size=.03+.02*a.q3-.002*a.q7;a.wave_r=.5+.5*Math.sin(a.q1*a.q7+2.183*a.time);a.wave_g=.5+.5*Math.sin(3*a.q2+1.211*a.time);a.wave_b=.5+.5*Math.sin(a.q3+1.541*a.time);a.ob_a=.8+.2*a.q2;a.zoom+=.04*a.q4;",
    "pixel_eqs_str": "a.snee=bnot(above(Math.sin(a.ang)-a.x,.5)*above(a.q2,0)+above(a.y-Math.cos(a.ang),.5)*above(a.q1,0));a.snur=bnot(below(a.x,.5)*above(a.q3,0)+below(a.y,.5)*below(a.q7,4));a.grid=Math.sin(sigmoid(Math.sin(6.28*a.y*a.q2),Math.sin(6.28*a.x*a.q6))*(10+a.q7));a.rot=bnot(above(a.x,.5)+mod(a.y*a.q8,a.q7))*Math.cos(a.rad+3.14*(.00001<Math.abs(above(a.grid,0))?a.snur:bnot(a.snur))*(.5+.5*Math.sin(3.14*a.rad*a.q1)))*a.q4;a.zoom+=.1*Math.sin(3.14*a.rad*a.q2+a.q5)*sign(a.snee);a.rot=.00001<\nMath.abs(a.rot)?a.rot*sign(a.snur):a.q6;a.cx=.00001<Math.abs(below(a.x,.5)*below(a.y,.5))?.5+.2*a.q1:.5;a.cy=.00001<Math.abs(below(a.x,.5)*below(a.y,.5))?.5+.2*a.q3:.5;",
    "warp": "",
    "comp": ""
  },
  "Unchained & Rovastar - Xen Traffic": {
    "baseVals": {
      "rating": 5,
      "gammaadj": 1,
      "decay": 0.975,
      "echo_zoom": 0.999993,
      "echo_alpha": 0.5,
      "echo_orient": 3,
      "wave_brighten": 0,
      "wrap": 0,
      "wave_a": 1.741913,
      "wave_scale": 0.502368,
      "wave_smoothing": 0.36,
      "wave_mystery": -0.28,
      "zoom": 0.942044,
      "wave_r": 0,
      "wave_g": 0,
      "wave_b": 0,
      "ob_size": 0.005,
      "ob_a": 0.92,
      "ib_size": 0.004,
      "ib_r": 0.4,
      "ib_g": 0.4,
      "ib_b": 0,
      "ib_a": 1,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      },
      {
        "baseVals": {
          "enabled": 0
        }
      }
    ],
    "waves": [
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      },
      {
        "baseVals": {},
        "init_eqs_str": "",
        "frame_eqs_str": "",
        "point_eqs_str": ""
      }
    ],
    "init_eqs_str": "a.bass_residual=0;a.old_treb_flop=0;a.treb_effect=0;a.bass_flop=0;a.grid=0;a.q1=0;a.q5=0;a.treb_flop=0;a.bass_thresh=0;a.old_bass_flop=0;a.treb_thresh=0;a.pulse=0;a.bass_changed=0;a.mid_thresh=0;a.bass_effect=0;a.q4=0;a.mid_changed=0;a.entropy=0;a.old_mid_flop=0;a.mid_residual=0;a.treb_residual=0;a.beat=0;a.chaos=0;a.mid_flop=0;a.q2=0;a.treb_changed=0;a.q3=0;a.mid_effect=0;",
    "frame_eqs_str": "a.warp=0;a.old_bass_flop=a.bass_flop;a.old_treb_flop=a.treb_flop;a.old_mid_flop=a.mid_flop;a.chaos=.9+.1*Math.sin(a.beat);a.entropy=.00001<Math.abs(bnot(a.entropy))?2:.00001<Math.abs(equal(a.pulse,-3.14))?1+randint(3):a.entropy;a.bass_thresh=2*above(a.bass_att,a.bass_thresh)+(1-above(a.bass_att,a.bass_thresh))*((a.bass_thresh-1.3)*a.chaos+1.3);a.bass_flop=Math.abs(a.bass_flop-equal(a.bass_thresh,2));a.treb_thresh=2*above(a.treb_att,a.treb_thresh)+(1-above(a.treb_att,a.treb_thresh))*\n((a.treb_thresh-1.3)*a.chaos+1.3);a.treb_flop=Math.abs(a.treb_flop-equal(a.treb_thresh,2));a.mid_thresh=2*above(a.mid_att,a.mid_thresh)+(1-above(a.mid_att,a.mid_thresh))*((a.mid_thresh-1.3)*a.chaos+1.3);a.mid_flop=Math.abs(a.mid_flop-equal(a.mid_thresh,2));a.bass_changed=bnot(equal(a.old_bass_flop,a.bass_flop));a.mid_changed=bnot(equal(a.old_mid_flop,a.mid_flop));a.treb_changed=bnot(equal(a.old_treb_flop,a.treb_flop));a.bass_residual=a.bass_changed*Math.sin(.1*a.pulse*a.entropy)+bnot(a.bass_changed)*\na.bass_residual;a.treb_residual=a.treb_changed*Math.sin(.1*a.pulse*a.entropy)+bnot(a.treb_changed)*a.treb_residual;a.mid_residual=a.mid_changed*Math.sin(.1*a.pulse*a.entropy)+bnot(a.mid_changed)*a.mid_residual;a.pulse=.00001<Math.abs(above(Math.abs(a.pulse),3.14))?-3.14:a.pulse+.052*(a.bass_thresh+a.mid_thresh+a.treb_thresh);a.beat=.00001<Math.abs(above(Math.abs(a.beat),3.14))?-3.14:a.beat+.01*(a.bass+a.treb+a.mid);a.q1=a.mid_residual;a.q2=a.bass_residual;a.q3=a.treb_residual;a.q4=Math.sin(a.pulse);\na.q5=Math.sin(a.beat);a.mv_r+=.5*a.bass_residual;a.mv_g+=.5*a.mid_residual;a.mv_b+=.5*a.treb_residual;a.mv_a=1.1-(a.ob_a+a.ib_a)*a.chaos*.5;a.mv_x=Math.abs(10*a.beat)*a.entropy;a.mv_y=Math.abs(10*a.pulse)*a.entropy;a.mv_l=a.entropy*(a.q4-a.q5);a.wave_r=.8+.2*a.bass_flop*a.mv_g;a.wave_g=.3+.3*a.mid_flop*a.mv_b;a.wave_b=.4+.03*a.treb_flop*a.mv_r;a.ob_r=.1+.1*Math.sin(1.143*a.time)+.2*a.mv_g;a.ob_g=.3+.3*Math.sin(.897*a.time)+.3*a.mv_b;a.ob_b=.2+.5*a.mv_r;a.treb_effect=Math.max(Math.max(a.treb,a.treb_att)-\n1.2,0);a.mid_effect=Math.max(Math.max(a.mid,a.mid_att)-1.2,0);a.ib_r=1-a.ob_b;a.ib_g=1-a.mv_g;a.ib_b=.5*a.mv_b+.5*a.ob_b;a.ib_a=.00001<Math.abs(above(a.treb_effect,0))?.00001<Math.abs(above(a.mid_effect,0))?1:0:0;",
    "pixel_eqs_str": "a.bass_effect=Math.max(Math.max(a.bass,a.bass_att)-1.18,0);a.grid=mod(10*a.rad,above(a.q1,a.q4)+above(a.q2,a.q5)+above(a.q3,a.q4))+mod(10*(sqrt(2)-a.rad),above(a.q1,a.q5)+above(a.q2,a.q4)+above(a.q3,a.q5))*a.q1;a.rot=.00001<Math.abs(a.grid)?.12*Math.cos(3.14*a.rad+a.x*a.q1*3.14+a.y*a.q2*3.14)*(a.q5+a.q4):0;a.zoom=a.zoom-bnot(a.grid)*Math.atan2(a.x*a.q3*3.14,a.y*a.q5*3.14)*.14*(2*a.x-1)+.12*a.bass_effect;a.sx+=.2*a.q1*Math.sin(1.6*a.x)*-a.grid;a.sy+=.2*a.q2*Math.sin(1.6*a.y)*\n(1-a.grid);",
    "warp": "",
    "comp": ""
  },
  "yin - 250 - Artificial poles of the continuum": {
    "baseVals": {
      "rating": 5,
      "gammaadj": 1.28,
      "decay": 0.8,
      "echo_zoom": 1,
      "wave_brighten": 0,
      "wrap": 0,
      "wave_a": 0.001,
      "wave_scale": 1.001775,
      "wave_smoothing": 0.9,
      "modwavealphastart": 0.5,
      "modwavealphaend": 1,
      "warpanimspeed": 1.321288,
      "warpscale": 1.986883,
      "zoomexp": 0.8802,
      "fshader": 1,
      "zoom": 0.9998,
      "warp": 0.01,
      "sx": 0.9999,
      "sy": 0.9998,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0,
      "ob_r": 1,
      "ob_g": 1,
      "ob_b": 0.5,
      "ob_a": 1,
      "ib_size": 0,
      "ib_r": 0,
      "ib_g": 0.3,
      "ib_b": 0,
      "mv_x": 4.586357,
      "mv_y": 3.233833,
      "mv_dx": 0.12204,
      "mv_dy": 0.156041,
      "mv_l": 0.211692,
      "mv_r": 0.455835,
      "mv_g": 0.481765,
      "mv_b": 0.328534,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "sides": 60,
          "additive": 1,
          "thickoutline": 1,
          "rad": 0.398722,
          "g": 1,
          "b": 0.7,
          "r2": 1,
          "g2": 0.8,
          "border_a": 0
        },
        "init_eqs_str": "a.ax=0;a.ay=0;a.az=0;a.bx=0;a.ax=0;a.by=0;a.ay=0;a.q1=0;a.az=0;a.q1=0;a.bz=0;a.ay=0;a.q1=0;a.az=0;a.q1=0;a.ax=0;a.bx=0;a.q2=0;a.bz=0;a.q2=0;a.ay=0;a.by=0;a.az=0;a.bx=0;a.q2=0;a.bz=0;a.q2=0;a.bx=0;a.ax=0;a.q3=0;a.ay=0;a.q3=0;a.by=0;a.ax=0;a.q3=0;a.ay=0;a.q3=0;a.bz=0;a.az=0;a.vx=0;a.bx=0;a.vy=0;a.by=0;a.vz=0;a.bz=0;a.vx=0;a.vz=0;a.vy=0;a.vz=0;a.vz=0;",
        "frame_eqs_str": "a.ax=0;a.ay=0;a.az=-30;a.bx=a.ax;a.by=a.ay*Math.cos(a.q1)-a.az*Math.sin(a.q1);a.bz=a.ay*Math.sin(a.q1)+a.az*Math.cos(a.q1);a.ax=a.bx*Math.cos(a.q2)-a.bz*Math.sin(a.q2);a.ay=a.by;a.az=a.bx*Math.sin(a.q2)+a.bz*Math.cos(a.q2);a.bx=a.ax*Math.cos(a.q3)-a.ay*Math.sin(a.q3);a.by=a.ax*Math.sin(a.q3)+a.ay*Math.cos(a.q3);a.bz=a.az;a.vx=a.bx;a.vy=a.by;a.vz=a.bz;a.x=div(a.vx,Math.abs(a.vz-10))+.5;a.y=div(a.vy,Math.abs(a.vz-10))+.5;a.a=below(a.vz,0);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 60,
          "additive": 1,
          "textured": 1,
          "rad": 0.252282,
          "tex_ang": 0.69115,
          "tex_zoom": 1.500923,
          "r": 0.2,
          "g": 0.1,
          "b": 1,
          "a": 0,
          "r2": 0.04,
          "g2": 0.05,
          "b2": 0.4,
          "a2": 1,
          "border_a": 0
        },
        "init_eqs_str": "",
        "frame_eqs_str": ""
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 60,
          "additive": 1,
          "textured": 1,
          "rad": 1.54304,
          "tex_ang": 1.5707,
          "tex_zoom": 1.50099,
          "r": 0,
          "g": 0.5,
          "b": 0.6,
          "a": 0,
          "g2": 0,
          "a2": 0.7,
          "border_a": 0
        },
        "init_eqs_str": "",
        "frame_eqs_str": ""
      },
      {
        "baseVals": {
          "enabled": 1,
          "sides": 6,
          "additive": 1,
          "rad": 0.1149,
          "g": 1,
          "b": 0.7,
          "r2": 1,
          "g2": 0.8,
          "border_a": 0
        },
        "init_eqs_str": "a.q8=0;a.q8=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.t=0;a.an=0;a.q8=0;a.q7=0;a.t=0;a.an=0;a.t=0;a.d=0;a.q7=0;a.q8=0;a.d=0;a.d=0;a.t=0;a.q7=0;a.q7=0;a.t=0;a.q8=0;a.q8=0;",
        "frame_eqs_str": "a.q8=-a.q8+1;a.t=mod(a.frame,6)+4;a.sides=.00001<Math.abs(equal(mod(a.t,2),0))?6:60;a.r=.3*equal(a.t,4)+.1*equal(a.t,6)+.3*equal(a.t,8);a.g=.1*equal(a.t,4)+.5*equal(a.t,6)+.15*equal(a.t,8);a.b=.6*equal(a.t,4)+.3*equal(a.t,6)+0*equal(a.t,8);a.r2=.3*equal(a.t,4)+.1*equal(a.t,6)+.3*equal(a.t,8);a.g2=.1*equal(a.t,4)+.5*equal(a.t,6)+.15*equal(a.t,8);a.b2=.6*equal(a.t,4)+.3*equal(a.t,6)+0*equal(a.t,8);a.r+=equal(mod(a.t,2),1);a.g+=equal(mod(a.t,2),1);a.b+=.7*equal(mod(a.t,2),1);a.r2+=\nequal(mod(a.t,2),1);a.g2+=.8*equal(mod(a.t,2),1);a.rad=.1*equal(a.t,4)+.14*equal(a.t,5)+.14*equal(a.t,6)+.18*equal(a.t,7)+.12*equal(a.t,8)+.2*equal(a.t,9);a.an=Math.atan2(a.q8-.5,a.q7-.5);a.ang=2*equal(mod(a.t,2),0)*a.an;a.ang=.00001<Math.abs(equal(a.t,6))?-a.ang:a.ang;a.d=sqrt(sqr(a.q7-.5)+sqr(a.q8-.5));a.a=above(1-a.d,0)*sqrt(1-a.d);a.x=a.t*(.5-a.q7)*.1617+a.q7;a.y=a.t*(.5-a.q8)*.1617+a.q8;"
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 1,
          "usedots": 1,
          "additive": 1,
          "smoothing": 0
        },
        "init_eqs_str": "a.bz=0;a.bx=0;a.q1=0;a.by=0;a.ax=0;a.vx=0;a.vy=0;a.vz=0;a.ay=0;a.q2=0;a.q3=0;a.az=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.ax=5*(Math.sin(5.234+100*a.sample)+1)*Math.cos(200*6.2831*a.sample+3.14*a.sample+2.45);a.ay=5*(Math.sin(100*a.sample+.456)+1)*Math.sin(100*6.2831*a.sample+3.14*a.sample+1.12);a.az=5*(Math.sin(3.12+100*a.sample)+1)*Math.cos(1884.93*a.sample+3.14*a.sample+.95);a.bx=a.ax;a.by=a.ay*Math.cos(a.q1)-a.az*Math.sin(a.q1);a.bz=a.ay*Math.sin(a.q1)+a.az*Math.cos(a.q1);a.ax=a.bx*Math.cos(a.q2)-a.bz*Math.sin(a.q2);a.ay=a.by;a.az=a.bx*Math.sin(a.q2)+a.bz*Math.cos(a.q2);a.bx=a.ax*Math.cos(a.q3)-\na.ay*Math.sin(a.q3);a.by=a.ax*Math.sin(a.q3)+a.ay*Math.cos(a.q3);a.bz=a.az;a.vx=a.bx;a.vy=a.by;a.vz=a.bz;a.x=div(a.vx,Math.abs(a.vz-10))+.5;a.y=div(a.vy,Math.abs(a.vz-10))+.5;a.a=.05*above(a.vz,0)*a.az;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "usedots": 1,
          "additive": 1,
          "smoothing": 0
        },
        "init_eqs_str": "a.bz=0;a.bx=0;a.q1=0;a.by=0;a.ax=0;a.vx=0;a.vy=0;a.vz=0;a.ay=0;a.q2=0;a.q3=0;a.az=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.ax=5*(Math.sin(100*a.sample+1.865)+1)*Math.sin(1884.93*a.sample+3.14*a.sample);a.ay=5*(Math.sin(100*a.sample+5.23)+1)*Math.cos(200*6.2831*a.sample+3.14*a.sample+.1454);a.az=5*(Math.sin(100*a.sample+.234)+1)*Math.sin(400*6.2831*a.sample+3.14*a.sample+1.84);a.bx=a.ax;a.by=a.ay*Math.cos(a.q1)-a.az*Math.sin(a.q1);a.bz=a.ay*Math.sin(a.q1)+a.az*Math.cos(a.q1);a.ax=a.bx*Math.cos(a.q2)-a.bz*Math.sin(a.q2);a.ay=a.by;a.az=a.bx*Math.sin(a.q2)+a.bz*Math.cos(a.q2);a.bx=a.ax*Math.cos(a.q3)-\na.ay*Math.sin(a.q3);a.by=a.ax*Math.sin(a.q3)+a.ay*Math.cos(a.q3);a.bz=a.az;a.vx=a.bx;a.vy=a.by;a.vz=a.bz;a.x=div(a.vx,Math.abs(a.vz-10))+.5;a.y=div(a.vy,Math.abs(a.vz-10))+.5;a.a=.05*above(a.vz,0)*(5-Math.abs(a.az));"
      },
      {
        "baseVals": {
          "enabled": 1,
          "thick": 1,
          "additive": 1,
          "smoothing": 0,
          "g": 0.500001,
          "b": 0.100001
        },
        "init_eqs_str": "a.bz=0;a.bx=0;a.q1=0;a.by=0;a.ax=0;a.vx=0;a.vy=0;a.vz=0;a.ay=0;a.t=0;a.q2=0;a.q3=0;a.as=0;a.az=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.t=above(Math.sin(125.662*a.sample+16*a.time),0);a.ax=(1.58+1.5*a.t*Math.abs(a.value1))*Math.cos(6.2831*a.sample);a.ay=1.3*(1.58+1.5*a.t*Math.abs(a.value2))*Math.sin(6.2831*a.sample);a.az=0;a.bx=a.ax;a.by=a.ay*Math.cos(a.q1)-a.az*Math.sin(a.q1);a.bz=a.ay*Math.sin(a.q1)+a.az*Math.cos(a.q1);a.ax=a.bx*Math.cos(a.q2)-a.bz*Math.sin(a.q2);a.ay=a.by;a.az=a.bx*Math.sin(a.q2)+a.bz*Math.cos(a.q2);a.bx=a.ax*Math.cos(a.q3)-a.ay*Math.sin(a.q3);a.by=a.ax*Math.sin(a.q3)+a.ay*Math.cos(a.q3);\na.bz=a.az;a.vx=a.bx;a.vy=a.by;a.vz=a.bz;a.x=div(a.vx,Math.abs(a.vz-10))+.5;a.y=div(a.vy,Math.abs(a.vz-10))+.5;a.as=above(Math.cos(a.q3+1.57)*Math.cos(a.q2)*a.vx+Math.sin(a.q3+1.57)*Math.sin(a.q1)*a.vy+Math.sin(a.q2)*a.vz,0);a.a=a.t*(.07*(1-a.as)+a.as);"
      },
      {
        "baseVals": {
          "enabled": 1,
          "thick": 1,
          "additive": 1,
          "smoothing": 0,
          "g": 0.5,
          "b": 0.1
        },
        "init_eqs_str": "a.bz=0;a.bx=0;a.q1=0;a.by=0;a.ax=0;a.vx=0;a.vy=0;a.vz=0;a.ay=0;a.t=0;a.q2=0;a.q3=0;a.as=0;a.az=0;",
        "frame_eqs_str": "",
        "point_eqs_str": "a.t=above(Math.sin(125.662*a.sample+16*a.time),0);a.ax=(1.58+1.5*a.t*Math.abs(a.value1))*Math.cos(6.2831*a.sample);a.ay=0;a.az=1.2*(1.58+1.5*a.t*Math.abs(a.value2))*Math.sin(6.2831*a.sample);a.bx=a.ax;a.by=a.ay*Math.cos(a.q1)-a.az*Math.sin(a.q1);a.bz=a.ay*Math.sin(a.q1)+a.az*Math.cos(a.q1);a.ax=a.bx*Math.cos(a.q2)-a.bz*Math.sin(a.q2);a.ay=a.by;a.az=a.bx*Math.sin(a.q2)+a.bz*Math.cos(a.q2);a.bx=a.ax*Math.cos(a.q3)-a.ay*Math.sin(a.q3);a.by=a.ax*Math.sin(a.q3)+a.ay*Math.cos(a.q3);\na.bz=a.az;a.vx=a.bx;a.vy=a.by;a.vz=a.bz;a.x=div(a.vx,Math.abs(a.vz-10))+.5;a.y=div(a.vy,Math.abs(a.vz-10))+.5;a.as=above(Math.cos(a.q3-1.57)*Math.cos(a.q2)*a.vx+Math.sin(a.q3-1.57)*Math.sin(a.q1)*a.vy+Math.sin(a.q2)*a.vz,0);a.a=a.t*(.07*(1-a.as)+a.as);"
      }
    ],
    "init_eqs_str": "a.st=0;a.bz=0;a.bx=0;a.q=0;a.q1=0;a.by=0;a.mytime=0;a.ax=0;a.rho=0;a.vx=0;a.vy=0;a.vz=0;a.ay=0;a.theta=0;a.q2=0;a.q3=0;a.phi=0;a.q7=0;a.az=0;a.q8=0;",
    "frame_eqs_str": "a.st=.00001<Math.abs(equal(a.st,0))?a.time-131:a.st;a.mytime=a.time-a.st;a.phi=.125662*(a.mytime+4.564);a.theta=6.2831*(.03*a.mytime+1.54);a.rho=6.2831*Math.abs(Math.sin(0*a.mytime));a.q1=a.phi;a.q2=a.theta;a.q3=a.rho;a.ax=0;a.ay=0;a.az=-30;a.bx=a.ax;a.by=a.ay*Math.cos(a.q1)-a.az*Math.sin(a.q1);a.bz=a.ay*Math.sin(a.q1)+a.az*Math.cos(a.q1);a.ax=a.bx*Math.cos(a.q2)-a.bz*Math.sin(a.q2);a.ay=a.by;a.az=a.bx*Math.sin(a.q2)+a.bz*Math.cos(a.q2);a.bx=a.ax*Math.cos(a.q3)-a.ay*Math.sin(a.q3);\na.by=a.ax*Math.sin(a.q3)+a.ay*Math.cos(a.q3);a.bz=a.az;a.vx=a.bx;a.vy=a.by;a.vz=a.bz;a.q7=div(a.vx,Math.abs(a.vz-10))+.5;a.vy=-a.vy+1;a.q8=div(a.vy,Math.abs(a.vz-10))+.5;a.q7=.00001<Math.abs(1-below(a.vz,0))?-100:a.q7;a.q8=.00001<Math.abs(1-below(a.vz,0))?-100:a.q8;a.ob_size=1;a.ob_a=Math.min(div(.005,sqr(a.q7-.5)+sqr(a.q8-.5)),.8);a.monitor=a.mytime;",
    "pixel_eqs_str": "a.q=sqr(a.x-a.q7)+sqr(a.y-a.q8);a.warp=20*below(a.q,.075)*(.075-a.q);",
    "warp": "",
    "comp": ""
  },
  "Zylot - Crosshair Dimension (Light of Ages)": {
    "baseVals": {
      "rating": 0,
      "wave_mode": 7,
      "wave_a": 0.001,
      "wave_scale": 0.7419,
      "wave_smoothing": 0,
      "wave_r": 0.5,
      "wave_g": 0.5,
      "wave_b": 0.5,
      "ob_size": 0.005,
      "mv_a": 0
    },
    "shapes": [
      {
        "baseVals": {
          "enabled": 1,
          "rad": 3.971051,
          "tex_zoom": 0.291705,
          "r": 0,
          "a": 0.3,
          "g2": 0,
          "a2": 1,
          "border_r": 0,
          "border_g": 0,
          "border_b": 0,
          "border_a": 0
        },
        "init_eqs_str": "",
        "frame_eqs_str": ""
      },
      {
        "baseVals": {
          "enabled": 1,
          "additive": 1,
          "textured": 1,
          "rad": 1.527755,
          "tex_zoom": 0.408389,
          "g": 1,
          "b": 1,
          "g2": 0,
          "border_a": 0
        },
        "init_eqs_str": "a.angc=0;a.angc=0;a.angc=0;",
        "frame_eqs_str": "a.ang=a.angc;a.angc+=.01*a.treb;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "additive": 1,
          "textured": 1,
          "rad": 3.319852,
          "tex_zoom": 0.149491,
          "g": 1,
          "b": 1,
          "g2": 0,
          "border_r": 0,
          "border_g": 0,
          "border_b": 0,
          "border_a": 0
        },
        "init_eqs_str": "a.angc=0;a.angc=0;a.angc=0;a.rand100=0;",
        "frame_eqs_str": "a.ang+=a.angc;a.angc+=.01*a.bass;a.x=.45;a.y=.55;a.r2=.01*a.rand100;"
      },
      {
        "baseVals": {
          "enabled": 1,
          "additive": 1,
          "textured": 1,
          "x": 0.18,
          "y": 0.3,
          "rad": 1.558463,
          "tex_zoom": 0.197884,
          "g": 1,
          "b": 1,
          "g2": 0,
          "border_a": 0
        },
        "init_eqs_str": "a.angc=0;a.angc=0;",
        "frame_eqs_str": "a.x=.5+.1*Math.sin(a.angc);a.y=.5+.1*Math.cos(a.angc);a.r=.5+Math.sin(a.time);a.b=.5+Math.sin(.556677*a.time);a.g=.5+Math.sin(.353*a.time);"
      }
    ],
    "waves": [
      {
        "baseVals": {
          "enabled": 1
        },
        "init_eqs_str": "a.bassc=0;a.bcount=0;a.bassc=0;a.bcount=0;",
        "frame_eqs_str": "a.r=.5*a.bass;a.g=.5*a.treb;a.b=.5*a.mid;",
        "point_eqs_str": "a.x=.5+.2*Math.sin(.7454*a.time);a.x+=.0005-.001*randint(10);a.y=.5+.2*Math.cos(.455*a.time);a.y+=.0005-.01*randint(10);a.bassc=.00001<Math.abs(above(a.bcount,0))?1:0;a.bcount=.00001<Math.abs(above(a.bcount,0))?a.bcount-.00005:.00001<Math.abs(below(a.bassc,1))?.00001<Math.abs(above(a.bass,1.5))?.3:0:0;a.y-=a.bcount;"
      },
      {
        "baseVals": {
          "enabled": 1
        },
        "init_eqs_str": "a.bassc=0;a.bcount=0;",
        "frame_eqs_str": "a.r=.5*a.bass;a.g=.5*a.treb;a.b=.5*a.mid;",
        "point_eqs_str": "a.x=.5+.2*Math.sin(.7454*a.time);a.x+=.0005-.008*randint(10);a.y=.5+.2*Math.cos(.455*a.time);a.y+=.0005-.001*randint(10);a.bassc=.00001<Math.abs(above(a.bcount,0))?1:0;a.bcount=.00001<Math.abs(above(a.bcount,0))?a.bcount-.00005:.00001<Math.abs(below(a.bassc,1))?.00001<Math.abs(above(a.bass,1.5))?.2:0:0;a.x-=a.bcount;"
      },
      {
        "baseVals": {
          "enabled": 1
        },
        "init_eqs_str": "a.bassc=0;a.bcount=0;",
        "frame_eqs_str": "a.r=.5*a.bass;a.g=.5*a.treb;a.b=.5*a.mid;",
        "point_eqs_str": "a.x=.5+.2*Math.sin(.7454*a.time);a.x+=.0005+.008*randint(10);a.y=.5+.2*Math.cos(.455*a.time);a.y+=.0005-.001*randint(10);a.bassc=.00001<Math.abs(above(a.bcount,0))?1:0;a.bcount=.00001<Math.abs(above(a.bcount,0))?a.bcount-.00005:.00001<Math.abs(below(a.bassc,1))?.00001<Math.abs(above(a.bass,1.5))?.2:0:0;a.x+=a.bcount;"
      },
      {
        "baseVals": {
          "enabled": 1
        },
        "init_eqs_str": "a.bassc=0;a.bcount=0;",
        "frame_eqs_str": "a.r=.5*a.bass;a.g=.5*a.treb;a.b=.5*a.mid;",
        "point_eqs_str": "a.x=.5+.2*Math.sin(.7454*a.time);a.x+=.0005-.001*randint(10);a.y=.5+.2*Math.cos(.455*a.time);a.y-=.0005-.01*randint(10);a.bassc=.00001<Math.abs(above(a.bcount,0))?1:0;a.bcount=.00001<Math.abs(above(a.bcount,0))?a.bcount-.00005:.00001<Math.abs(below(a.bassc,1))?.00001<Math.abs(above(a.bass,1.5))?.3:0:0;a.y+=a.bcount;"
      }
    ],
    "init_eqs_str": "a.bassc=0;a.midc=0;a.q1=0;a.q2=0;a.bassc=0;a.midc=0;a.mcount=0;a.bcount=0;",
    "frame_eqs_str": "a.decay=.9;a.warp=0;a.bassc=.00001<Math.abs(above(a.bass,a.bassc))?a.bassc+.07*a.bass:a.bassc-.03;a.midc=.00001<Math.abs(above(a.mid,a.midc))?a.midc+.07*a.mid:a.midc-.03;a.q1=a.bassc;a.q2=a.midc;",
    "pixel_eqs_str": "a.zoom=pow(a.rad,2);",
    "warp": "",
    "comp": ""
  }
};

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizePreset(preset) {
    var copy = clone(preset);
    var base = copy.baseVals || {};

    if (typeof base.gammaadj === 'number') base.gammaadj = clamp(base.gammaadj, 0.85, 1.85);
    if (typeof base.decay === 'number') base.decay = clamp(base.decay, 0.72, 0.985);
    if (typeof base.wave_a === 'number' && base.wave_a > 8) base.wave_a = 8;
    if (typeof base.mv_a === 'number') base.mv_a = Math.min(base.mv_a, 0.45);

    copy.baseVals = base;
    return copy;
  }

  root.mdkButterchurnExtraPresets = {
    getPresets: function(){
      var normalized = {};
      Object.keys(presets).forEach(function(name){
        normalized[name] = normalizePreset(presets[name]);
      });
      return normalized;
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
