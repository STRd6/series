(function() {
  var PixieCanvas, active, backgroundColor, canvas, chunkX, chunkY, element, foregroundColor, getPosition, height, lastPosition, localPosition, series, setValue, size, width;

  PixieCanvas = require("pixie-canvas");

  size = 100;

  width = 400;

  height = 400;

  series = [];

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

  active = false;

  lastPosition = null;

  $(element).on("mousedown", function(e) {
    var position;
    active = true;
    position = getPosition(e);
    setValue(position);
    return lastPosition = position;
  });

  $(element).on("mouseup", function(e) {
    return active = false;
  });

  $(element).on("mousemove", function(e) {
    var deltaX, deltaY, position, signX, _i, _ref, _ref1, _results;
    if (active) {
      position = getPosition(e);
      setValue(position);
      deltaX = position.x - lastPosition.x;
      deltaY = position.y - lastPosition.y;
      signX = deltaX.sign();
      (function() {
        _results = [];
        for (var _i = _ref = lastPosition.x, _ref1 = position.x; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(x) {
        var delta, y;
        delta = position.x - x;
        y = -((delta * deltaY) / deltaX).floor();
        console.log(x, y);
        return setValue({
          x: x,
          y: position.y + y
        });
      });
      return lastPosition = position;
    }
  });

  $(element).on("mouseout", function() {
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
    canvas.drawRect({
      color: backgroundColor,
      x: x * chunkX,
      y: 0,
      width: 4,
      height: height
    });
    return canvas.drawRect({
      color: foregroundColor,
      x: x * chunkX,
      y: y * chunkY,
      width: chunkX,
      height: height
    });
  };

  localPosition = function(e) {
    var parentOffset;
    parentOffset = $(e.currentTarget).parent().offset();
    e.localX = e.pageX - parentOffset.left;
    e.localY = e.pageY - parentOffset.top;
    return e;
  };

}).call(this);

//# sourceURL=series.coffee