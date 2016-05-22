/// <reference path='person.ts'/>
/// <reference path='people.ts'/>
/// <reference path='vector.ts'/>
/// <reference path='op_switch.ts'/>
/// <reference path='d/snapsvg.d.ts'/>

declare var $:any;

$(() => {
  let svg = Snap("#impactcanvas");
  let [width, height] = [$(window).width(),
                         $(window).height() - $("#impactcanvas").offset().top];

  svg.attr({width: width, height: height});

  let people = new People(width, height);

  $("select.tags").selectivity({placeholder: "Choose one or more topics..."});

  new OpSwitch(Snap("#opcanvas"), ["or", "and"]).draw((_:OpSwitchState, t:string) => {
    $("#op").val(t.toUpperCase()).change();
  });

  new OpSwitch(Snap("#switchcanvas"), ["IMPACT", "TIMELINE"], 200, 220, 80).draw((s:OpSwitchState, _:string) => {
    console.log(s);
  });

  window.onpopstate = (e:Event) => {
    // TODO: Implement.
    // Parse out op and tags.
    // Cleanse op and tags.
    // Execute: impact(op, tags);
    // Ensure correct state in OpSwitchs and tags dropdown.
  };

  $("div.tags, #op").change((e:any) => {
    let op = $("#op").val();
    let tags = $("select.tags").selectivity("value");

    e.preventDefault();
    writeState("impact", op, tags);
    impact(op, tags);
  });

  function impact(op:string, tags:Array<string>) : void {
    $.getJSON("/people", {op: op, tags: tags},
      (d:{people:Array<IPerson>}) => {
        let [w, h] = ["width", "height"].map((a) => parseInt(svg.attr(a)));

        people.clear();

        for (let p of d.people) {
          let [x, y] = [Math.random() * w, Math.random() * h];

          people.push(new Person(svg, p, new Vector(x, y)));
        }

        svg.clear();
        people.pack();
      }
    );
  }

  function timeline() : void {
    // TODO: Implement.
  }

  function writeState(tab:string, op:string, tags:Array<string>) : void {
    history.pushState(null, null, `/${tab}/${op.toLowerCase()}/${tags.join("+")}`);
  }
});
