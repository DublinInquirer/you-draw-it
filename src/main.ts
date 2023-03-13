import { conventions } from "./utils";
import "./style.css";

var data = [
  { x: 2000, y: 415 },
  { x: 2001, y: 411 },
  { x: 2002, y: 376 },
  { x: 2003, y: 335 },
  { x: 2004, y: 374 },
  { x: 2005, y: 396 },
  { x: 2006, y: 365 },
  { x: 2007, y: 338 },
  { x: 2008, y: 279 },
  { x: 2009, y: 238 },
  { x: 2010, y: 212 },
  { x: 2011, y: 186 },
  { x: 2012, y: 163 },
  { x: 2013, y: 188 },
  { x: 2014, y: 192 },
  { x: 2015, y: 162 },
  { x: 2016, y: 182 },
  { x: 2017, y: 154 },
  { x: 2018, y: 135 },
  { x: 2019, y: 140 },
  { x: 2020, y: 147 },
  { x: 2021, y: 137 },
];

const minY = 0;
const maxY = 700;

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

c.x.domain([data[0].x, data[data.length - 1].x]);
c.y.domain([minY, maxY]);

c.xAxis.ticks(5).tickFormat((d) => d.toString());
c.yAxis.ticks(5).tickFormat((d) => d.toString());

var area = d3
  .area<{ x: number; y: number }>()
  .x((d) => c.x(d.x))
  .y0((d) => c.y(d.y))
  .y1(c.height);
var line = d3
  .area<{ x: number; y: number; defined?: boolean }>()
  .x((d) => c.x(d.x))
  .y((d) => c.y(d.y));

var clipRect = c.svg
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", c.x(data[Math.floor(data.length / 2)].x) - 2)
  .attr("height", c.height);

var correctSel = c.svg.append("g").attr("clip-path", "url(#clip)");

correctSel.append("path").attr("class", "area").attr("d", area(data));
correctSel.append("path").attr("class", "line").attr("d", line(data));
let yourDataSel = c.svg.append("path").attr("class", "your-line");

c.drawAxis();

let yourData = data
  .map(function (d) {
    return { x: d.x, y: d.y, defined: false };
  })
  .filter(function (d) {
    if (d.x == data[Math.floor(data.length / 2)].x) d.defined = true;
    return d.x >= data[Math.floor(data.length / 2)].x;
  });

var completed = false;

var drag = d3.drag<SVGGElement, any>().on("drag", function (event) {
  const pos =
    event.sourceEvent.constructor.name === "TouchEvent"
      ? getTouchEventPosition(this, event.sourceEvent)
      : d3.pointer(event);
  var x = clamp(
    data[Math.ceil(data.length / 2)].x,
    data[data.length - 1].x,
    c.x.invert(pos[0])
  );
  var y = clamp(0, c.y.domain()[1], c.y.invert(pos[1]));

  yourData.forEach(function (d) {
    if (Math.abs(d.x - x) < 0.5) {
      d.y = y;
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
    clipRect
      .transition()
      .duration(1500)
      .attr("width", c.x(data[data.length - 1].x));
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
