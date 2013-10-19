(function() {
  var PixieCanvas, active, backgroundColor, canvas, chunkX, chunkY, element, foregroundColor, getPosition, height, lastPosition, localPosition, redraw, series, setValue, size, valuesElement, width, _i, _results;

  PixieCanvas = require("pixie-canvas");

  size = 100;

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
    var x, y;
    x = _arg.x, y = _arg.y;
    series[x] = y;
    redraw(x);
    return valuesElement.text(JSON.stringify(series));
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

}).call(this);

//# sourceURL=series.coffee