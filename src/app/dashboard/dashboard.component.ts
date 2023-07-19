import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

// amchart
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// material table
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['firstName', 'lastName', 'username'];

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get('http://test-demo.aemenersol.com/api/dashboard', { headers }).subscribe(
        (data: any) => {
          // Handle the API response here
          this.initializePieChart(data.chartDonut);
          this.initializeBarChart(data.chartBar);
          this.initializeTable(data.tableUsers);
        },
        (error: any) => {
          // Handle error cases
          console.error(error);
        }
      );
    } else {
      // Handle case where token is missing or not available
      console.error('Token is missing or not available');
      this.router.navigate(['/login']);
      return;
    }
  }

  signOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    return false; // Add this line to prevent the default behavior of the anchor tag
  }

  initializePieChart(data: any[]) {
    let root = am5.Root.new("chartdiv");
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    
    let chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: am5.percent(50)
    }));

    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: "Series",
        valueField: "value",
        categoryField: "name"
      })
    );
    
    series.labels.template.setAll({
      textType: "circular",
      centerX: 0,
      centerY: 0
    });

    series.data.setAll(data);
    series.appear(1000, 100);
  }

  initializeBarChart(data: any[]) {
    let root = am5.Root.new("chartdiv2");
    let chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        layout: root.verticalLayout
      }) 
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15
    });

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "name",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));
    
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })
    }));

    xAxis.data.setAll(data);

    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      sequencedInterpolation: true,
      categoryXField: "name",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));
  }

  initializeTable(data: any[]) {
    this.dataSource = new MatTableDataSource<any>(data);
  }
}
