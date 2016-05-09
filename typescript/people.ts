interface IWin {
  name: string;
  year: number;
}

interface IAchievement {
  description: string;
  source: string;
  impact: number;
  year: number;
}

interface IPerson {
  name: string;
  country: string;
  gender: string;
  impact: number;
  biography: string;
  picture: string;
  source: string;
  yob: number;
  yod: number;
  wins: Array<IWin>;
  achievements: Array<IAchievement>;
}

class Person {
  public image : Snap.Element;
  public radius : number;
  private initial_point : Vector;

  constructor(public details:IPerson, public point:Vector) {
    this.initial_point = new Vector(point.x, point.y);
  }

  public draw(svg:Snap.Paper, unit:number) : void {
    let mass = (this.details.impact * unit);

    this.radius = mass / 2.0;

    let x = this.point.x - this.radius;
    let y = this.point.y - this.radius;
    let imgsrc = "/static/images/" + this.details.picture;
    let pattern = svg.image(imgsrc, x, y, mass, mass);

    this.image = svg.circle(this.point.x, this.point.y, this.radius);
    this.image.attr({fill: pattern.pattern(x, y, mass, mass)});
    this.image.click((e:MouseEvent) => this.show());
  }

  public position(svg:Snap.Paper) : void {
    let v = Vector.sub(this.point, this.initial_point);
    this.image.transform(`translate(${v.x}, ${v.y})`);
  }

  public distanceFrom(v:Vector) : number {
    let distance = Vector.sub(v, this.point);
    let m = distance.mag();

    return m;
  }

  public detract(p:Person, padding:number) : void {
    let dist = this.distanceFrom(p.point);
    let radii = this.radius + p.radius + padding;

    if (dist < radii) {
      let mid = (c:number) => { return (c / dist) * (radii - dist) * 0.5; };
      let v = Vector.sub(p.point, this.point);
      let tv = new Vector(mid(v.x), mid(v.y));

      this.point.sub(tv);
      p.point.add(tv);
    }
  }

  public attract(svg:Snap.Paper, to:Vector, damping:number) : void {
    let v = Vector.sub(this.point, to);
    v.mul(damping);

    this.point.sub(v);
  }

  public show() : void {
    console.log(this.details.name);
  }
}

class People extends Array<Person> {
  private total:number;
  private center:Vector;

  constructor(public svg:Snap.Paper) {
    super();

    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    this.center = new Vector(width / 2.0, height / 2.0);
    this.total = 0;
  }

  private delta() : number {
    return 1 + ((this.length - 1) * 0.1);
  }

  public push(p:Person) : number {
    this.total += p.details.impact;
    return super.push(p);
  }

  public position(iteration = 1) : void {
    // Sort from closest to furthest to center point.
    this.sort((a:Person, b:Person) => {
      let c = this.center;
      return a.distanceFrom(c) - b.distanceFrom(c);
    });

    // Detract other particles.
    for (let i=0;i<this.length;i++) {
      for (let n=i+1;n<this.length;n++) {
        this[i].detract(this[n], 10);
      }
    }

    // Attract to center point.
    for (let p of this) {
      p.attract(this.svg, this.center, 0.25 / iteration);
        p.position(this.svg);
    }

    // Recrusively refine.
    if (iteration < this.length * 7) {
      setTimeout(() => {
        this.position(iteration + 1);
      }, 15);
    }
  }

  public pack() : void {
    let width = this.center.x * 2;
    let height = this.center.y * 2;
    let unit = Math.min(width / this.total, height / this.total) * this.delta();

    for (let p of this) {
      p.draw(this.svg, unit);
    }

    this.position();
  }
}
