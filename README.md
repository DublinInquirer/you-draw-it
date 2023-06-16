# You Draw It

An interactive chart that lets readers guess the trend

https://github.com/DublinInquirer/you-draw-it/assets/456562/62c42b0c-6374-4a9f-b571-f7def1d454fd

## Credits

This project is heaviliy inspired by The New York Times' series of _You Draw It_ quizzes. Massive thanks to [Adam Pearce](https://twitter.com/adamrpearce) and [Benoît Furic](https://github.com/BenoitFuric) for their example code and to [Claudia Dalby](https://twitter.com/claudiadalby) for suggesting this project.

## Getting started

- `npm install`
- `npm run dev`
- Open http://localhost:5173/?x=2019,2020,2021,2022,2023&y=10,20,30,40,20 for a chart with a sample dataset.

## How it works

The chart takes data from the following parameters in the URL query string:

| Param               | Description                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `title` (optional)  | The chart title                                                                                                                |
| `x`                 | A string of comma-separated integers for the x-axis. It's intended to be used for years, for example, `x=2020,2021,2022,2023`. |
| `y`                 | A string of comma-separated integers or floats for the y-axis.                                                                 |
| `maxY` (optional)   | The max value of the y-axis. Defaults to 1.1 times the max value in the `y` param.                                             |
| `height` (optional) | The height of the chart in pixel. Defaults to 200                                                                              |

## Building

To build for production, run `npm run build`. Static files will be generated in the `dist/` directory.

## Licence

MIT
