import { conventions } from "./utils";
import "./style.css";

/* Test URL:
 * http://localhost:5173/?x=2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021&y=415,411,376,335,374,396,365,338,279,238,212,186,163,188,192,162,182,154,135,140,147,137
 */

const params = new URLSearchParams(document.location.search);

const graphTitleElement = document.getElementById("graph-title");
if (graphTitleElement) {
  graphTitleElement.innerText = params.get("title") ?? "";
}

const xAxis = params
  .get("x")
  ?.split(",")
  .map((xAxisEntry) => parseInt(xAxisEntry));
const yAxis = params
  .get("y")
  ?.split(",")
  .map((yAxisEntry) => parseFloat(yAxisEntry));

const data = (xAxis ?? []).map((xAxisEntry, index) => ({
  x: xAxisEntry,
  y: yAxis?.[index] ?? 0,
}));

const minY = 0;
const maxYParam = params.get("maxY");
const maxY = maxYParam
  ? parseFloat(maxYParam)
  : Math.max(...(yAxis ?? [])) * 1.1;

var sel = d3.select<HTMLElement, undefined>("#graph").html("");
var c = conventions({
  parentSel: sel,
  totalWidth: sel.node()!.offsetWidth,
  height: params.get("height") ? parseInt(params.get("height") ?? "200") : 200,
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
      : getMouseEventPosition(this, event.sourceEvent);
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

function getMouseEventPosition(node: SVGGElement, mouseEvent: MouseEvent) {
  const svg = node.ownerSVGElement;

  if (svg && svg.createSVGPoint) {
    const point = svg.createSVGPoint();
    (point.x = mouseEvent.clientX), (point.y = mouseEvent.clientY);
    const transformedPoint = point.matrixTransform(
      node.getScreenCTM()?.inverse()
    );
    return [transformedPoint.x, transformedPoint.y];
  }

  const rect = node.getBoundingClientRect();
  return [
    mouseEvent.clientX - rect.left - node.clientLeft,
    mouseEvent.clientY - rect.top - node.clientTop,
  ];
}
