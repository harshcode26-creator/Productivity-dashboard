const DOM = {
    elems: document.querySelectorAll('.elem'),
    fullPages: document.querySelectorAll('.fullElem'),
    backButtons: document.querySelectorAll('.fullElem .back'),

    // Todo
    taskList: document.querySelector('.allTask'),
    taskForm: document.querySelector('.addTask form'),
    taskInput: document.querySelector('#task-input'),
    taskDetails: document.querySelector('.addTask textarea'),
    taskCheck: document.querySelector('#check'),

    // Pomodoro
    timerText: document.querySelector('.pomo-timer h1'),
    startBtn: document.querySelector('.start-timer'),
    pauseBtn: document.querySelector('.pause-timer'),
    resetBtn: document.querySelector('.reset-timer'),
    sessionText: document.querySelector('.session')
}


function navigationModule(onMotivationOpen) {
    DOM.elems.forEach(elem => {
        elem.addEventListener('click', () => {
            DOM.fullPages[elem.id].style.display = 'block'
            if (elem.id == 2) onMotivationOpen()
        })
    })

    DOM.backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.fullPages[btn.id].style.display = 'none'
        })
    })
}



function todoList() {

    const STORAGE_KEY = 'todoTasks'
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

    const taskContainer = document.querySelector('.allTask')
    const form = document.querySelector('.addTask form')
    const titleInput = document.querySelector('#task-input')
    const detailsInput = document.querySelector('.addTask textarea')
    const importantCheck = document.querySelector('#check')

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }

    function renderTasks() {
        taskContainer.innerHTML = ''

        tasks.forEach(task => {
            const taskDiv = document.createElement('div')
            taskDiv.className = 'task'

            taskDiv.innerHTML = `
                <h5>
                    ${task.title}
                    <span class="${task.important}">imp</span>
                </h5>
                <button data-id="${task.id}">Mark as Completed</button>
            `

            taskContainer.appendChild(taskDiv)
        })

        document.querySelectorAll('.task button').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id)
                tasks = tasks.filter(task => task.id !== id)
                saveTasks()
                renderTasks()
            })
        })
    }

    form.addEventListener('submit', e => {
        e.preventDefault()

        if (!titleInput.value.trim()) return

        tasks.push({
            id: Date.now(),
            title: titleInput.value.trim(),
            details: detailsInput.value.trim(),
            important: importantCheck.checked
        })

        saveTasks()
        renderTasks()

        titleInput.value = ''
        detailsInput.value = ''
        importantCheck.checked = false
    })

    renderTasks()
}


function dailyPlanner() {

    const STORAGE_KEY = 'dayPlannerData'
    const plannerContainer = document.querySelector('.day-planner')

    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}

    const hours = Array.from({ length: 18 }, (_, i) => {
        return {
            label: `${6 + i}:00 - ${7 + i}:00`,
            id: i
        }
    })

    plannerContainer.innerHTML = ''

    hours.forEach(hour => {
        const wrapper = document.createElement('div')
        wrapper.className = 'day-planner-time'

        wrapper.innerHTML = `
            <p>${hour.label}</p>
            <input 
                type="text" 
                data-id="${hour.id}" 
                value="${savedData[hour.id] || ''}"
                placeholder="..."
            >
        `

        plannerContainer.appendChild(wrapper)
    })

    plannerContainer.addEventListener('input', e => {
        if (e.target.tagName !== 'INPUT') return

        savedData[e.target.dataset.id] = e.target.value
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData))
    })
}

function motivationModule() {
    const quoteEl = document.querySelector('.motivation-2 h1')
    const authorEl = document.querySelector('.motivation-3 h2')

    return async function fetchQuote() {
        quoteEl.innerHTML = 'Loading...'
        authorEl.innerHTML = ''

        try {
            const res = await fetch('https://api.quotable.io/random')
            const data = await res.json()
            quoteEl.innerHTML = `"${data.content}"`
            authorEl.innerHTML = `- ${data.author}`
        } catch {
            quoteEl.innerHTML = `"Consistency beats motivation."`
            authorEl.innerHTML = '- Unknown'
        }
    }
}



