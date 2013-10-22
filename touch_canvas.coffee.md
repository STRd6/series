Touch Canvas
============

A canvas element that reports mouse and touch events in the range [0, 1].

TODO: Add touch event support.

    PixieCanvas = require "pixie-canvas"

A number really close to 1. We should never actually return 1, but move events
may get a little fast and loose with exiting the canvas, so let's play it safe.

    MAX = 0.999999999999

    TouchCanvas = (I={}) ->
      self = PixieCanvas I

      Core(I, self)

      self.include Bindable

      element = self.element()

      active = false
      lastPosition = null

When we click within the canvas set the value for the position we clicked at.

      $(element).on "mousedown", (e) ->
        active = true

        position = localPosition(e)
        self.trigger "touch", position
        lastPosition = position

When the mouse moves apply a change for each x value in the intervening positions.

      $(element).on "mousemove", (e) ->
        if active
          position = localPosition(e)
          self.trigger "move", position, lastPosition
          lastPosition = position

Whenever the mouse button is released, deactivate.

      $(document).on "mouseup", (e) ->
        active = false

      return self

Export

    module.exports = TouchCanvas

Helpers
-------

Local event position.

    localPosition = (e) ->
      $currentTarget = $(e.currentTarget)
      offset = $currentTarget.offset()

      width = $currentTarget.width()
      height = $currentTarget.height()

      Point(
        ((e.pageX - offset.left) / width).clamp(0, MAX)
        ((e.pageY - offset.top) / height).clamp(0, MAX)
      )
