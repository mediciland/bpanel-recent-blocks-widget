import React, { useEffect, useState } from 'react'
import moment from 'moment';

const ONE_SECOND = 1000

const TimeFromNow = ({
  timestamp
}) => {
  const [ timeString, setTimeString ] = useState(timestamp ? moment.unix(timestamp).fromNow() : timestamp)

  // Every 10 seconds update the time string to change as time continues forward
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeString(timestamp ? moment.unix(timestamp).fromNow() : timestamp)
    }, 10 * ONE_SECOND);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <p className="text-right" style={{marginBottom: 0}}>{timeString !== "Invalid Date" ? timeString : timestamp }</p>
}

export default TimeFromNow