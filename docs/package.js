(function(pkg) {
  // Expose a require for our package so scripts can access our modules
  window.require = Require.generateFor(pkg);
})({
  "version": "0.1.0",
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "mode": "100644",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "mode": "100644",
      "content": "series\n======\n\nDraw a series of data\n",
      "type": "blob"
    },
    "audio.coffee.md": {
      "path": "audio.coffee.md",
      "mode": "100644",
      "content": "Audio\n=====\n\nMessing around to learn HTML5 Web Audio madness.\n\n    context = new webkitAudioContext\n\n    module.exports =\n      context: context\n",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "mode": "100644",
      "content": "version: \"0.1.0\"\nentryPoint: \"series\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n  \"http://strd6.github.io/tempest/javascripts/envweb.js?\"\n  \"http://strd6.github.io/require/v0.2.2.js\"\n]\ndependencies:\n  \"pixie-canvas\": \"STRd6/pixie-canvas:v0.8.1\"\n",
      "type": "blob"
    },
    "series.coffee.md": {
      "path": "series.coffee.md",
      "mode": "100644",
      "content": "Series\n======\n\nDraw a series of data.\n\n    drawSynthesis = require \"./synthesis\"\n    PixieCanvas = require \"pixie-canvas\"\n\n    size = 8\n    width = 200\n    height = 200\n    series = [0...size].map -> 0\n\n    chunkX = (width/size).floor()\n    chunkY = (height/size).floor()\n\n    backgroundColor = \"white\"\n    foregroundColor = \"black\"\n\n    # TODO Dynamic width and height ?\n    canvas = PixieCanvas\n      width: width\n      height: height\n\n    element = canvas.element()\n\n    $(\"body\").append element\n\n    synthesisCanvas = PixieCanvas\n      width: width\n      height: height\n    $(\"body\").append synthesisCanvas.element()\n\n    valuesElement = $ \"<pre>\",\n      text: JSON.stringify(series)\n\n    $(\"body\").append valuesElement\n\n    $(\"body\").append $ \"<style>\",\n      text: require \"./style\"\n\n    active = false\n    lastPosition = null\n\nWhen we click within the canvas set the value for the position we clicked at.\n\n    $(element).on \"mousedown\", (e) ->\n      active = true\n\n      position = getPosition(e)\n      setValue(position)\n      lastPosition = position\n\nWhen the mouse moves apply a change for each x value in the intervening positions.\n\n    $(element).on \"mousemove\", (e) ->\n      if active\n        position = getPosition(e)\n\n        deltaX = position.x - lastPosition.x\n        deltaY = position.y - lastPosition.y\n        signX = deltaX.sign()\n\n        [lastPosition.x..position.x].map (x) ->\n          if delta = position.x - x\n            y = -((delta * deltaY) / deltaX).floor()\n          else\n            y = 0\n\n          setValue\n            x: x\n            y: position.y + y\n\n        lastPosition = position\n\nWhenever the mouse button is released, deactivate.\n\n    $(document).on \"mouseup\", (e) ->\n      active = false\n\nGet the local position from a mouse event within the canvas.\n\n    getPosition = (e) ->\n      localPosition(e)\n      {localX:x, localY:y} = e\n\n      x: (x/chunkX).floor().clamp(0, size-1)\n      y: (y/chunkY).floor().clamp(0, size-1)\n\nSet an x,y value of the series.\n\n    setValue = ({x, y}) ->\n      series[x] = y\n\n      # TODO: Make this an observer?\n      redraw(x)\n\n      input = series.map (n) -> [n, 0]\n      transformed = DFT(input)\n      inverse = inverseDFT(transformed)\n\n      valuesElement.text \"\"\"\n        #{JSON.stringify(series)}\n\n        DFT\n        #{format transformed}\n\n        Inverse DFT\n        #{format inverse}\n      \"\"\"\n\n      synthesisCanvas.clear()\n      synthesisCanvas.withTransform Matrix.scale(width, height), (canvas) ->\n        drawSynthesis(canvas, transformed, input)\n\nRedraw a specific x value.\n\n    redraw = (x) ->\n      y = series[x]\n\n      canvas.drawRect\n        color: backgroundColor\n        x: x * chunkX\n        y: 0\n        width: chunkX\n        height: height\n\n      canvas.drawRect\n        color: foregroundColor\n        x: x * chunkX\n        y: y * chunkY\n        width: chunkX\n        height: height - y * chunkY\n\nDraw the initial values.\n\n    series.map (y, x) ->\n      redraw(x)\n\nHelpers\n-------\n\nLocal event position.\n\n    localPosition = (e) ->\n      parentOffset = $(e.currentTarget).parent().offset()\n\n      e.localX = e.pageX - parentOffset.left\n      e.localY = e.pageY - parentOffset.top\n\n      return e\n\nDFT\n\n    {cos, sin, sqrt} = Math\n    τ = 2 * Math.PI\n\n    DFT = (series) ->\n      N = series.length\n      rootN = sqrt(N)\n      divRootN = (x) -> x / rootN\n\n      [0...N].map (k) ->\n        series.map ([x, y], n) ->\n          theta = -τ * k * n / N\n          [\n            x *  cos(theta) + y *  sin(theta)\n            x * -sin(theta) + y * -cos(theta)\n          ]\n        .reduce((a, b) ->\n          [a[0] + b[0], a[1] + b[1]]\n        , [0, 0])\n        .map divRootN\n\n    inverseDFT = (series) ->\n      do (x = DFT(series)) ->\n        x.push(x.shift())\n        x.reverse()\n\nFormat for output\n\n    format = (series) ->\n      series.map (array) ->\n        array.map (i) ->\n          v = i.toFixed(3)\n          \"#{whitespace(10 - v.length)}#{v}\"\n        .join(\"\")\n      .join(\"\\n\")\n\n    whitespace = (n) ->\n      [0...n].map(-> \" \").join(\"\")\n",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "mode": "100644",
      "content": "canvas\n  margin-right: 1em\n  border: 1px solid black\n",
      "type": "blob"
    },
    "synthesis.coffee.md": {
      "path": "synthesis.coffee.md",
      "mode": "100644",
      "content": "Sythesis\n========\n\nDraw sythesis on a canvas.\n\n    {cos, sin, sqrt, min, max} = Math\n    τ = 2 * Math.PI\n\n    # TODO: Smarter scaling\n    module.exports = (canvas, series, actual, scale=1/20) ->\n      n = 100\n\n      points = [0..n].map (i) ->\n        x = i * τ / n\n\n        y = series.map ([r, i], k) ->\n          r * cos(k * x) + i * sin(k * x)\n        .sum()\n\n        [x, y]\n\n      # Normalize y\n\n      yValues = points.map ([x, y]) -> y\n\n      minimum = yValues.minimum()\n      maximum = yValues.maximum()\n      spread = maximum - minimum\n\n      specialInvert(points.map ([x, y]) ->\n        # Normalize to be between 0 and 1\n        [x / τ, y * scale]\n      ).map ([x, y]) ->\n        canvas.drawCircle\n          x: x\n          y: y\n          radius: 0.01\n          color: \"rgb(100, 100, 100)\"\n\n      # NOTE: y's are all zero because we're getting real values only\n      actual.map ([x, y], i) ->\n        [i / actual.length, x * sqrt(actual.length) * scale]\n      .map ([x, y]) ->\n        canvas.drawCircle\n          x: x\n          y: y\n          radius: 0.01\n          color: \"rgb(0, 0, 255)\"\n\nHelpers\n-------\n\n    specialInvert = (series) ->\n      do (x = series.copy()) ->\n        x.push(x.shift())\n        x.reverse()\n",
      "type": "blob"
    }
  },
  "distribution": {
    "audio": {
      "path": "audio",
      "content": "(function() {\n  var context;\n\n  context = new webkitAudioContext;\n\n  module.exports = {\n    context: context\n  };\n\n}).call(this);\n\n//# sourceURL=audio.coffee",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.1.0\",\"entryPoint\":\"series\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\",\"http://strd6.github.io/tempest/javascripts/envweb.js?\",\"http://strd6.github.io/require/v0.2.2.js\"],\"dependencies\":{\"pixie-canvas\":\"STRd6/pixie-canvas:v0.8.1\"}};",
      "type": "blob"
    },
    "series": {
      "path": "series",
      "content": "(function() {\n  var DFT, PixieCanvas, active, backgroundColor, canvas, chunkX, chunkY, cos, drawSynthesis, element, foregroundColor, format, getPosition, height, inverseDFT, lastPosition, localPosition, redraw, series, setValue, sin, size, sqrt, synthesisCanvas, valuesElement, whitespace, width, τ, _i, _results;\n\n  drawSynthesis = require(\"./synthesis\");\n\n  PixieCanvas = require(\"pixie-canvas\");\n\n  size = 8;\n\n  width = 200;\n\n  height = 200;\n\n  series = (function() {\n    _results = [];\n    for (var _i = 0; 0 <= size ? _i < size : _i > size; 0 <= size ? _i++ : _i--){ _results.push(_i); }\n    return _results;\n  }).apply(this).map(function() {\n    return 0;\n  });\n\n  chunkX = (width / size).floor();\n\n  chunkY = (height / size).floor();\n\n  backgroundColor = \"white\";\n\n  foregroundColor = \"black\";\n\n  canvas = PixieCanvas({\n    width: width,\n    height: height\n  });\n\n  element = canvas.element();\n\n  $(\"body\").append(element);\n\n  synthesisCanvas = PixieCanvas({\n    width: width,\n    height: height\n  });\n\n  $(\"body\").append(synthesisCanvas.element());\n\n  valuesElement = $(\"<pre>\", {\n    text: JSON.stringify(series)\n  });\n\n  $(\"body\").append(valuesElement);\n\n  $(\"body\").append($(\"<style>\", {\n    text: require(\"./style\")\n  }));\n\n  active = false;\n\n  lastPosition = null;\n\n  $(element).on(\"mousedown\", function(e) {\n    var position;\n    active = true;\n    position = getPosition(e);\n    setValue(position);\n    return lastPosition = position;\n  });\n\n  $(element).on(\"mousemove\", function(e) {\n    var deltaX, deltaY, position, signX, _j, _ref, _ref1, _results1;\n    if (active) {\n      position = getPosition(e);\n      deltaX = position.x - lastPosition.x;\n      deltaY = position.y - lastPosition.y;\n      signX = deltaX.sign();\n      (function() {\n        _results1 = [];\n        for (var _j = _ref = lastPosition.x, _ref1 = position.x; _ref <= _ref1 ? _j <= _ref1 : _j >= _ref1; _ref <= _ref1 ? _j++ : _j--){ _results1.push(_j); }\n        return _results1;\n      }).apply(this).map(function(x) {\n        var delta, y;\n        if (delta = position.x - x) {\n          y = -((delta * deltaY) / deltaX).floor();\n        } else {\n          y = 0;\n        }\n        return setValue({\n          x: x,\n          y: position.y + y\n        });\n      });\n      return lastPosition = position;\n    }\n  });\n\n  $(document).on(\"mouseup\", function(e) {\n    return active = false;\n  });\n\n  getPosition = function(e) {\n    var x, y;\n    localPosition(e);\n    x = e.localX, y = e.localY;\n    return {\n      x: (x / chunkX).floor().clamp(0, size - 1),\n      y: (y / chunkY).floor().clamp(0, size - 1)\n    };\n  };\n\n  setValue = function(_arg) {\n    var input, inverse, transformed, x, y;\n    x = _arg.x, y = _arg.y;\n    series[x] = y;\n    redraw(x);\n    input = series.map(function(n) {\n      return [n, 0];\n    });\n    transformed = DFT(input);\n    inverse = inverseDFT(transformed);\n    valuesElement.text(\"\" + (JSON.stringify(series)) + \"\\n\\nDFT\\n\" + (format(transformed)) + \"\\n\\nInverse DFT\\n\" + (format(inverse)));\n    synthesisCanvas.clear();\n    return synthesisCanvas.withTransform(Matrix.scale(width, height), function(canvas) {\n      return drawSynthesis(canvas, transformed, input);\n    });\n  };\n\n  redraw = function(x) {\n    var y;\n    y = series[x];\n    canvas.drawRect({\n      color: backgroundColor,\n      x: x * chunkX,\n      y: 0,\n      width: chunkX,\n      height: height\n    });\n    return canvas.drawRect({\n      color: foregroundColor,\n      x: x * chunkX,\n      y: y * chunkY,\n      width: chunkX,\n      height: height - y * chunkY\n    });\n  };\n\n  series.map(function(y, x) {\n    return redraw(x);\n  });\n\n  localPosition = function(e) {\n    var parentOffset;\n    parentOffset = $(e.currentTarget).parent().offset();\n    e.localX = e.pageX - parentOffset.left;\n    e.localY = e.pageY - parentOffset.top;\n    return e;\n  };\n\n  cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt;\n\n  τ = 2 * Math.PI;\n\n  DFT = function(series) {\n    var N, divRootN, rootN, _j, _results1;\n    N = series.length;\n    rootN = sqrt(N);\n    divRootN = function(x) {\n      return x / rootN;\n    };\n    return (function() {\n      _results1 = [];\n      for (var _j = 0; 0 <= N ? _j < N : _j > N; 0 <= N ? _j++ : _j--){ _results1.push(_j); }\n      return _results1;\n    }).apply(this).map(function(k) {\n      return series.map(function(_arg, n) {\n        var theta, x, y;\n        x = _arg[0], y = _arg[1];\n        theta = -τ * k * n / N;\n        return [x * cos(theta) + y * sin(theta), x * -sin(theta) + y * -cos(theta)];\n      }).reduce(function(a, b) {\n        return [a[0] + b[0], a[1] + b[1]];\n      }, [0, 0]).map(divRootN);\n    });\n  };\n\n  inverseDFT = function(series) {\n    return (function(x) {\n      x.push(x.shift());\n      return x.reverse();\n    })(DFT(series));\n  };\n\n  format = function(series) {\n    return series.map(function(array) {\n      return array.map(function(i) {\n        var v;\n        v = i.toFixed(3);\n        return \"\" + (whitespace(10 - v.length)) + v;\n      }).join(\"\");\n    }).join(\"\\n\");\n  };\n\n  whitespace = function(n) {\n    var _j, _results1;\n    return (function() {\n      _results1 = [];\n      for (var _j = 0; 0 <= n ? _j < n : _j > n; 0 <= n ? _j++ : _j--){ _results1.push(_j); }\n      return _results1;\n    }).apply(this).map(function() {\n      return \" \";\n    }).join(\"\");\n  };\n\n}).call(this);\n\n//# sourceURL=series.coffee",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"canvas {\\n  margin-right: 1em;\\n  border: 1px solid black;\\n}\";",
      "type": "blob"
    },
    "synthesis": {
      "path": "synthesis",
      "content": "(function() {\n  var cos, max, min, sin, specialInvert, sqrt, τ;\n\n  cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt, min = Math.min, max = Math.max;\n\n  τ = 2 * Math.PI;\n\n  module.exports = function(canvas, series, actual, scale) {\n    var maximum, minimum, n, points, spread, yValues, _i, _results;\n    if (scale == null) {\n      scale = 1 / 20;\n    }\n    n = 100;\n    points = (function() {\n      _results = [];\n      for (var _i = 0; 0 <= n ? _i <= n : _i >= n; 0 <= n ? _i++ : _i--){ _results.push(_i); }\n      return _results;\n    }).apply(this).map(function(i) {\n      var x, y;\n      x = i * τ / n;\n      y = series.map(function(_arg, k) {\n        var i, r;\n        r = _arg[0], i = _arg[1];\n        return r * cos(k * x) + i * sin(k * x);\n      }).sum();\n      return [x, y];\n    });\n    yValues = points.map(function(_arg) {\n      var x, y;\n      x = _arg[0], y = _arg[1];\n      return y;\n    });\n    minimum = yValues.minimum();\n    maximum = yValues.maximum();\n    spread = maximum - minimum;\n    specialInvert(points.map(function(_arg) {\n      var x, y;\n      x = _arg[0], y = _arg[1];\n      return [x / τ, y * scale];\n    })).map(function(_arg) {\n      var x, y;\n      x = _arg[0], y = _arg[1];\n      return canvas.drawCircle({\n        x: x,\n        y: y,\n        radius: 0.01,\n        color: \"rgb(100, 100, 100)\"\n      });\n    });\n    return actual.map(function(_arg, i) {\n      var x, y;\n      x = _arg[0], y = _arg[1];\n      return [i / actual.length, x * sqrt(actual.length) * scale];\n    }).map(function(_arg) {\n      var x, y;\n      x = _arg[0], y = _arg[1];\n      return canvas.drawCircle({\n        x: x,\n        y: y,\n        radius: 0.01,\n        color: \"rgb(0, 0, 255)\"\n      });\n    });\n  };\n\n  specialInvert = function(series) {\n    return (function(x) {\n      x.push(x.shift());\n      return x.reverse();\n    })(series.copy());\n  };\n\n}).call(this);\n\n//# sourceURL=synthesis.coffee",
      "type": "blob"
    }
  },
  "entryPoint": "series",
  "dependencies": {
    "pixie-canvas": {
      "version": "0.8.1",
      "source": {
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "entryPoint: \"pixie_canvas\"\nversion: \"0.8.1\"\nremoteDependencies: [\n  \"http://strd6.github.io/require/v0.2.1.js\"\n]\n",
          "type": "blob"
        },
        "pixie_canvas.coffee.md": {
          "path": "pixie_canvas.coffee.md",
          "mode": "100644",
          "content": "Pixie Canvas\n============\n\nPixieCanvas provides a convenient wrapper for working with Context2d.\n\nMethods try to be as flexible as possible as to what arguments they take.\n\nNon-getter methods return `this` for method chaining.\n\n    TAU = 2 * Math.PI\n\n    module.exports = (options={}) ->\n        defaults options,\n          width: 400\n          height: 400\n          init: ->\n\n        canvas = document.createElement \"canvas\"\n        canvas.width = options.width\n        canvas.height = options.height\n\n        context = undefined\n\n        self =\n\n`clear` clears the entire canvas (or a portion of it).\n\nTo clear the entire canvas use `canvas.clear()`\n\n>     #! paint\n>     # Set up: Fill canvas with blue\n>     canvas.fill(\"blue\")\n>\n>     # Clear a portion of the canvas\n>     canvas.clear\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n\n          clear: ({x, y, width, height}={}) ->\n            x ?= 0\n            y ?= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            context.clearRect(x, y, width, height)\n\n            return this\n\nFills the entire canvas (or a specified section of it) with\nthe given color.\n\n>     #! paint\n>     # Paint the town (entire canvas) red\n>     canvas.fill \"red\"\n>\n>     # Fill a section of the canvas white (#FFF)\n>     canvas.fill\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#FFF\"\n\n          fill: (color={}) ->\n            unless (typeof color is \"string\") or color.channels\n              {x, y, width, height, bounds, color} = color\n\n            {x, y, width, height} = bounds if bounds\n\n            x ||= 0\n            y ||= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            @fillColor(color)\n            context.fillRect(x, y, width, height)\n\n            return this\n\nA direct map to the Context2d draw image. `GameObject`s\nthat implement drawable will have this wrapped up nicely,\nso there is a good chance that you will not have to deal with\nit directly.\n\n>     #! paint\n>     $ \"<img>\",\n>       src: \"https://secure.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045\"\n>       load: ->\n>         canvas.drawImage(this, 25, 25)\n\n          drawImage: (args...) ->\n            context.drawImage(args...)\n\n            return this\n\nDraws a circle at the specified position with the specified\nradius and color.\n\n>     #! paint\n>     # Draw a large orange circle\n>     canvas.drawCircle\n>       radius: 30\n>       position: Point(100, 75)\n>       color: \"orange\"\n>\n>     # You may also set a stroke\n>     canvas.drawCircle\n>       x: 25\n>       y: 50\n>       radius: 10\n>       color: \"blue\"\n>       stroke:\n>         color: \"red\"\n>         width: 1\n\nYou can pass in circle objects as well.\n\n>     #! paint\n>     # Create a circle object to set up the next examples\n>     circle =\n>       radius: 20\n>       x: 50\n>       y: 50\n>\n>     # Draw a given circle in yellow\n>     canvas.drawCircle\n>       circle: circle\n>       color: \"yellow\"\n>\n>     # Draw the circle in green at a different position\n>     canvas.drawCircle\n>       circle: circle\n>       position: Point(25, 75)\n>       color: \"green\"\n\nYou may set a stroke, or even pass in only a stroke to draw an unfilled circle.\n\n>     #! paint\n>     # Draw an outline circle in purple.\n>     canvas.drawCircle\n>       x: 50\n>       y: 75\n>       radius: 10\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n>\n\n          drawCircle: ({x, y, radius, position, color, stroke, circle}) ->\n            {x, y, radius} = circle if circle\n            {x, y} = position if position\n\n            radius = 0 if radius < 0\n\n            context.beginPath()\n            context.arc(x, y, radius, 0, TAU, true)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return this\n\nDraws a rectangle at the specified position with given\nwidth and height. Optionally takes a position, bounds\nand color argument.\n\n\n          drawRect: ({x, y, width, height, position, bounds, color, stroke}) ->\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            if color\n              @fillColor(color)\n              context.fillRect(x, y, width, height)\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.strokeRect(x, y, width, height)\n\n            return @\n\n>     #! paint\n>     # Draw a red rectangle using x, y, width and height\n>     canvas.drawRect\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#F00\"\n\n----\n\nYou can mix and match position, witdth and height.\n\n>     #! paint\n>     canvas.drawRect\n>       position: Point(0, 0)\n>       width: 50\n>       height: 50\n>       color: \"blue\"\n>       stroke:\n>         color: \"orange\"\n>         width: 3\n\n----\n\nA bounds can be reused to draw multiple rectangles.\n\n>     #! paint\n>     bounds =\n>       x: 100\n>       y: 0\n>       width: 100\n>       height: 100\n>\n>     # Draw a purple rectangle using bounds\n>     canvas.drawRect\n>       bounds: bounds\n>       color: \"green\"\n>\n>     # Draw the outline of the same bounds, but at a different position\n>     canvas.drawRect\n>       bounds: bounds\n>       position: Point(0, 50)\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n\n----\n\nDraw a line from `start` to `end`.\n\n>     #! paint\n>     # Draw a sweet diagonal\n>     canvas.drawLine\n>       start: Point(0, 0)\n>       end: Point(200, 200)\n>       color: \"purple\"\n>\n>     # Draw another sweet diagonal\n>     canvas.drawLine\n>       start: Point(200, 0)\n>       end: Point(0, 200)\n>       color: \"red\"\n>       width: 6\n>\n>     # Now draw a sweet horizontal with a direction and a length\n>     canvas.drawLine\n>       start: Point(0, 100)\n>       length: 200\n>       direction: Point(1, 0)\n>       color: \"orange\"\n\n          drawLine: ({start, end, width, color, direction, length}) ->\n            width ||= 3\n\n            if direction\n              end = direction.norm(length).add(start)\n\n            @lineWidth(width)\n            @strokeColor(color)\n\n            context.beginPath()\n            context.moveTo(start.x, start.y)\n            context.lineTo(end.x, end.y)\n            context.closePath()\n            context.stroke()\n\n            return this\n\nDraw a polygon.\n\n>     #! paint\n>     # Draw a sweet rhombus\n>     canvas.drawPoly\n>       points: [\n>         Point(50, 25)\n>         Point(75, 50)\n>         Point(50, 75)\n>         Point(25, 50)\n>       ]\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawPoly: ({points, color, stroke}) ->\n            context.beginPath()\n            points.forEach (point, i) ->\n              if i == 0\n                context.moveTo(point.x, point.y)\n              else\n                context.lineTo(point.x, point.y)\n            context.lineTo points[0].x, points[0].y\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return @\n\nDraw a rounded rectangle.\n\nAdapted from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html\n\n>     #! paint\n>     # Draw a purple rounded rectangle with a red outline\n>     canvas.drawRoundRect\n>       position: Point(25, 25)\n>       radius: 10\n>       width: 150\n>       height: 100\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawRoundRect: ({x, y, width, height, radius, position, bounds, color, stroke}) ->\n            radius = 5 unless radius?\n\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            context.beginPath()\n            context.moveTo(x + radius, y)\n            context.lineTo(x + width - radius, y)\n            context.quadraticCurveTo(x + width, y, x + width, y + radius)\n            context.lineTo(x + width, y + height - radius)\n            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)\n            context.lineTo(x + radius, y + height)\n            context.quadraticCurveTo(x, y + height, x, y + height - radius)\n            context.lineTo(x, y + radius)\n            context.quadraticCurveTo(x, y, x + radius, y)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @lineWidth(stroke.width)\n              @strokeColor(stroke.color)\n              context.stroke()\n\n            return this\n\nDraws text on the canvas at the given position, in the given color.\nIf no color is given then the previous fill color is used.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: '#eee'\n>\n>     # A line to indicate the baseline\n>     canvas.drawLine\n>       start: Point(25, 50)\n>       end: Point(125, 50)\n>       color: \"#333\"\n>       width: 1\n>\n>     # Draw some text, note the position of the baseline\n>     canvas.drawText\n>       position: Point(25, 50)\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n\n\n          drawText: ({x, y, text, position, color, font}) ->\n            {x, y} = position if position\n\n            @fillColor(color)\n            @font(font) if font\n            context.fillText(text, x, y)\n\n            return this\n\nCenters the given text on the canvas at the given y position. An x position\nor point position can also be given in which case the text is centered at the\nx, y or position value specified.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: \"#eee\"\n>\n>     # Center text on the screen at y value 25\n>     canvas.centerText\n>       y: 25\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n>\n>     # Center text at point (75, 75)\n>     canvas.centerText\n>       position: Point(75, 75)\n>       color: \"green\"\n>       text: \"take this\"\n\n          centerText: ({text, x, y, position, color, font}) ->\n            {x, y} = position if position\n\n            x = canvas.width / 2 unless x?\n\n            textWidth = @measureText(text)\n\n            @drawText {\n              text\n              color\n              font\n              x: x - (textWidth) / 2\n              y\n            }\n\nSetting the fill color:\n\n`canvas.fillColor(\"#FF0000\")`\n\nPassing no arguments returns the fillColor:\n\n`canvas.fillColor() # => \"#FF000000\"`\n\nYou can also pass a Color object:\n\n`canvas.fillColor(Color('sky blue'))`\n\n          fillColor: (color) ->\n            if color\n              if color.channels\n                context.fillStyle = color.toString()\n              else\n                context.fillStyle = color\n\n              return @\n            else\n              return context.fillStyle\n\nSetting the stroke color:\n\n`canvas.strokeColor(\"#FF0000\")`\n\nPassing no arguments returns the strokeColor:\n\n`canvas.strokeColor() # => \"#FF0000\"`\n\nYou can also pass a Color object:\n\n`canvas.strokeColor(Color('sky blue'))`\n\n          strokeColor: (color) ->\n            if color\n              if color.channels\n                context.strokeStyle = color.toString()\n              else\n                context.strokeStyle = color\n\n              return this\n            else\n              return context.strokeStyle\n\nDetermine how wide some text is.\n\n`canvas.measureText('Hello World!') # => 55`\n\nIt may have accuracy issues depending on the font used.\n\n          measureText: (text) ->\n            context.measureText(text).width\n\nPasses this canvas to the block with the given matrix transformation\napplied. All drawing methods called within the block will draw\ninto the canvas with the transformation applied. The transformation\nis removed at the end of the block, even if the block throws an error.\n\n          withTransform: (matrix, block) ->\n            context.save()\n\n            context.transform(\n              matrix.a,\n              matrix.b,\n              matrix.c,\n              matrix.d,\n              matrix.tx,\n              matrix.ty\n            )\n\n            try\n              block(this)\n            finally\n              context.restore()\n\n            return this\n\nStraight proxy to context `putImageData` method.\n\n          putImageData: (args...) ->\n            context.putImageData(args...)\n\n            return this\n\nContext getter.\n\n          context: ->\n            context\n\nGetter for the actual html canvas element.\n\n          element: ->\n            canvas\n\nStraight proxy to context pattern creation.\n\n          createPattern: (image, repitition) ->\n            context.createPattern(image, repitition)\n\nSet a clip rectangle.\n\n          clip: (x, y, width, height) ->\n            context.beginPath()\n            context.rect(x, y, width, height)\n            context.clip()\n\n            return this\n\nGenerate accessors that get properties from the context object.\n\n        contextAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                context[attr] = newVal\n                return @\n              else\n                context[attr]\n\n        contextAttrAccessor(\n          \"font\",\n          \"globalAlpha\",\n          \"globalCompositeOperation\",\n          \"lineWidth\",\n          \"textAlign\",\n        )\n\nGenerate accessors that get properties from the canvas object.\n\n        canvasAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                canvas[attr] = newVal\n                return @\n              else\n                canvas[attr]\n\n        canvasAttrAccessor(\n          \"height\",\n          \"width\",\n        )\n\n        context = canvas.getContext('2d')\n\n        options.init(self)\n\n        return self\n\nDepend on either jQuery or Zepto for now (TODO: Don't depend on either)\n\nHelpers\n-------\n\nFill in default properties for an object, setting them only if they are not\nalready present.\n\n    defaults = (target, objects...) ->\n      for object in objects\n        for name of object\n          unless target.hasOwnProperty(name)\n            target[name] = object[name]\n\n      return target\n\nInteractive Examples\n--------------------\n\n>     #! setup\n>     Canvas = require \"/pixie_canvas\"\n>\n>     window.Point ?= (x, y) ->\n>       x: x\n>       y: y\n>\n>     Interactive.register \"paint\", ({source, runtimeElement}) ->\n>       canvas = Canvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "mode": "100644",
          "content": "Canvas = require \"../pixie_canvas\"\n\ndescribe \"pixie canvas\", ->\n  it \"Should create a canvas\", ->\n    canvas = Canvas\n      width: 400\n      height: 150\n\n    assert canvas\n    \n    assert canvas.width() is 400\n",
          "type": "blob"
        }
      },
      "distribution": {
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"entryPoint\":\"pixie_canvas\",\"version\":\"0.8.1\",\"remoteDependencies\":[\"http://strd6.github.io/require/v0.2.1.js\"]};",
          "type": "blob"
        },
        "pixie_canvas": {
          "path": "pixie_canvas",
          "content": "(function() {\n  var TAU, defaults,\n    __slice = [].slice;\n\n  TAU = 2 * Math.PI;\n\n  module.exports = function(options) {\n    var canvas, canvasAttrAccessor, context, contextAttrAccessor, self;\n    if (options == null) {\n      options = {};\n    }\n    defaults(options, {\n      width: 400,\n      height: 400,\n      init: function() {}\n    });\n    canvas = document.createElement(\"canvas\");\n    canvas.width = options.width;\n    canvas.height = options.height;\n    context = void 0;\n    self = {\n      clear: function(_arg) {\n        var height, width, x, y, _ref;\n        _ref = _arg != null ? _arg : {}, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;\n        if (x == null) {\n          x = 0;\n        }\n        if (y == null) {\n          y = 0;\n        }\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        context.clearRect(x, y, width, height);\n        return this;\n      },\n      fill: function(color) {\n        var bounds, height, width, x, y, _ref;\n        if (color == null) {\n          color = {};\n        }\n        if (!((typeof color === \"string\") || color.channels)) {\n          _ref = color, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height, bounds = _ref.bounds, color = _ref.color;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        x || (x = 0);\n        y || (y = 0);\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        this.fillColor(color);\n        context.fillRect(x, y, width, height);\n        return this;\n      },\n      drawImage: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.drawImage.apply(context, args);\n        return this;\n      },\n      drawCircle: function(_arg) {\n        var circle, color, position, radius, stroke, x, y;\n        x = _arg.x, y = _arg.y, radius = _arg.radius, position = _arg.position, color = _arg.color, stroke = _arg.stroke, circle = _arg.circle;\n        if (circle) {\n          x = circle.x, y = circle.y, radius = circle.radius;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (radius < 0) {\n          radius = 0;\n        }\n        context.beginPath();\n        context.arc(x, y, radius, 0, TAU, true);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRect: function(_arg) {\n        var bounds, color, height, position, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (color) {\n          this.fillColor(color);\n          context.fillRect(x, y, width, height);\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.strokeRect(x, y, width, height);\n        }\n        return this;\n      },\n      drawLine: function(_arg) {\n        var color, direction, end, length, start, width;\n        start = _arg.start, end = _arg.end, width = _arg.width, color = _arg.color, direction = _arg.direction, length = _arg.length;\n        width || (width = 3);\n        if (direction) {\n          end = direction.norm(length).add(start);\n        }\n        this.lineWidth(width);\n        this.strokeColor(color);\n        context.beginPath();\n        context.moveTo(start.x, start.y);\n        context.lineTo(end.x, end.y);\n        context.closePath();\n        context.stroke();\n        return this;\n      },\n      drawPoly: function(_arg) {\n        var color, points, stroke;\n        points = _arg.points, color = _arg.color, stroke = _arg.stroke;\n        context.beginPath();\n        points.forEach(function(point, i) {\n          if (i === 0) {\n            return context.moveTo(point.x, point.y);\n          } else {\n            return context.lineTo(point.x, point.y);\n          }\n        });\n        context.lineTo(points[0].x, points[0].y);\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRoundRect: function(_arg) {\n        var bounds, color, height, position, radius, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, radius = _arg.radius, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (radius == null) {\n          radius = 5;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        context.beginPath();\n        context.moveTo(x + radius, y);\n        context.lineTo(x + width - radius, y);\n        context.quadraticCurveTo(x + width, y, x + width, y + radius);\n        context.lineTo(x + width, y + height - radius);\n        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);\n        context.lineTo(x + radius, y + height);\n        context.quadraticCurveTo(x, y + height, x, y + height - radius);\n        context.lineTo(x, y + radius);\n        context.quadraticCurveTo(x, y, x + radius, y);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.lineWidth(stroke.width);\n          this.strokeColor(stroke.color);\n          context.stroke();\n        }\n        return this;\n      },\n      drawText: function(_arg) {\n        var color, font, position, text, x, y;\n        x = _arg.x, y = _arg.y, text = _arg.text, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        this.fillColor(color);\n        if (font) {\n          this.font(font);\n        }\n        context.fillText(text, x, y);\n        return this;\n      },\n      centerText: function(_arg) {\n        var color, font, position, text, textWidth, x, y;\n        text = _arg.text, x = _arg.x, y = _arg.y, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (x == null) {\n          x = canvas.width / 2;\n        }\n        textWidth = this.measureText(text);\n        return this.drawText({\n          text: text,\n          color: color,\n          font: font,\n          x: x - textWidth / 2,\n          y: y\n        });\n      },\n      fillColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.fillStyle = color.toString();\n          } else {\n            context.fillStyle = color;\n          }\n          return this;\n        } else {\n          return context.fillStyle;\n        }\n      },\n      strokeColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.strokeStyle = color.toString();\n          } else {\n            context.strokeStyle = color;\n          }\n          return this;\n        } else {\n          return context.strokeStyle;\n        }\n      },\n      measureText: function(text) {\n        return context.measureText(text).width;\n      },\n      withTransform: function(matrix, block) {\n        context.save();\n        context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);\n        try {\n          block(this);\n        } finally {\n          context.restore();\n        }\n        return this;\n      },\n      putImageData: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.putImageData.apply(context, args);\n        return this;\n      },\n      context: function() {\n        return context;\n      },\n      element: function() {\n        return canvas;\n      },\n      createPattern: function(image, repitition) {\n        return context.createPattern(image, repitition);\n      },\n      clip: function(x, y, width, height) {\n        context.beginPath();\n        context.rect(x, y, width, height);\n        context.clip();\n        return this;\n      }\n    };\n    contextAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            context[attr] = newVal;\n            return this;\n          } else {\n            return context[attr];\n          }\n        };\n      });\n    };\n    contextAttrAccessor(\"font\", \"globalAlpha\", \"globalCompositeOperation\", \"lineWidth\", \"textAlign\");\n    canvasAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            canvas[attr] = newVal;\n            return this;\n          } else {\n            return canvas[attr];\n          }\n        };\n      });\n    };\n    canvasAttrAccessor(\"height\", \"width\");\n    context = canvas.getContext('2d');\n    options.init(self);\n    return self;\n  };\n\n  defaults = function() {\n    var name, object, objects, target, _i, _len;\n    target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = objects.length; _i < _len; _i++) {\n      object = objects[_i];\n      for (name in object) {\n        if (!target.hasOwnProperty(name)) {\n          target[name] = object[name];\n        }\n      }\n    }\n    return target;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Canvas;\n\n  Canvas = require(\"../pixie_canvas\");\n\n  describe(\"pixie canvas\", function() {\n    return it(\"Should create a canvas\", function() {\n      var canvas;\n      canvas = Canvas({\n        width: 400,\n        height: 150\n      });\n      assert(canvas);\n      return assert(canvas.width() === 400);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "entryPoint": "pixie_canvas",
      "dependencies": {},
      "remoteDependencies": [
        "http://strd6.github.io/require/v0.2.1.js"
      ],
      "repository": {
        "id": 12096899,
        "name": "pixie-canvas",
        "full_name": "STRd6/pixie-canvas",
        "owner": {
          "login": "STRd6",
          "id": 18894,
          "avatar_url": "https://1.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045?d=https%3A%2F%2Fidenticons.github.com%2F39df222bffe39629d904e4883eabc654.png",
          "gravatar_id": "33117162fff8a9cf50544a604f60c045",
          "url": "https://api.github.com/users/STRd6",
          "html_url": "https://github.com/STRd6",
          "followers_url": "https://api.github.com/users/STRd6/followers",
          "following_url": "https://api.github.com/users/STRd6/following{/other_user}",
          "gists_url": "https://api.github.com/users/STRd6/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/STRd6/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/STRd6/subscriptions",
          "organizations_url": "https://api.github.com/users/STRd6/orgs",
          "repos_url": "https://api.github.com/users/STRd6/repos",
          "events_url": "https://api.github.com/users/STRd6/events{/privacy}",
          "received_events_url": "https://api.github.com/users/STRd6/received_events",
          "type": "User"
        },
        "private": false,
        "html_url": "https://github.com/STRd6/pixie-canvas",
        "description": "A pretty ok HTML5 canvas wrapper",
        "fork": false,
        "url": "https://api.github.com/repos/STRd6/pixie-canvas",
        "forks_url": "https://api.github.com/repos/STRd6/pixie-canvas/forks",
        "keys_url": "https://api.github.com/repos/STRd6/pixie-canvas/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/STRd6/pixie-canvas/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/STRd6/pixie-canvas/teams",
        "hooks_url": "https://api.github.com/repos/STRd6/pixie-canvas/hooks",
        "issue_events_url": "https://api.github.com/repos/STRd6/pixie-canvas/issues/events{/number}",
        "events_url": "https://api.github.com/repos/STRd6/pixie-canvas/events",
        "assignees_url": "https://api.github.com/repos/STRd6/pixie-canvas/assignees{/user}",
        "branches_url": "https://api.github.com/repos/STRd6/pixie-canvas/branches{/branch}",
        "tags_url": "https://api.github.com/repos/STRd6/pixie-canvas/tags",
        "blobs_url": "https://api.github.com/repos/STRd6/pixie-canvas/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/STRd6/pixie-canvas/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/STRd6/pixie-canvas/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/STRd6/pixie-canvas/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/STRd6/pixie-canvas/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/STRd6/pixie-canvas/languages",
        "stargazers_url": "https://api.github.com/repos/STRd6/pixie-canvas/stargazers",
        "contributors_url": "https://api.github.com/repos/STRd6/pixie-canvas/contributors",
        "subscribers_url": "https://api.github.com/repos/STRd6/pixie-canvas/subscribers",
        "subscription_url": "https://api.github.com/repos/STRd6/pixie-canvas/subscription",
        "commits_url": "https://api.github.com/repos/STRd6/pixie-canvas/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/STRd6/pixie-canvas/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/STRd6/pixie-canvas/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/STRd6/pixie-canvas/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/STRd6/pixie-canvas/contents/{+path}",
        "compare_url": "https://api.github.com/repos/STRd6/pixie-canvas/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/STRd6/pixie-canvas/merges",
        "archive_url": "https://api.github.com/repos/STRd6/pixie-canvas/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/STRd6/pixie-canvas/downloads",
        "issues_url": "https://api.github.com/repos/STRd6/pixie-canvas/issues{/number}",
        "pulls_url": "https://api.github.com/repos/STRd6/pixie-canvas/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/STRd6/pixie-canvas/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/STRd6/pixie-canvas/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/STRd6/pixie-canvas/labels{/name}",
        "created_at": "2013-08-14T01:15:34Z",
        "updated_at": "2013-10-01T17:16:30Z",
        "pushed_at": "2013-10-01T17:16:30Z",
        "git_url": "git://github.com/STRd6/pixie-canvas.git",
        "ssh_url": "git@github.com:STRd6/pixie-canvas.git",
        "clone_url": "https://github.com/STRd6/pixie-canvas.git",
        "svn_url": "https://github.com/STRd6/pixie-canvas",
        "homepage": null,
        "size": 1520,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 2,
        "forks": 0,
        "open_issues": 2,
        "watchers": 0,
        "master_branch": "master",
        "default_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "network_count": 0,
        "branch": "v0.8.1",
        "defaultBranch": "master",
        "includedModules": [
          "Bindable"
        ]
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      }
    }
  },
  "remoteDependencies": [
    "//code.jquery.com/jquery-1.10.1.min.js",
    "http://strd6.github.io/tempest/javascripts/envweb.js?",
    "http://strd6.github.io/require/v0.2.2.js"
  ],
  "progenitor": {
    "url": "http://strd6.github.io/editor/"
  },
  "repository": {
    "id": 13692521,
    "name": "series",
    "full_name": "STRd6/series",
    "owner": {
      "login": "STRd6",
      "id": 18894,
      "avatar_url": "https://0.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045?d=https%3A%2F%2Fidenticons.github.com%2F39df222bffe39629d904e4883eabc654.png",
      "gravatar_id": "33117162fff8a9cf50544a604f60c045",
      "url": "https://api.github.com/users/STRd6",
      "html_url": "https://github.com/STRd6",
      "followers_url": "https://api.github.com/users/STRd6/followers",
      "following_url": "https://api.github.com/users/STRd6/following{/other_user}",
      "gists_url": "https://api.github.com/users/STRd6/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/STRd6/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/STRd6/subscriptions",
      "organizations_url": "https://api.github.com/users/STRd6/orgs",
      "repos_url": "https://api.github.com/users/STRd6/repos",
      "events_url": "https://api.github.com/users/STRd6/events{/privacy}",
      "received_events_url": "https://api.github.com/users/STRd6/received_events",
      "type": "User",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/STRd6/series",
    "description": "Draw a series of data",
    "fork": false,
    "url": "https://api.github.com/repos/STRd6/series",
    "forks_url": "https://api.github.com/repos/STRd6/series/forks",
    "keys_url": "https://api.github.com/repos/STRd6/series/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/STRd6/series/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/STRd6/series/teams",
    "hooks_url": "https://api.github.com/repos/STRd6/series/hooks",
    "issue_events_url": "https://api.github.com/repos/STRd6/series/issues/events{/number}",
    "events_url": "https://api.github.com/repos/STRd6/series/events",
    "assignees_url": "https://api.github.com/repos/STRd6/series/assignees{/user}",
    "branches_url": "https://api.github.com/repos/STRd6/series/branches{/branch}",
    "tags_url": "https://api.github.com/repos/STRd6/series/tags",
    "blobs_url": "https://api.github.com/repos/STRd6/series/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/STRd6/series/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/STRd6/series/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/STRd6/series/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/STRd6/series/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/STRd6/series/languages",
    "stargazers_url": "https://api.github.com/repos/STRd6/series/stargazers",
    "contributors_url": "https://api.github.com/repos/STRd6/series/contributors",
    "subscribers_url": "https://api.github.com/repos/STRd6/series/subscribers",
    "subscription_url": "https://api.github.com/repos/STRd6/series/subscription",
    "commits_url": "https://api.github.com/repos/STRd6/series/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/STRd6/series/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/STRd6/series/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/STRd6/series/issues/comments/{number}",
    "contents_url": "https://api.github.com/repos/STRd6/series/contents/{+path}",
    "compare_url": "https://api.github.com/repos/STRd6/series/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/STRd6/series/merges",
    "archive_url": "https://api.github.com/repos/STRd6/series/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/STRd6/series/downloads",
    "issues_url": "https://api.github.com/repos/STRd6/series/issues{/number}",
    "pulls_url": "https://api.github.com/repos/STRd6/series/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/STRd6/series/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/STRd6/series/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/STRd6/series/labels{/name}",
    "created_at": "2013-10-19T00:10:43Z",
    "updated_at": "2013-10-21T03:00:30Z",
    "pushed_at": "2013-10-21T03:00:30Z",
    "git_url": "git://github.com/STRd6/series.git",
    "ssh_url": "git@github.com:STRd6/series.git",
    "clone_url": "https://github.com/STRd6/series.git",
    "svn_url": "https://github.com/STRd6/series",
    "homepage": null,
    "size": 1684,
    "watchers_count": 0,
    "language": "CoffeeScript",
    "has_issues": true,
    "has_downloads": true,
    "has_wiki": true,
    "forks_count": 0,
    "mirror_url": null,
    "open_issues_count": 0,
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "master_branch": "master",
    "default_branch": "master",
    "permissions": {
      "admin": true,
      "push": true,
      "pull": true
    },
    "network_count": 0,
    "branch": "master",
    "defaultBranch": "master"
  }
});