class Marker {
    constructor(goem, cog, map) {
      this.goem =goem;
    }
    gf() {
      return this.feature;
    }
  }
  let m1 = new Marker([14366620.688750563, 4172772.488498304],1,1);
  let m2 = new Marker([14366620.688750563, 4172772.488498304],1,1);
  let m3 = new Marker([14366620.688750563, 4172772.488498304],1,1); 

  console.log(m1.gf===m2.gf);
  console.log(m1.goem===m2.goem);

