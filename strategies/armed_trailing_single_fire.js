
// Let's create our own strategy
var strat = {};

// Prepare everything our strat needs
strat.init = function() {
  console.log("\n------------")
  console.log("Initializing Gekko\n")

  settings = this.settings
  this.target_buy_price    = settings.target_buy_price
  this.arming_percent      = settings.arming_percent
  this.buy_direction       = settings.buy_direction
  this.target_arming_price = settings.buy_price * (1 + settings.arming_percent)
  this.trailing_percent    = settings.trailing_percent
  this.sell_at_loss        = settings.sell_at_loss
  this.armed               = settings.armed
  this.position_open       = false


  console.log("target_buy_price:        ", this.target_buy_price)
  console.log("buy_direction:           ", this.buy_direction)
  console.log("arming_percent:          ", this.arming_percent)
  console.log("target_arming_price:     ", this.target_buy_price * (1 + this.arming_percent))
  console.log("trailing_percent:        ", this.trailing_percent)
  console.log("sell_at_loss (unused):   ", this.sell_at_loss)
  console.log("armed:                   ", this.armed)
  console.log("position_open:           ", this.position_open)

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
  // Once we've sold no more action until system is restarted. Need to connect to a notification system
  if(this.cycle_completed) {
    console.log("\n\n\n\n--------------------------------------")
    console.log(`Cycle Complete. Est Profit: $${this.estimated_profit.toFixed(2)}. Est Percent: ${this.estimated_profit_percent.toFixed(4)}%.`)
    throw "stop the world"
  }

  // Randomly print out closing price
  if(Math.random() < 0.001){
    console.log(`candle.close: $${candle.close.toFixed(2)}`)
  }

  if(!this.armed && !this.position_open &&
      ( (this.buy_direction === 'up'   && candle.close > this.target_buy_price) ||
        (this.buy_direction === 'down' && candle.close < this.target_buy_price) ) ) {
    console.log("\n------------")
    this.advice("long")
    this.position_open = true
    console.log("target_buy_price reached. Going long (buying).")

    this.estimated_buy_price = candle.close // this is wrong. Is there any way to get actual buy price?
    console.log(`Setting estimated_buy_price: $${candle.close.toFixed(2)}`)

    this.arming_price = candle.close * (1 + this.arming_percent)
    console.log(`Setting arming_price:        $${this.arming_price.toFixed(2)}`)
    console.log("------------\n")

  } else if (!this.armed && this.position_open && candle.close >= this.arming_price) {
    console.log("\n------------")
    this.armed = true
    console.log("Arming price reached")

    this.high_point = candle.close
    console.log(`Setting high_point at:    $${this.high_point.toFixed(2)}`)

    this.selling_price = this.high_point * (1 - this.trailing_percent)
    console.log(`Setting selling_price at: $${this.selling_price.toFixed(2)}`)

    console.log("------------\n")

  } else if(this.armed && this.position_open && candle.close > this.high_point) {
    console.log("\n------------")
    this.high_point = candle.close
    console.log(`New high_point set:    $${this.high_point.toFixed(2)}`)

    this.selling_price = this.high_point * (1 - this.trailing_percent)
    console.log(`New selling_price set: $${this.selling_price.toFixed(2)}`)
    console.log("------------\n")

  } else if(this.armed && this.position_open && candle.close <= this.selling_price ) {
    console.log("\n------------")
    this.advice("short")
    this.position_open = false
    console.log("selling_price reached. Going short (selling).")

    this.estimated_sell_price = candle.close // this is wrong. Is there any way to get actual buy price?
    console.log(`Setting estimated_sell_price: $${this.estimated_sell_price.toFixed(2)}`)

    this.estimated_profit = this.estimated_sell_price - this.estimated_buy_price
    console.log(`estimated_profit:             $ ${this.estimated_profit.toFixed(2)}`)

    this.estimated_profit_percent = this.estimated_profit / this.estimated_buy_price
    console.log(`\nestimated_profit_percent:         ${this.estimated_profit_percent.toFixed(4)}%`)

    this.cycle_completed = true
    console.log("------------\n")
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
