
// Let's create our own strategy
var strat = {};

// Prepare everything our strat needs
strat.init = function() {
  console.log("\n------------")
  console.log("Initializing Gekko\n")

  settings = this.settings
  this.buy_price        = settings.buy_price
  this.arming_percent   = settings.arming_percent
  this.arming_price     = settings.buy_price * (1 + settings.arming_percent)
  this.trailing_percent = settings.trailing_percent
  this.sell_at_loss     = settings.sell_at_loss
  this.armed            = settings.armed
  this.position_open    = false


  console.log("buy_price:        ", this.buy_price)
  console.log("arming_price:     ", this.arming_price)
  console.log("arming_percent:   ", this.arming_percent)
  console.log("trailing_percent: ", this.trailing_percent)
  console.log("sell_at_loss:     ", this.sell_at_loss)
  console.log("armed:            ", this.armed)
  console.log("------------\n")
}

// What happens on every new candle?
strat.update = function(candle) {
  // your code!
}

// For debugging purposes.
strat.log = function() {
  // your code!
}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function(candle) {
  if(Math.random() < 0.001){
    console.log("Open: ", candle.open)
  }

  if(this.armed) {
    if (candle.open > this.high_point) {
      this.high_point = candle.open
      this.selling_price = this.high_point * (1 - this.trailing_percent)
      console.log("\n------------")
      console.log("New high_point set:    ", this.high_point)
      console.log("New selling_price set: ", this.selling_price)
      console.log("------------\n")
    }
  }


  if(candle.open > this.buy_price && !this.position_open) {
    this.advice("long")
    this.position_open = true
    console.log("Bought at: ", candle.open)
    this.position_price = candle.open // this is totally wrong. need to find purchase price.
    this.arming_price = candle.open * (1 + this.arming_percent)
    console.log("arming_price: ", this.arming_price)

    if(this.armed) {
      this.armed = false
      console.log("Disarming")
    }
  }

  if (this.armed === false && candle.open > this.arming_price && this.position_open) {
    console.log("\n------------")
    console.log("Arming price reached")
    this.armed = true
    this.high_point = this.arming_price
    this.selling_price = this.high_point * (1 - this.trailing_percent)
    console.log("Setting high_point at:    ", this.arming_price)
    console.log("Setting selling_price at: ", this.selling_price)
    console.log("------------\n")
  } else if(this.armed &&   candle.open < this.selling_price && this.position_open) {
    this.advice("short")
    this.position_open = false
    console.log("Selling at: ", candle.open)
  }

}

// Optional for executing code
// after completion of a backtest.
// This block will not execute in
// live use as a live gekko is
// never ending.
strat.end = function() {
  // your code!
}

module.exports = strat;
