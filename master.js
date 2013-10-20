(function() {
  var DFT, PixieCanvas, active, backgroundColor, canvas, chunkX, chunkY, cos, e, element, foregroundColor, format, getPosition, height, lastPosition, localPosition, pow, redraw, series, setValue, sin, size, sqrt, valuesElement, whitespace, width, τ, _i, _results;

  PixieCanvas = require("pixie-canvas");

  size = 10;

  width = 400;

  height = 400;

  series = (function() {
    _results = [];
    for (var _i = 0; 0 <= size ? _i < size : _i > size; 0 <= size ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).map(function() {
    return 0;
  });

  chunkX = (width / size).floor();

  chunkY = (height / size).floor();

  backgroundColor = "white";

  foregroundColor = "black";

  canvas = PixieCanvas({
    width: width,
    height: height
  });

  element = canvas.element();

  $("body").append(element);

  valuesElement = $("<pre>", {
    text: JSON.stringify(series)
  });

  $("body").append(valuesElement);

  active = false;

  lastPosition = null;

  $(element).on("mousedown", function(e) {
    var position;
    active = true;
    position = getPosition(e);
    setValue(position);
    return lastPosition = position;
  });

  $(element).on("mousemove", function(e) {
    var deltaX, deltaY, position, signX, _j, _ref, _ref1, _results1;
    if (active) {
      position = getPosition(e);
      deltaX = position.x - lastPosition.x;
      deltaY = position.y - lastPosition.y;
      signX = deltaX.sign();
      (function() {
        _results1 = [];
        for (var _j = _ref = lastPosition.x, _ref1 = position.x; _ref <= _ref1 ? _j <= _ref1 : _j >= _ref1; _ref <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
        return _results1;
      }).apply(this).map(function(x) {
        var delta, y;
        if (delta = position.x - x) {
          y = -((delta * deltaY) / deltaX).floor();
        } else {
          y = 0;
        }
        return setValue({
          x: x,
          y: position.y + y
        });
      });
      return lastPosition = position;
    }
  });

  $(document).on("mouseup", function(e) {
    return active = false;
  });

  getPosition = function(e) {
    var x, y;
    localPosition(e);
    x = e.localX, y = e.localY;
    return {
      x: (x / chunkX).floor(),
      y: (y / chunkY).floor()
    };
  };

  setValue = function(_arg) {
    var transformed, x, y;
    x = _arg.x, y = _arg.y;
    series[x] = y;
    redraw(x);
    transformed = DFT(series);
    return valuesElement.text("" + (JSON.stringify(series)) + "\n" + (format(transformed)));
  };

  redraw = function(x) {
    var y;
    y = series[x];
    canvas.drawRect({
      color: backgroundColor,
      x: x * chunkX,
      y: 0,
      width: chunkX,
      height: height
    });
    return canvas.drawRect({
      color: foregroundColor,
      x: x * chunkX,
      y: y * chunkY,
      width: chunkX,
      height: height - y * chunkY
    });
  };

  series.map(function(y, x) {
    return redraw(x);
  });

  localPosition = function(e) {
    var parentOffset;
    parentOffset = $(e.currentTarget).parent().offset();
    e.localX = e.pageX - parentOffset.left;
    e.localY = e.pageY - parentOffset.top;
    return e;
  };

  cos = Math.cos, sin = Math.sin, pow = Math.pow, e = Math.E, sqrt = Math.sqrt;

  τ = 2 * Math.PI;

  DFT = function(series) {
    var N, divRootN, rootN, _j, _results1;
    N = series.length;
    rootN = sqrt(N);
    divRootN = function(x) {
      return x / rootN;
    };
    return (function() {
      _results1 = [];
      for (var _j = 0; 0 <= N ? _j < N : _j > N; 0 <= N ? _j++ : _j--){ _results1.push(_j); }
      return _results1;
    }).apply(this).map(function(k) {
      return series.map(function(x, n) {
        var theta;
        theta = -τ / N * k * n;
        return [x * cos(theta), x * -sin(theta)];
      }).reduce(function(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
      }, [0, 0]).map(divRootN);
    });
  };

  format = function(series) {
    return series.map(function(array) {
      return array.map(function(i) {
        var v;
        v = i.toFixed(3);
        return "" + (whitespace(10 - v.length)) + v;
      }).join("");
    }).join("\n");
  };

  whitespace = function(n) {
    var _j, _results1;
    return (function() {
      _results1 = [];
      for (var _j = 0; 0 <= n ? _j < n : _j > n; 0 <= n ? _j++ : _j--){ _results1.push(_j); }
      return _results1;
    }).apply(this).map(function() {
      return " ";
    }).join("");
  };

}).call(this);

//# sourceURL=series.coffee