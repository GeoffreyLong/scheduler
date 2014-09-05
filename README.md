scheduler
=========

<p> Hopefully this readme works </p>

<p>
  Initial Parameters for Events
  <ul>
    <li> name: String </li>
    <li> isRecurring: Boolean -> if true then will need new parameters
    <ul>
      <li> inverval: int -> how often it recurs (in days -- subject to change) </li>
    </ul>
    </li>
    <li> avgDuration: int (prefer Unix format) -> if no high/low then how long event is, if high/low then an estimate </li>
    <li> lowDuration: int (prefer Unix format) -> min time for the event </li>
    <li> highDuration: int (prefer Unix format) -> high estimate for the event </li>
    <li> breakable: boolean -> ie can it be broken into smaller time scales (class would be false but an assignment would be true) </li>
    <li> startDate: Unix time stamp -> start date and time of event </li>
    <li> endDate: Unix time stamp -> end date and time, if project this is the due date, if isRecurring then is the date and time for start of last iteration </li>
    <li> priority: int -> the priority of the event </li>
    <li> type: string -> the category of event (ie. school, fitness, procrastination, extracurricular) </li>
  </ul>
</p>

<p>
  The original iteration will simply consist of the following: name, startDate, avgDuration
</p>
