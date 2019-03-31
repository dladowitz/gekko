/*

  MACD - DJM 31/12/2013

  (updated a couple of times since, check git history)

 */

// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  // keep state about the current trend
  // here, on every new candle we use this
  // state object to check if we need to
  // report it.
  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  // how many candles do we need as a base
  // before we can start giving advice?
  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('macd', 'MACD', this.settings);

  this.armed = false;
}

// what happens on every new candle?
method.update = function(candle) {
  // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
  var digits = 8;
  var macd = this.indicators.macd;

  var diff = macd.diff;
  var signal = macd.signal.result;

  log.debug('calculated MACD properties for candle:');
  log.debug('\t', 'short:', macd.short.result.toFixed(digits));
  log.debug('\t', 'long:', macd.long.result.toFixed(digits));
  log.debug('\t', 'macd:', diff.toFixed(digits));
  log.debug('\t', 'signal:', signal.toFixed(digits));
  log.debug('\t', 'macdiff:', macd.result.toFixed(digits));
}

method.check = function(candle) {
  // check for arming trailing sells
  if(!this.armed && this.position_open && candle.close >= this.arming_price) {
    this.armed = true;
    this.arming_price = candle.close
    this.high_point = this.arming_price
    console.log("-------------------------")
    console.log("Arming at $", this.arming_price)
    this.trailing_sell_price = candle.close * (1 - this.settings.trailing_sell_percent)
    console.log("Trailing sell set to: ", this.trailing_sell_price)
    console.log("-------------------------")
  } else if (this.armed && this.position_open && candle.close > this.high_point) {
    this.high_point = candle.close
    console.log("-------------------------")
    console.log("New high point reached: $", this.high_point)
    this.trailing_sell_price = this.high_point * (1 - this.settings.trailing_sell_percent)
    console.log("New trailing sell set to: ", this.trailing_sell_price)
    console.log("-------------------------")
  } else if (this.armed && this.position_open && candle.close <= this.trailing_sell_price) {
    this.advice('short')
    console.log("-------------------------")
    console.log("Trailing sell hit at: ", candle.close)
    console.log("-------------------------")
    this.position_open = false
    this.armed = false
    this.arming_price = null
    this.high_point = null
    this.trailing_sell_price = null
  }



  var macddiff = this.indicators.macd.result;

  if(macddiff > this.settings.thresholds.up) {

    // new trend detected
    if(this.trend.direction !== 'up')
      // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'up',
        adviced: false
      };

    this.trend.duration++;

    log.debug('In uptrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= this.settings.thresholds.persistence)
      this.trend.persisted = true;

    if(this.trend.persisted && !this.trend.adviced && !this.position_open) {
      this.trend.adviced = true;
      this.advice('long');
      this.position_open = true;
      this.estimated_position_price = candle.close
      console.log("-------------------------")
      console.log("Buying at $", candle.close)
      this.armed = false
      this.arming_price = candle.close * (1 + this.settings.arming_percent)
      console.log("Arming price set to $", this.arming_price)
      console.log("-------------------------")
    } else
      this.advice();

  } else if(macddiff < this.settings.thresholds.down) {

    // new trend detected
    if(this.trend.direction !== 'down')
      // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'down',
        adviced: false
      };

    this.trend.duration++;

    log.debug('In downtrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= this.settings.thresholds.persistence)
      this.trend.persisted = true;

    // Using trailing sells instead
    // if(this.trend.persisted && !this.trend.adviced) {
    //   this.trend.adviced = true;
    //   this.advice('short');
    // } else
    //   this.advice();

  } else {

    log.debug('In no trend');

    // we're not in an up nor in a downtrend
    // but for now we ignore sideways trends
    //
    // read more @link:
    //
    // https://github.com/askmike/gekko/issues/171

    // this.trend = {
    //   direction: 'none',
    //   duration: 0,
    //   persisted: false,
    //   adviced: false
    // };

    this.advice();
  }
}

module.exports = method;
