var dur_month = 4

className = `Class`

const startDate = new Date()
startDate.setMonth(startDate.getMonth() - dur_month)
console.log(`Start Searching from ${startDate.toLocaleDateString()}`)

const endDate = new Date()
endDate.setMonth(endDate.getMonth() + dur_month)
console.log(`End Searching from ${endDate.toLocaleDateString()}`)

// Get all reminders and calendar events within a certain time
const reminders = await Reminder.allDueBetween(startDate, endDate)
var certain_reminders = reminders.filter(e=>e.calendar.title == className)
console.log(`Get ${certain_reminders.length} reminders`)

// var calendar = await Calendar.forEvents()
var calendar = await Calendar.forEventsByTitle(className)
const events = await CalendarEvent.between(startDate, endDate, [calendar])
console.log(`Get ${events.length} calendars`)

// To create new event
// var m_dict = {}
// for(cal of [calendar]){
//    m_dict[cal.title] = cal
//    console.log(`Calendar:${cal.title}`)
// }

var reminders_title_set = new Set(certain_reminders.map(e=>e.title))
// console.log(`reminders_title_set: ${reminders_title_set}`)

//var certain_calendars = events.filter(e=>e.notes != null && e.notes.includes('[From reminder]'))
// var certain_calendars = events.filter(e=>e.calendar.title == `Class`)

for(let event of events){
    title = event.title
    // console.log(title.charAt(0))
    if (title.charAt(0) == `✅`) {
        // console.log(`remove ${title.charAt(0)}`)
        title = title.substring(1)
    }
    if(!reminders_title_set.has(title)){
        console.warn(`Remove: ${title}`)
        event.remove()
    }
}

for (const reminder of certain_reminders) {
    // if(!m_dict[reminder.calendar.title]){
    //     console.warn("Can't find calendar "+ reminder.calendar.title)
    //     break
    // }
    // console.log(`Now is: ${reminder.title}`)
    // console.log(`Now is: ${reminder.calendar.title}`)

    // if (reminder.calendar.title != `Class`) {
    //     continue
    // }
    // console.log(`Now is: ${reminder.title}`)

    const targetNote = `${reminder.title}`
    const [targetEvent] = events.filter(e => e.title.includes(targetNote))

    if (targetEvent) {
      console.warn(`Update ${reminder.title} to ${reminder.calendar.title}`)
      createOrUpdateEvent(targetEvent, reminder)
    } else {
      console.warn(`Create ${reminder.title} to ${reminder.calendar.title}`)
      const newEvent = new CalendarEvent()
      createOrUpdateEvent(newEvent, reminder)
    }
  }

Script.complete()



function createOrUpdateEvent(event, reminder) {
    event.calendar = [calendar][0]
    event.notes = `[From reminder]`

    if(reminder.isCompleted){
        event.title = `✅${reminder.title}`
        event.location = `Finished`
    } else {
        const nowtime  = new Date()
        var period = (reminder.dueDate-nowtime)/1000/3600/24
        period = Math.round(period) + 1
        // console.log(`period = ${period}`)
        event.title = `${reminder.title}`
        if(period < 0) {
            event.location = "延" + -period + "天" 
        } else {
            event.location = "剩" + period + "天" 
        }
    }

    let dateFormatter = new DateFormatter()
    dateFormatter.useShortTimeStyle()
    let strDate = dateFormatter.string(reminder.dueDate)
    var ending = new Date(reminder.dueDate)

    if (strDate == '00:00'){
        // console.log(`event doesn't have time`)
        event.isAllDay = true
        event.startDate = reminder.dueDate
        ending.setHours(23)
        ending.setMinutes(59)
        ending.setSeconds(59)
    } else {
        // console.log(`event has time ${strDate}`)
        event.isAllDay = false
        event.startDate = reminder.dueDate
        ending.setHours(ending.getHours()+1)
    }

    event.endDate = ending
    // console.log(`event.startdate: ${event.startDate}`)
    // console.log(`event.enddate: ${event.endDate}`)

    event.save()
}