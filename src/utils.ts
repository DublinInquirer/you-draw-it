import { ScaleLinear } from "d3";
import { Axis, AxisDomain, AxisScale } from "d3-axis";
import { Selection } from "d3-selection";

interface BaseParams {
  margin: {
    [key: string]: number;
  };
  parentSel?: Selection<HTMLElement, undefined, HTMLElement, undefined>;
  rootsvg?: Selection<SVGSVGElement, undefined, HTMLElement, undefined>;
  svg?: Selection<SVGGElement, undefined, HTMLElement, undefined>;
  x?: ScaleLinear<number, number, never>;
  y?: ScaleLinear<number, number, never>;
  xAxis?: Axis<AxisDomain>;
  yAxis?: Axis<AxisDomain>;
}

interface BaseParamsWithWidthHeight extends BaseParams {
  width: number;
  totalWidth?: never;
  height: number;
  totalHeight?: never;
}

interface BaseParamsWithWidthTotalHeight extends BaseParams {
  width: number;
  totalWidth?: never;
  height?: never;
  totalHeight: number;
}

interface BaseParamsWithTotalWidthHeight extends BaseParams {
  width?: never;
  totalWidth: number;
  height: number;
  totalHeight?: never;
}

interface BaseParamsWithTotalWidthTotalHeight extends BaseParams {
  width?: never;
  totalWidth: number;
  height?: never;
  totalHeight: number;
}

type Params =
  | BaseParamsWithWidthHeight
  | BaseParamsWithWidthTotalHeight
  | BaseParamsWithTotalWidthHeight
  | BaseParamsWithTotalWidthTotalHeight;

export function conventions(c: Params) {
  const margin = c.margin || { top: 20, right: 20, bottom: 20, left: 20 };
  ["top", "right", "bottom", "left"].forEach(function (d) {
    if (!margin[d] && margin[d] != 0) margin[d] = 20;
  });

  const width =
    c.width || (c.totalWidth ? c.totalWidth - margin.left - margin.right : 900);
  const height =
    c.height ||
    (c.totalHeight ? c.totalHeight - margin.top - margin.bottom : 460);

  const totalWidth = width + c.margin.left + c.margin.right;
  const totalHeight = height + c.margin.top + c.margin.bottom;

  const parentSel = c.parentSel || d3.select("body");

  const rootsvg = parentSel.append("svg");

  const svg = rootsvg
    .attr("width", totalWidth)
    .attr("height", totalHeight)
    .append("g")
    .attr("transform", "translate(" + c.margin.left + "," + c.margin.top + ")");

  const x = c.x || d3.scaleLinear().range([0, width]);
  const y = c.y || d3.scaleLinear().range([height, 0]);

  const xAxis = c.xAxis || d3.axisBottom(x as AxisScale<AxisDomain>);
  const yAxis = c.yAxis || d3.axisLeft(y as AxisScale<AxisDomain>);

  const drawAxis = function () {
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + c.height + ")")
      .call(xAxis);

    svg.append("g").attr("class", "y axis").call(yAxis);
  };

  return {
    width,
    height,
    parentSel,
    rootsvg,
    svg,
    x,
    y,
    xAxis,
    yAxis,
    drawAxis,
  };
}
