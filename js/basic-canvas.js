var idx = {};

function draw() {
  var w = window.innerWidth - 10,
  h = window.innerHeight - 10,
  top = 0,
  dragStart = false;

  var chart = d3.select('#keystrokes-canvas').append('canvas')
      .attr('id', 'chart')
      .attr('width', w)
      .attr('class', 'Greys')
      .attr('height', h).node();
  var ctx = chart.getContext('2d');

  // tick height
  var day_format = d3.time.format('%A');
  var full_format = d3.time.format('%I:%M %p %m/%d/%y');
  var biminutes = 1440 / 2;

  d3.csv('keystrokes.log', function(csv) {
    if (!csv) {
      d3.select('#help')
      .style('display', 'block');
      return;
    }
    var total_keystrokes = 0;
    csv = csv.map(function(c) {
      var d = new Date(c.minute * 1000);
      var day = d3.time.day(d);
      total_keystrokes += parseInt(c.strokes, 10);
      return {
        d: d,
        day: day,
        strokes: parseInt(c.strokes, 10)
      };
    });

    var dscale = d3.time.scale().domain([
        d3.min(csv, function(d) { return d.d; }),
        d3.max(csv, function(d) { return d.d; })
    ]);

    var a = d3.min(csv, function(d) {
      return d.day;
    }),
    b = d3.max(csv, function(d) {
      return d.day;
    });

    a = d3.time.day(a);
    b = new Date(d3.time.day(b).getTime() + 24*60*60*1000);

    var n_days = d3.time.days(a, b).length;

    var day = d3.time.scale()
      .domain([a, b])
      .range([0, w]);

    var hours = dscale.ticks(d3.time.days, 1).map(function(h) {
      var s = d3.time.scale().domain([
          d3.time.day(h),
          d3.time.day(new Date(+h + 24 * 60 * 60 * 1000))
      ]);
      return s.ticks(d3.time.hours, 2);
    });

    var color = d3.scale.quantize()
    .domain([d3.min(csv, function(d) {
      return d.strokes;
    }), d3.max(csv, function(d) {
      return d.strokes;
    })])
    .range(d3.range(2, 9));

    d3.select('#load').remove();

    var dayscale = d3.time.scale().range([0, h - top]);

    ctx.fillStyle = '#fff';

    for (var i = 0; i < csv.length; i++) {
        var d = csv[i];
        ctx.fillRect(
          ~~day(d.day),
          dayscale.domain([
              d.day,
              d3.time.day.offset(new Date(d.day.getTime()), 1)
          ])(d.d),
          ~~(w/n_days) - 2,
          1);
    }

    d3.select('#total_keystrokes')
        .text(function() {
          var prec = {
            'million': 1000000,
            'thousand': 1000,
            'hundred': 100
          };
          for (var i in prec) {
            if (total_keystrokes > prec[i]) {
              return Math.round(total_keystrokes / prec[i]) + ' ' + i;
            }
          }
        });
  });
}
