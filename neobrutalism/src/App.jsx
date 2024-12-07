import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const dark = 'dark';
  const light = 'light';
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? dark : light;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.classList.remove(light, dark);
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const longtime = 25 * 60;
  const shorttime = 5 * 60;
  const [timeIndex, setTimeIndex] = useState(0);
  const timecycle = [longtime, shorttime, longtime, shorttime, longtime, shorttime, longtime, longtime]; // (25+5)*3 + (25+25)
  const [timeLeft, setTimeLeft] = useState(timecycle[timeIndex]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const [isActive, setIsActive] = useState(false);
  const explain = timeIndex % 2 == 1 ? `Break ${timecycle[timeIndex] / 60}min.` : `Task ${timecycle[timeIndex] / 60}min.`

  // Web Speech APIを設定
  const utterance = new SpeechSynthesisUtterance();
  utterance.lang = 'en-US';
  utterance.volume = 1;
  utterance.pitch = 1;
  utterance.rate = 1;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    else if (!isActive && timeLeft == 0) {
      setTimeLeft(timecycle[timeIndex]);
      clearInterval(interval);
    }
    else if (isActive && timeLeft == 0) {
      // Finish時に説明する
      utterance.text = explain + ` Finished`;
      speechSynthesis.speak(utterance);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, timeIndex]);

  const handleStart = () => {
    // Start時に説明する
    utterance.text = explain;
    speechSynthesis.speak(utterance);
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
    if (minutes == 0 && seconds == 0) {
      setTimeIndex(x => x + 1 > timecycle.length - 1 ? 0 : x + 1);
    }
  };

  const handleReset = () => {
    setTimeLeft(timecycle[timeIndex]);
    setIsActive(false);
  };

  return (
    <>
      <header>
        <button className='themebtn' onClick={() => { toggleTheme(theme == dark ? light : dark); }}>🌞/🌛</button>
      </header>
      <main>
        <div className='timer'>{minutes == 0 && seconds == 0 ? `Finish.` : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
        <div className="cycle_expain">
          <div className='count'>
            {timecycle.map((item, index) => (
              <div
                key={index}
                className={timeIndex == index ? (timeIndex % 2 == 1 ? 'timeindex_break' : 'timeindex_task') : 'timecycle'}
                style={{ width: `${item / 60}px` }}
              ></div>
            ))}
          </div>
          <br />
          <span>{explain}</span>
          <br />
          <span>1 cycle is 140min.</span>
        </div>
        {isActive ?
          (<button onClick={() => { handleStop(); }}>STOP</button>)
          : (<button onClick={() => { handleStart(); }}>START</button>)}
        <button onClick={() => { handleReset(); }}>RESET</button>
      </main>
      <footer>
        <span> © 2024 <a href="https://github.com/shisojuice" target="_blank" rel="noopener noreferrer" _mstmutation="1">shisojuice</a> Pomodoro Timer. All rights reserved.</span>
      </footer>
    </>
  )
}

export default App