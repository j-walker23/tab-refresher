/**
 * @author john
 * @version 12/29/15 6:09 AM
 */

(() => {

  const COUNTDOWN_DELAY = 1000

  class PopupTimer {

    timeoutId = null
    alarm = null

    manager = new TabManager()

    $startRange = $('#start-range')
    $endRange = $('#end-range')
    $refreshVal = $('#refresh-val')
    $startAll = $('#start-all')
    $disableAll = $('#disable-all')
    $startReset = $('#start-reset')
    $intervalVal = $('#interval-val')

    bindEvents () {
      this.$startAll.click(ev => this.onStartAllClick())
      this.$disableAll.click(ev => this.onDisableAllClick())
      this.$startReset.click(ev => this.onStartResetClick())
    }

    checkCurrentRefreshTimer () {
      d('Start checking timer for current tab')
      let _tab
      this.alarm = null
      return this.manager.getActiveTab()
        .then(tab => _tab = tab)
        .then(tab => this.manager.getSavedInterval(tab))
        .then(interval => this.fillInRanges(interval))
        .then(() => this.manager.checkIfExtensionIsOn())
        .then(() => this.manager.getAlarm(_tab))
        .then(alarm => this.parseAlarmTime(alarm))
    }

    fillInRanges (interval) {
      let {start, end} = interval
      d('start', start, end)
      this.$startRange.val(start)
      this.$endRange.val(end)
      return interval
    }

    clearValues () {
      clearTimeout(this.timeoutId)
      this.$refreshVal.text('')
      return this.$intervalVal.text('')
    }

    parseAlarmTime (alarm) {
      d('Parsing Alarm', alarm)
      let {scheduledTime, periodInMinutes} = alarm
      this.$intervalVal.text(`${periodInMinutes}m`)
      let timeSpan = countdown(scheduledTime, new Date().getTime(), countdown.HOURS | countdown.MINUTES | countdown.SECONDS)
      this.$refreshVal.text(timeSpan.toString(4))

      this.timeoutId = setTimeout(() => this.parseAlarmTime(alarm), COUNTDOWN_DELAY)
      return alarm
    }

    onStartAllClick () {
      d('Start All Clicked!')
      return this.manager.saveGlobalSettings()
        .then(() => this.manager.getAllTabs())
        .then(tabs => this.manager.getAllIntervals(tabs))
        .then(tabIntervals => this.manager.createAlarms(tabIntervals))
    }

    onDisableAllClick () {
      return this.manager.disableGlobalSettings()
        .then(() => this.manager.removeAllAlarms())
        .then(() => this.clearValues())
    }

  }

  window.PopupTimer = PopupTimer

})()
