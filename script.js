/*
config: {
    hourlyWage: number
    running: boolean
    lastTap: timestamp
    preStartTotal: number
}
*/

config = {
    hourlyWage: 15,
    running: false,
    lastTap: Date.now(),
    preStartTotal: 0
};
if (localStorage.getItem("wagetrack_config")) {
    config = JSON.parse(localStorage.getItem("wagetrack_config"))
}

function toggle() {
    if (!config.running) {
        config.running = true;
        config.lastTap = Date.now();
    } else {
        config.preStartTotal = calculateHoursWorked();
        config.running = false;
        config.lastTap = Date.now();
    }
    saveConfig();
}

function saveConfig() {
    localStorage.setItem("wagetrack_config", JSON.stringify(config));
}

function calculateHoursWorked() {
    if (config.running) {
        return (Date.now()-config.lastTap)/1000/60/60+config.preStartTotal;
    } else {
        return config.preStartTotal;
    }
}

function calculatePayment() {
    return calculateHoursWorked()*config.hourlyWage;
}

function updateTick() {
    if (config.running) {
        button.classList.remove("stopped");
        button.classList.add("running");
        button.innerText = "Stop";
    } else {
        button.classList.add("stopped");
        button.classList.remove("running");
        button.innerText = "Start";
    }
    dollarAmount.innerText = "$" + roundCents(calculatePayment());
    wageAmount.innerText = "$" + roundCents(config.hourlyWage);
}

function roundCents(num) {
    return (Math.floor(num*100)/100).toFixed(2);
}

function loop() {
    requestAnimationFrame(loop);
    updateTick();
}

window.onload = function() {
    doStartupCheck();
    loop();
}

function doStartupCheck() {
    var oldDate = new Date(config.lastTap);
    var newDate = new Date();
    if (newDate.getDate() != oldDate.getDate()) {
        reset();
    }
    saveConfig();
}

function changeWage() {
    var restart = false;
    if (config.running) {
        restart = true;
        toggle();
    }
    var newWage = +roundCents(prompt("Enter your new hourly pay:", roundCents(config.hourlyWage)));
    var multiplier = config.hourlyWage/newWage;
    config.hourlyWage = newWage;
    console.log(multiplier);
    config.preStartTotal *= multiplier;

    if (restart) toggle();
    saveConfig();
}

function reset() {
    config.running = false;
    config.lastTap = 0;
    config.preStartTotal = 0;
}

function changeAmount() {
    var restart = false;
    if (config.running) {
        restart = true;
        toggle();
    }
    var newAmount = prompt("Enter new dollar amount:", roundCents(calculatePayment()));
    if (newAmount === null) {
      newAmount = config.hourlyWage;
    }
    var hours = newAmount / config.hourlyWage;
    config.preStartTotal = hours;
    config.lastTap = Date.now();
    if (restart) toggle();
    saveConfig();
}
