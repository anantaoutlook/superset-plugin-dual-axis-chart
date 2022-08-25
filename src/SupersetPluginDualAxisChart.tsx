/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 import React, { useEffect, createRef} from 'react';
 import * as d3 from "d3";
 // import * as d3Scale from "d3-scale";
 // import { line } from 'd3-shape';
 // export * as d3Axis from 'd3-axis';
 import { SupersetPluginDualAxisChartProps } from './types';
 
 // The following Styles component is a <div> element, which has been styled using Emotion
 // For docs, visit https://emotion.sh/docs/styled
 
 // Theming variables are provided for your use via a ThemeProvider
 // imported from @superset-ui/core. For variables available, please visit
 // https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts
 
 
 /**
  * ******************* WHAT YOU CAN BUILD HERE *******************
  *  In essence, a chart is given a few key ingredients to work with:
  *  * Data: provided via `props.data`
  *  * A DOM element
  *  * FormData (your controls!) provided as props by transformProps.ts
  */
  interface ChartData {
   orgname: string,
   calculatedmetricvalue: number
 }
 
 export default function SupersetPluginDualAxisChart(props: SupersetPluginDualAxisChartProps) {
   // height and width are the height and width of the DOM element as it exists in the dashboard.
   // There is also a `data` prop, which is, of course, your DATA 🎉
   
   console.log('Plugin props', props);
   const {data} = props;
   // const rootElem = createRef<SVGSVGElement>();
   var svgRef = createRef<SVGSVGElement>();
 
   // Often, you just want to get a hold of the DOM and go nuts.
   // Here, you can do that with createRef, and the useEffect hook.
   useEffect(() => {
     renderChart(svgRef);
   }, [props]);
   
   var renderChart = (svgRef:any) => {
     const width = 900;
     const height = d3.max(data, (d:any) => d.calculatedmetricvalue * 3)!;
     
     const svg = d3.select(svgRef.current)
       .attr('width', width)
       .attr('height', height)
       .style('overflow', 'visible')
       .style('margin-top', '75px')
       .style('margin-left', '65px') 
       .style('margin-bottom', '50px')
       .style('margin-right', '50px');
 
     //setting the scaling
     const xScale = d3.scaleBand().domain(data.map((val:any, i:any) => val.orgname)).range([0, width]).padding(0.4);
     const yScale = d3.scaleLinear().domain([0, height]).range([height, 0]);
 
     const y2Scale = d3.scaleLinear().domain([0, height]).range([height, 0]);
 
     //setting line chart data
     const lineChart = d3.line<ChartData>()
       .x((d) => xScale(d.orgname)! + xScale.bandwidth()/2)
       .y((d) => d.calculatedmetricvalue ? (y2Scale(d.calculatedmetricvalue)!): 0)
       .curve(d3.curveMonotoneX);
 
     //setting the axes
     const xAxis = d3.axisBottom(xScale).ticks(data.length); 
     const yAxis = d3.axisLeft(yScale).ticks(2).tickPadding(10).tickSize(3);
 
     const y2Axis = d3.axisRight(yScale).ticks(2).tickPadding(10).tickSize(3);
 
     // create tooltip element  
     const tooltip = d3.select("body")
     .append("div")
     .attr("class","d3-tooltip")
     .style("position", "absolute")
     .style("z-index", "10")
     .style("visibility", "hidden")
     .style("padding", "15px")
     .style("background", "rgba(0,0,0,0.6)")
     .style("border-radius", "5px")
     .style("color", "#fff")
     .text("a simple tooltip");
 
     function checkEquityKey() { return data[0]['equity'] ? 'equity' : ''; }
 
     //setting the svg data
     svg.selectAll('.bar').remove();
     svg.selectAll('.bar')
       .data(data)
       .enter()
       .append('rect')
       .attr("class", "bar")
       .attr('x', (v:any,i)=> xScale(v.orgname)!)
       .attr('y', (v:any,i)=> yScale(v.calculatedmetricvalue)!)
       .attr('fill', (v,i)=> v.isactive === true ? 'blue': 'gray')
       .attr("fill-opacity", 0.8)
       .attr('width', xScale.bandwidth())
       .attr('height', (val:any) => ((height - yScale(val.calculatedmetricvalue)!)))
       .on("mouseover", function(d:any, i) {
         tooltip.html(`Calculated Metric Value: ${i.calculatedmetricvalue}
         ${i.equity ? `,\n Equity: ${i.equity}`: ''}`)
         .style("visibility", "visible");
       })
       .on("mousemove", function(event:any){
         tooltip
           .style("top", (event.pageY-10)+"px")
           .style("left",(event.pageX+10)+"px");
       })
       .on("mouseout", function() {
         tooltip.html(``).style("visibility", "hidden");
         // d3.select(this).attr("fill", bar_color);
       });
 
     //setting graph name
     /*svg.append("text")
       .attr("y", 100)
       .style("font-size", "16px")
       .text("Bar Line Chart");*/
 
     //setting line chart
     svg.selectAll('path').remove();
     if(checkEquityKey() === 'equity') {
       svg.append('path')
         .attr('d', lineChart(data))
         .attr('fill','none')
         .attr('stroke-width',1.5)
         .attr('stroke', 'black');
     }
       // Bar text and star drawing
     svg.selectAll('.barText').remove();
     svg.selectAll(".barText")
       .data(data)
       .enter()
       .append("text")
       .attr("class", "barText")
       .attr('x', (v,i) =>  i * (width/data.length) + (width/data.length - i)/2)
       .attr('y', (v:any,i) => height - (v.calculatedmetricvalue + 5))
       .style("font-size", "20px")
       .text((d:any) => {
          if (d.equity > 50 && checkEquityKey() == 'equity') {
            return '★'
          } else {
           return '';
          };
       })
       .attr("fill", (d:any) => d.equity > 50 ? "orange" : 'gray');
     // XAxis chart
     svg.selectAll('g').remove();
     svg.append('g').call(xAxis).attr('transform', `translate(0, ${height})`);
     // YAxis chart
     // svg.selectAll('g').remove();
     svg.append('g').call(yAxis);
     // Y2Axis chart
     // svg.selectAll('g').remove();
     svg.append('g').call(y2Axis).attr('transform', `translate(${width}, 0)`);
   };
   return (
     <div>
       <svg ref={svgRef}></svg>
     </div>
   );
 }
 
 
 