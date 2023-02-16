var data = [
  { year: 2000, deaths: 415 },
  { year: 2001, deaths: 411 },
  { year: 2002, deaths: 376 },
  { year: 2003, deaths: 335 },
  { year: 2004, deaths: 374 },
  { year: 2005, deaths: 396 },
  { year: 2006, deaths: 365 },
  { year: 2007, deaths: 338 },
  { year: 2008, deaths: 279 },
  { year: 2009, deaths: 238 },
  { year: 2010, deaths: 212 },
  { year: 2011, deaths: 186 },
  { year: 2012, deaths: 163 },
  { year: 2013, deaths: 188 },
  { year: 2014, deaths: 192 },
  { year: 2015, deaths: 162 },
  { year: 2016, deaths: 182 },
  { year: 2017, deaths: 154 },
  { year: 2018, deaths: 135 },
  { year: 2019, deaths: 140 },
  { year: 2020, deaths: 147 },
  { year: 2021, deaths: 137 },
];

var ƒ = d3.f;

var sel = d3.select("#graph").html("");
var c = d3.conventions({
  parentSel: sel,
  totalWidth: sel.node().offsetWidth,
  height: 400,
  margin: { left: 50, right: 50, top: 30, bottom: 30 },
});

c.svg.append("rect").at({ width: c.width, height: c.height, opacity: 0 });

c.x.domain([2000, 2021]);
c.y.domain([0, 700]);

c.xAxis.ticks(5).tickFormat(ƒ());
c.yAxis.ticks(5).tickFormat((d) => d);

var area = d3.area().x(ƒ("year", c.x)).y0(ƒ("deaths", c.y)).y1(c.height);
var line = d3.area().x(ƒ("year", c.x)).y(ƒ("deaths", c.y));

var clipRect = c.svg
  .append("clipPath#clip")
  .append("rect")
  .at({ width: c.x(2011) - 2, height: c.height });

var correctSel = c.svg.append("g").attr("clip-path", "url(#clip)");

correctSel.append("path.area").at({ d: area(data) });
correctSel.append("path.line").at({ d: line(data) });
yourDataSel = c.svg.append("path.your-line");

c.drawAxis();

yourData = data
  .map(function (d) {
    return { year: d.year, deaths: d.deaths, defined: 0 };
  })
  .filter(function (d) {
    if (d.year == 2011) d.defined = true;
    return d.year >= 2011;
  });

var completed = false;

var drag = d3.drag().on("drag", function () {
  var pos = d3.mouse(this);
  var year = clamp(2009, 2021, c.x.invert(pos[0]));
  var deaths = clamp(0, c.y.domain()[1], c.y.invert(pos[1]));

  yourData.forEach(function (d) {
    if (Math.abs(d.year - year) < 0.5) {
      d.deaths = deaths;
      d.defined = true;
    }
  });

  yourDataSel.at({ d: line.defined(ƒ("defined"))(yourData) });

  if (!completed && d3.mean(yourData, ƒ("defined")) == 1) {
    completed = true;
    clipRect.transition().duration(1500).attr("width", c.x(2021));
  }
});

c.svg.call(drag);

function clamp(a, b, c) {
  return Math.max(a, Math.min(b, c));
}
