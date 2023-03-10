import { conventions } from "./utils";
import "./style.css";

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

var sel = d3.select<HTMLElement, undefined>("#graph").html("");
var c = conventions({
  parentSel: sel,
  totalWidth: sel.node()!.offsetWidth,
  height: 400,
  margin: { left: 50, right: 50, top: 30, bottom: 30 },
});

c.svg
  .append("rect")
  .attr("width", c.width)
  .attr("height", c.height)
  .attr("opacity", 0);

c.x.domain([2000, 2021]);
c.y.domain([0, 700]);

c.xAxis.ticks(5).tickFormat((d) => d.toString());
c.yAxis.ticks(5).tickFormat((d) => d.toString());

var area = d3
  .area<{ year: number; deaths: number }>()
  .x((d) => c.x(d.year))
  .y0((d) => c.y(d.deaths))
  .y1(c.height);
var line = d3
  .area<{ year: number; deaths: number; defined?: boolean }>()
  .x((d) => c.x(d.year))
  .y((d) => c.y(d.deaths));

var clipRect = c.svg
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", c.x(2011) - 2)
  .attr("height", c.height);

var correctSel = c.svg.append("g").attr("clip-path", "url(#clip)");

correctSel.append("path").attr("class", "area").attr("d", area(data));
correctSel.append("path").attr("class", "line").attr("d", line(data));
let yourDataSel = c.svg.append("path").attr("class", "your-line");

c.drawAxis();

let yourData = data
  .map(function (d) {
    return { year: d.year, deaths: d.deaths, defined: false };
  })
  .filter(function (d) {
    if (d.year == 2011) d.defined = true;
    return d.year >= 2011;
  });

var completed = false;

var drag = d3.drag<SVGGElement, any>().on("drag", function (event) {
  const pos =
    event.sourceEvent.constructor.name === "TouchEvent"
      ? getTouchEventPosition(this, event.sourceEvent)
      : d3.pointer(event);
  var year = clamp(2009, 2021, c.x.invert(pos[0]));
  var deaths = clamp(0, c.y.domain()[1], c.y.invert(pos[1]));

  yourData.forEach(function (d) {
    if (Math.abs(d.year - year) < 0.5) {
      d.deaths = deaths;
      d.defined = true;
    }
  });

  yourDataSel.attr("d", line.defined((d) => d.defined ?? false)(yourData));

  const allYourDataPointsDefined = yourData.reduce(
    (acc, d) => acc && d.defined,
    true
  );

  if (!completed && allYourDataPointsDefined) {
    completed = true;
    clipRect.transition().duration(1500).attr("width", c.x(2021));
  }
});

c.svg.call(drag);

function clamp(a: number, b: number, c: number) {
  return Math.max(a, Math.min(b, c));
}

function getTouchEventPosition(node: SVGGElement, touchEvent: TouchEvent) {
  const touchPoint = touchEvent.changedTouches[0];

  const svg = node.ownerSVGElement;

  if (svg && svg.createSVGPoint) {
    const point = svg.createSVGPoint();
    (point.x = touchPoint.clientX), (point.y = touchPoint.clientY);
    const transformedPoint = point.matrixTransform(
      node.getScreenCTM()?.inverse()
    );
    return [transformedPoint.x, transformedPoint.y];
  }

  const rect = node.getBoundingClientRect();
  return [
    touchPoint.clientX - rect.left - node.clientLeft,
    touchPoint.clientY - rect.top - node.clientTop,
  ];
}
