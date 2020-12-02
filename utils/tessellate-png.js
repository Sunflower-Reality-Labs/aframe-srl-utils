var fs = require("fs"),
  PNG = require("pngjs").PNG;
const stable = require('stable');
 
fs.createReadStream("in.png")
  .pipe(
    new PNG({
      filterType: 4,
    })
  )
  .on("parsed", function () {
    console.log(this.width, this.height)


    const tesselate = (x,y,xd,yd) => {
      var idx = (this.width * y + x) << 2;
//      console.log("tesselate", x,y,xd,yd)
      if (xd == 1 && yd == 1) {
        if (this.data[idx + 3] < 200) {
          return false; // nothing needed
        }
        return true; // single pixel
      }
      const tesselater = (x,y,xd,yd) => {
        return [tesselate(x,y,xd,yd), [[x,y,xd,yd]]]
      }
      let t1, t2, m1, m2 = null;

      if (xd >= yd) {
        const m = xd >> 1;
        [t1,m1] = tesselater(x,     y, m, yd);
        [t2,m2] = tesselater(x + m, y, xd - m, yd);
      } else {
        const m = yd >> 1;
        [t1,m1] = tesselater(x, y,     xd, m);
        [t2,m2] = tesselater(x, y + m, xd, yd - m);
      }       
      if (x == 154 && y == 1) {
        console.log("found bad one",x,y,xd,yd)
        console.log(t1,m1,t2,m2)
      }


//      if (t1 == t2) return t1;
      let r = []
      if (t1 == t2) {
        return t1;
      }
      if (t1 == true) {
        r = r.concat(m1)
      } else if (t1 != false) {
        r = r.concat(t1)
      }
      if (t2 == true) {
        r = r.concat(m2)
      } else if (t2 != false) {
        r = r.concat(t2)
      }

      if (x == 154 && y == 1) {
        console.log(r)
      }
      return r;
      /*
      if (t1 == false && t2 == false) return false;
      if (t1 == true && t2 == true) {
        return [].concat(m1, m2)
      }
      if (t1 == true && t2 == false) {
        return m1;
      }
      if (t1 == false && t2 == true) {
        return m2;
      }
      return [].concat(m1, t2)
      if (t1 != false && t2 == true) {
        return [].concat(t1, m2)
      }
      if (t1 == false) return t2;
      if (t2 == false) return t1;
      return [].concat(t1,t2)
*/      
    }
     
    let tess = tesselate(0, 0, this.width, this.height);
//    console.log("tess",tess)
    tess.forEach(([x,y,xd,yd]) => {
      if (xd > 1 || yd > 1) {
//        console.log('bad tess', x,y,xd, yd)
      }
    })
//    console.log("tess",tess)

    let merges = 0;
    do {
      merges = 0;

      for(r = 0;r < 4; r++) {
        for(let i = 0; i < tess.length - 1; i++) {
          const [x0,y0,xd0,yd0] = tess[i]
          // Now, we find all the squares with x == x0 + xd0
          const match = tess.filter(([x,y,xd,yd]) => x == x0 + xd0 && y >= y0 && (y + yd) <= y0 + yd0);
          if (match.length >= 1 && match.map(([x,y,xd,yd]) => yd).reduce((a, b) => a + b,0) == yd0) {
            const shortest = match.map(([x,y,xd,yd]) => xd).reduce((x,y) => Math.min(x,y));
//            console.log("shortest", shortest, match.length, match)
            if (match.length) {
              tess[i] = [x0, y0, xd0 + shortest, yd0];
              match.forEach(([xM,yM,xdM,ydM]) => {
                tess = tess.map(([x,y,xd,yd]) => 
                  xM == x && yM == y ? [x + shortest,y,xd - shortest, yd] : [x,y,xd,yd]);
              })
              tess = tess.filter(([x,y,xd,yd]) => xd != 0);
              merges++;
            } else if (match.length > 0) {
  //            console.log(i, x0, y0, xd0, yd0, match.length);
            }
          }
        }
        tess = tess.map(([x0,y0,xd0,yd0]) => [-y0 -yd0, x0, yd0, xd0])
      }
/*

      tess = stable(tess,([x0,y0,xd0,yd0],[x1,y1,xd1,yd1]) => x0 - x1);
      tess = stable(tess,([x0,y0,xd0,yd0],[x1,y1,xd1,yd1]) => y0 - y1);
      for(let i = 0; i < tess.length - 1; i++) {
        const [x0,y0,xd0,yd0] = tess[i]
        const [x1,y1,xd1,yd1] = tess[i + 1]
//        console.log(i, x0, y0, xd0, yd0, x1,y1,xd1,yd1, y0 == y1 && x0 + xd0 == x1 && yd0 == yd1);        
        if (y0 == y1 && x0 + xd0 == x1 && yd0 == yd1) {
//          console.log(i, x0, y0, xd0, yd0, x1,y1,xd1,yd1);        
          tess[i] = null;
          tess[i+1] = [ x0, y0, xd0 + xd1, yd0 ]
          merges++;
        }
      }
      tess = tess.filter(x => x != null);

      tess = stable(tess,([x0,y0,xd0,yd0],[x1,y1,xd1,yd1]) => y0 - y1);
      tess = stable(tess,([x0,y0,xd0,yd0],[x1,y1,xd1,yd1]) => x0 - x1);
      for(let i = 0; i < tess.length - 1; i++) {
        const [x0,y0,xd0,yd0] = tess[i]
        const [x1,y1,xd1,yd1] = tess[i + 1]
        if (x0 == x1 && y0 + yd0 == y1 && xd0 == xd1) {
          tess[i] = null;
          tess[i+1] = [ x0, y0, xd0, yd0 + yd1 ]
          merges++;
        }
      }
      tess = tess.filter(x => x != null);
 */      
      console.log('merged ' + merges);
    } while(merges > 0)

    // Remove single pixels
//    tess = tess.filter(([x0,y0,xd0,yd0]) => xd0 > 1 || yd0 > 1)

// Now we turn the quads into triangles.

    let tess2 = tess
      .map(([x,y,xd,yd]) => 
          [ [x,y,x+xd,y+yd,x+xd,y]
          , [x,y,x,y+yd,x+xd,y+yd]
          ])
      .reduce((a,b) => [].concat(a,b), [])
//    console.log("tess2",tess2)

    const points = {}
    const pix = (x,y) => x + ',' + y;
    for(const [x0,y0,x1,y1,x2,y2] of tess2) {
      points[pix(x0,y0)] = null;
      points[pix(x1,y1)] = null;
      points[pix(x2,y2)] = null;
    }
    let uq = 1; // obj is 1-indexed
    for (const p in points) {
      points[p] = uq++;
    }

    const obj_file = ["#generated by tesselate-png"]

    obj_file.push("")
    obj_file.push("mtllib out.mtl");
    
    obj_file.push("")
    obj_file.push("#vertices at edges of pixels")
    for (const p in points) {
      const [x,y] = p.split(/,/)
      obj_file.push(["v", x, y, 0].join(' ', ))
    }

    obj_file.push("")
    obj_file.push("#texture coordinates")
    obj_file.push("usemtl png")

    for (const p in points) {
      const [x,y] = p.split(/,/)
      obj_file.push(["vt", x / this.width, 1 - y / this.height].join(' '))
    }

    obj_file.push("")
    obj_file.push("#single normal")
    obj_file.push("vn 0 0 1")  // might need to be -1

    obj_file.push("")
    obj_file.push("#polygons")

    const poly = (x,y) => [points[pix(x,y)], points[pix(x,y)], 1].join('/')
    for(const [x0,y0,x1,y1,x2,y2] of tess2) {
      obj_file.push(["f", poly(x0,y0), poly(x1, y1), poly(x2, y2)].join(' '))
    }

    fs.writeFile("out.obj", obj_file.join('\n'), () => {});

    const mtl_file = [];

    mtl_file.push("newmtl png")
    mtl_file.push("Ka 1.0 1.0 1.0");
    mtl_file.push("Kd 1.0 1.0 1.0");
    mtl_file.push("illum 2");
    mtl_file.push("map_Ka out.png")
    mtl_file.push("map_Kd out.png")

    fs.writeFile("out.mtl", mtl_file.join('\n'), () => {});

    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;
 
        if (this.data[idx + 3] < 0.5) {
          this.data[idx] = 255;
          this.data[idx + 1] = 0;
          this.data[idx + 2] = 0;
          this.data[idx + 3] = 255;
        }
      }
    }
    this.pack().pipe(fs.createWriteStream("out.png"));

/*    
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;
 
        // invert color
        this.data[idx] = 255 - this.data[idx];
        this.data[idx + 1] = 255 - this.data[idx + 1];
        this.data[idx + 2] = 255 - this.data[idx + 2];
 
        // and reduce opacity
        this.data[idx + 3] = this.data[idx + 3] >> 1;
      }
    }
 
/*/    
  });