function pomodoroModule() {

    const timer = document.querySelector('.pomo-timer h1')
    const startBtn = document.querySelector('.start-timer')
    const pauseBtn = document.querySelector('.pause-timer')
    const resetBtn = document.querySelector('.reset-timer')
    const session = document.querySelector('.session')

    let state = JSON.parse(localStorage.getItem('pomodoroState')) || {
        isWork: true,
        seconds: 25 * 60
    }

    let interval = null

    function updateUI() {
        const m = Math.floor(state.seconds / 60)
        const s = state.seconds % 60
        timer.innerHTML = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        session.innerHTML = state.isWork ? 'Work Session' : 'Take a Break'
        session.style.backgroundColor = state.isWork ? 'var(--green)' : 'var(--blue)'
    }

    function saveState() {
        localStorage.setItem('pomodoroState', JSON.stringify(state))
    }

    startBtn.addEventListener('click', () => {
        if (interval) return

        interval = setInterval(() => {
            if (state.seconds > 0) {
                state.seconds--
                updateUI()
                saveState()
            } else {
                state.isWork = !state.isWork
                state.seconds = state.isWork ? 25 * 60 : 5 * 60
                updateUI()
                saveState()
            }
        }, 1000)
    })

    pauseBtn.addEventListener('click', () => {
        clearInterval(interval)
        interval = null
        saveState()
    })

    resetBtn.addEventListener('click', () => {
        clearInterval(interval)
        interval = null
        state = { isWork: true, seconds: 25 * 60 }
        saveState()
        updateUI()
    })

    updateUI()
}


function weatherFunctionality() {

    const apiKey = "c164a0d3f5524987be7172440261501"   // keep your real key here
    const city = 'Bhopal'

    const header1Time = document.querySelector('.header1 h1')
    const header1Date = document.querySelector('.header1 h2')
    const header2Temp = document.querySelector('.header2 h2')
    const header2Condition = document.querySelector('.header2 h4')
    const precipitation = document.querySelector('.header2 .precipitation')
    const humidity = document.querySelector('.header2 .humidity')
    const wind = document.querySelector('.header2 .wind')

    async function weatherAPICall() {
        try {
            header2Temp.innerHTML = '--°C'
            header2Condition.innerHTML = 'Loading weather...'

            const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
            )

            if (!response.ok) throw new Error('Weather API failed')

            const data = await response.json()

            header2Temp.innerHTML = `${data.current.temp_c}°C`
            header2Condition.innerHTML = data.current.condition.text
            wind.innerHTML = `Wind: ${data.current.wind_kph} km/h`
            humidity.innerHTML = `Humidity: ${data.current.humidity}%`
            precipitation.innerHTML = `Heat Index: ${data.current.heatindex_c}°C`

        } catch (error) {
            header2Condition.innerHTML = 'Weather unavailable'
            console.error('Weather Error:', error)
        }
    }

    weatherAPICall()

    function timeDate() {
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

        const now = new Date()

        const day = days[now.getDay()]
        const date = now.getDate()
        const month = months[now.getMonth()]
        const year = now.getFullYear()

        let hours = now.getHours()
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        const ampm = hours >= 12 ? 'PM' : 'AM'
        hours = hours % 12 || 12

        header1Date.innerHTML = `${date} ${month}, ${year}`
        header1Time.innerHTML = `${day}, ${hours}:${minutes}:${seconds} ${ampm}`
    }

    setInterval(timeDate, 1000)
}

weatherFunctionality()


function changeTheme() {
    const themeBtn = document.querySelector('.theme')
    const root = document.documentElement

    const themes = [
        {
            pri: '#F8F4E1',
            sec: '#381c0a',
            tri1: '#FEBA17',
            tri2: '#74512D'
        },
        {
            pri: '#F8F4E1',
            sec: '#222831',
            tri1: '#948979',
            tri2: '#393E46'
        },
        {
            pri: '#F1EFEC',
            sec: '#030303',
            tri1: '#D4C9BE',
            tri2: '#123458'
        }
    ]

    let currentTheme = Number(localStorage.getItem('themeIndex')) || 0

    function applyTheme(index) {
        const t = themes[index]
        root.style.setProperty('--pri', t.pri)
        root.style.setProperty('--sec', t.sec)
        root.style.setProperty('--tri1', t.tri1)
        root.style.setProperty('--tri2', t.tri2)
    }

    applyTheme(currentTheme)

    themeBtn.addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % themes.length
        applyTheme(currentTheme)
        localStorage.setItem('themeIndex', currentTheme)
    })
}

const refreshMotivation = motivationModule()

navigationModule(refreshMotivation)
changeTheme()
pomodoroModule()
todoList()
dailyPlanner()
weatherFunctionality()
